import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RenderRequest {
  document_id: string;
  template_version_id: string;
  field_values: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { document_id, template_version_id, field_values }: RenderRequest = await req.json();

    if (!document_id || !template_version_id) {
      return new Response(
        JSON.stringify({ error: 'document_id y template_version_id son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Obtener la versión del template
    const { data: templateVersion, error: versionError } = await supabase
      .from('template_versions')
      .select('*, pdf_templates(name, file_url, engine)')
      .eq('id', template_version_id)
      .single();

    if (versionError || !templateVersion) {
      return new Response(
        JSON.stringify({ error: 'Versión de template no encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Obtener los campos configurados para esta versión
    const { data: fieldConfigs, error: fieldsError } = await supabase
      .from('template_fields_config')
      .select('*')
      .eq('template_version_id', template_version_id)
      .order('sort_order');

    if (fieldsError) {
      console.error('Error fetching field configs:', fieldsError);
    }

    // 3. Obtener las áreas de firma
    const { data: signatureAreas, error: sigError } = await supabase
      .from('signature_areas')
      .select('*')
      .eq('template_version_id', template_version_id)
      .order('sort_order');

    if (sigError) {
      console.error('Error fetching signature areas:', sigError);
    }

    // 4. Procesar los valores de los campos
    const processedFields = (fieldConfigs || []).map(field => ({
      ...field,
      value: field_values[field.field_key] ?? field.default_value ?? ''
    }));

    // 5. Generar hash SHA-256 del contenido
    const contentToHash = JSON.stringify({
      template_version_id,
      field_values,
      timestamp: new Date().toISOString()
    });
    
    const encoder = new TextEncoder();
    const data = encoder.encode(contentToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha256Hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 6. Generar el documento PDF
    // Por ahora, creamos un objeto con los datos procesados
    // En producción, aquí usaríamos pdf-lib para generar el PDF real
    const documentData = {
      templateName: templateVersion.pdf_templates?.name,
      templateUrl: templateVersion.storage_key || templateVersion.pdf_templates?.file_url,
      fields: processedFields,
      signatureAreas: signatureAreas || [],
      generatedAt: new Date().toISOString(),
      sha256: sha256Hex
    };

    // 7. Actualizar el documento en la base de datos
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        template_version_id,
        field_values,
        sha256_hex: sha256Hex,
        generated_at: new Date().toISOString(),
        metadata: {
          ...documentData,
          field_count: processedFields.length,
          signature_count: (signatureAreas || []).length
        }
      })
      .eq('id', document_id);

    if (updateError) {
      console.error('Error updating document:', updateError);
      return new Response(
        JSON.stringify({ error: 'Error actualizando documento', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Retornar el resultado
    return new Response(
      JSON.stringify({
        success: true,
        document_id,
        sha256_hex: sha256Hex,
        generated_at: documentData.generatedAt,
        field_count: processedFields.length,
        signature_areas_count: (signatureAreas || []).length,
        message: 'Documento procesado exitosamente'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in render-document:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
