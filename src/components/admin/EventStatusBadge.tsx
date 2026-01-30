import { EventStatus } from '@/types/event';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EventStatusBadgeProps {
  status: EventStatus;
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
  cancelled: {
    label: 'Annulé',
    className: 'badge-cancelled',
  },
};

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn('font-medium', config.className)}
    >
      {config.label}
    </Badge>
  );
}
