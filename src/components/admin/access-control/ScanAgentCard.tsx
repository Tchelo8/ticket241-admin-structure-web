import { ScanAgent } from '@/types/accessControl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { MoreVertical, Phone, Clock, Pencil, Trash2, QrCode, CalendarDays } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ScanAgentCardProps {
  agent: ScanAgent;
  eventNames: Record<string, string>;
  onEdit: (agent: ScanAgent) => void;
  onDelete: (agent: ScanAgent) => void;
  onToggleActive: (agent: ScanAgent) => void;
}

export function ScanAgentCard({ agent, eventNames, onEdit, onDelete, onToggleActive }: ScanAgentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center shrink-0">
              <QrCode className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground truncate">{agent.name}</h4>
                <Badge 
                  variant="outline" 
                  className={agent.isActive 
                    ? 'bg-acc/10 text-acc border-acc/20' 
                    : 'bg-muted text-muted-foreground'
                  }
                >
                  {agent.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">PIN: ****</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Switch 
              checked={agent.isActive} 
              onCheckedChange={() => onToggleActive(agent)}
              aria-label="Activer/Désactiver l'agent"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(agent)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(agent)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{agent.phone}</span>
          </div>
          
          <div className="flex items-start gap-2 text-sm">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {agent.assignedEvents.length > 0 ? (
                agent.assignedEvents.map(eventId => (
                  <Badge key={eventId} variant="secondary" className="text-xs">
                    {eventNames[eventId] || eventId}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-xs">Aucun événement assigné</span>
              )}
            </div>
          </div>
          
          {agent.lastActivity && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Dernière activité: {format(agent.lastActivity, 'dd MMM yyyy à HH:mm', { locale: fr })}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
