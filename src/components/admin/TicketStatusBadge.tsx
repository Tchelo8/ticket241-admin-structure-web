import { TicketStatus, ticketStatusConfig } from '@/types/ticket';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const config = ticketStatusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn('font-medium', config.className)}
    >
      {config.label}
    </Badge>
  );
}
