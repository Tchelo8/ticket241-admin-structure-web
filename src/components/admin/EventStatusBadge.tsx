import { EventStatus } from '@/types/event';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EventStatusBadgeProps {
  status: EventStatus | string;
}

const statusConfig: Record<EventStatus, { label: string; className: string }> = {
  published: {
    label: 'Publié',
    className: 'badge-published',
  },
  draft: {
    label: 'Brouillon',
    className: 'badge-draft',
  },
  pending_approval: {
    label: 'En attente',
    className: 'badge-draft',
  },
  cancelled: {
    label: 'Annulé',
    className: 'badge-cancelled',
  },
  completed: {
    label: 'Terminé',
    className: '',
  },
};

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  // Repli sur le statut brut si le backend en renvoie un inconnu du front
  const config =
    statusConfig[status.toLowerCase() as EventStatus] ?? { label: status, className: '' };

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.className)}
    >
      {config.label}
    </Badge>
  );
}
