
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

type TableName = keyof Database['public']['Tables'];

export class BaseService {
  protected tableName: TableName;
  protected toast?: ReturnType<typeof useToast>['toast'];

  constructor(tableName: TableName) {
    this.tableName = tableName;
  }

  protected handleError(error: any, operation: string) {
    console.error(`Error in ${operation}:`, error);
    if (this.toast) {
      this.toast({
        title: "Error",
        description: `Error en ${operation}`,
        variant: "destructive",
      });
    }
    throw error;
  }

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, `obtener ${this.tableName}`);
    }
  }

  async getAll(filters?: Record<string, any>) {
    try {
      let query = supabase.from(this.tableName as any).select('*');
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      this.handleError(error, `obtener ${this.tableName}`);
    }
  }

  async create(data: Partial<BaseEntity>) {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName as any)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      this.handleError(error, `crear ${this.tableName}`);
    }
  }

  async update(id: string, data: Partial<BaseEntity>) {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      this.handleError(error, `actualizar ${this.tableName}`);
    }
  }

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from(this.tableName as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      this.handleError(error, `eliminar ${this.tableName}`);
    }
  }
}
