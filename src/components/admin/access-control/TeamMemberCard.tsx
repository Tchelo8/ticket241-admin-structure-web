import { TeamMember, TEAM_ROLES } from '@/types/accessControl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { MoreVertical, Mail, Phone, Clock, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
  onToggleActive: (member: TeamMember) => void;
}

export function TeamMemberCard({ member, onEdit, onDelete, onToggleActive }: TeamMemberCardProps) {
  const roleConfig = TEAM_ROLES[member.role];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">
                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-foreground truncate">{member.name}</h4>
                <Badge variant="outline" className={`${roleConfig.color} text-xs`}>
                  {roleConfig.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{roleConfig.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Switch 
              checked={member.isActive} 
              onCheckedChange={() => onToggleActive(member)}
              aria-label="Activer/Désactiver le membre"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(member)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(member)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{member.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{member.phone}</span>
          </div>
          {member.lastLogin && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Dernière connexion: {format(member.lastLogin, 'dd MMM yyyy à HH:mm', { locale: fr })}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
