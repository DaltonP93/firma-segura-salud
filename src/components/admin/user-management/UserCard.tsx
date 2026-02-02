
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, Building, Calendar, Edit, Trash2 } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  username: string | null;
  phone: string | null;
  company: string | null;
  role: string;
  avatar_url: string | null; // Changed from profile_image_url to match database
  is_active?: boolean | null;
  created_at: string;
  updated_at: string;
}

interface UserCardProps {
  user: Profile;
  onEdit: (user: Profile) => void;
  onDelete: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>
                {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{user.full_name || 'Sin nombre'}</h3>
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role === 'super_admin' ? 'Super Admin' :
                   user.role === 'admin' ? 'Admin' :
                   user.role === 'moderator' ? 'Moderador' : 'Usuario'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {user.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {user.phone}
                  </div>
                )}
                {user.company && (
                  <div className="flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {user.company}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                Creado: {new Date(user.created_at).toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(user)}
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(user.id)}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export type { Profile };
export default UserCard;
