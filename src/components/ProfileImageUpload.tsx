
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileImageUploadProps {
  userId: string;
  currentImageUrl?: string;
  fullName?: string;
  onImageUpdate: (imageUrl: string) => void;
}

const ProfileImageUpload = ({ 
  userId, 
  currentImageUrl, 
  fullName, 
  onImageUpdate 
}: ProfileImageUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB.');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor selecciona un archivo de imagen válido.');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onImageUpdate(publicUrl);
      setImagePreview(null);

      toast({
        title: "¡Éxito!",
        description: "Imagen de perfil actualizada correctamente",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: error.message || "Error al subir la imagen",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload file
      handleImageUpload(file);
    }
  };

  const clearPreview = () => {
    setImagePreview(null);
  };

  const getInitials = () => {
    if (!fullName) return 'U';
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="text-center space-y-4">
      <div className="relative inline-block">
        <Avatar className="w-24 h-24 mx-auto">
          <AvatarImage 
            src={imagePreview || currentImageUrl || undefined} 
            alt="Profile" 
          />
          <AvatarFallback className="text-lg">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
        
        {imagePreview && !uploading && (
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
            onClick={clearPreview}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="profile-image" className="cursor-pointer">
          <div className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Camera className="w-4 h-4" />
            <span className="text-sm">
              {uploading ? 'Subiendo...' : 'Cambiar Foto'}
            </span>
          </div>
        </Label>
        <Input
          id="profile-image"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <p className="text-xs text-gray-500">
          JPG, PNG o GIF. Máximo 5MB.
        </p>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
