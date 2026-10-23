import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { MoreVertical, Mail, Phone, Calendar, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ── Type aligné sur la réponse de /api/auth/structure/{id}/users ─
export interface StructureUser {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  enabled: boolean;
  roles: string[];
  structureId: number;
  createdAt: string;
  updatedAt: string;
}

// ── Mapping rôle API → libellé + couleur badge ────────────────
const ROLE_CONFIG: Record<string, { label: string; description: string; color: string }> = {
  ROLE_STRUCTURE_ADMIN: {
    label: 'Accès administrateur global',
    description: 'Accès complet au tableau de bord',
    color: 'bg-primary/10 text-primary border-primary/20',
  },
  ROLE_ADMIN: {
    label: 'Administrateur',
    description: 'Accès administrateur global',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
  ROLE_USER: {
    label: 'Utilisateur',
    description: 'Accès standard',
    color: 'bg-muted text-muted-foreground',
  },
};

const getRoleConfig = (role: string) =>
  ROLE_CONFIG[role] ?? {
    label: role.replace('ROLE_', '').replace(/_/g, ' '),
    description: '',
    color: 'bg-muted text-muted-foreground',
  };

// ── Initiales ──────────────────────────────────────────────────
const initiales = (u: StructureUser) =>
  `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();

// ── Props ──────────────────────────────────────────────────────
interface TeamMemberCardProps {
  member: StructureUser;
  onEdit: (member: StructureUser) => void;
  onDelete: (member: StructureUser) => void;
  onToggleActive: (member: StructureUser) => void;
}

export function TeamMemberCard({ member, onEdit, onDelete, onToggleActive }: TeamMemberCardProps) {
  const premierRole = member.roles?.[0] ?? '';
  const roleConfig  = getRoleConfig(premierRole);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">

        {/* Ligne principale : avatar + nom + rôle + switch + menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Avatar initiales */}
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">
                {initiales(member)}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-foreground truncate">
                  {member.firstName} {member.lastName}
                </h4>
                {premierRole && (
                  <Badge variant="outline" className={`${roleConfig.color} text-xs`}>
                    {roleConfig.label}
                  </Badge>
                )}
              </div>
              {roleConfig.description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {roleConfig.description}
                </p>
              )}
            </div>
          </div>

          {/* Switch + menu */}
          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={member.enabled}
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

        {/* Infos secondaires */}
        <div className="mt-3 pt-3 border-t space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{member.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{member.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>
              Ajouté le {format(new Date(member.createdAt), 'dd MMM yyyy', { locale: fr })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}