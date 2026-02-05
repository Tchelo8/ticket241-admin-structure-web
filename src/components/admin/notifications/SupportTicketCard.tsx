 import { MessageSquare, Clock, ChevronRight } from 'lucide-react';
 import { Card, CardContent } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { SupportTicket, supportStatusConfig, supportCategoryConfig } from '@/types/notification';
 import { cn } from '@/lib/utils';
 import { format } from 'date-fns';
 import { fr } from 'date-fns/locale';
 
 interface SupportTicketCardProps {
   ticket: SupportTicket;
   onViewDetails?: (ticket: SupportTicket) => void;
 }
 
 export function SupportTicketCard({ ticket, onViewDetails }: SupportTicketCardProps) {
   const statusConfig = supportStatusConfig[ticket.status];
   const categoryConfig = supportCategoryConfig[ticket.category];
 
   return (
     <Card className="transition-all hover:shadow-md cursor-pointer" onClick={() => onViewDetails?.(ticket)}>
       <CardContent className="p-4">
         <div className="flex items-start justify-between gap-4 mb-3">
           <div className="flex items-center gap-2">
             <span className="text-xs font-mono text-muted-foreground">{ticket.reference}</span>
             <Badge variant="outline" className="text-xs">
               {categoryConfig.label}
             </Badge>
           </div>
           <Badge className={cn('text-xs', statusConfig.color, statusConfig.bgColor, 'border-0')}>
             {statusConfig.label}
           </Badge>
         </div>
         
         <h4 className="font-medium mb-2 line-clamp-1">{ticket.subject}</h4>
         <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
           {ticket.description}
         </p>
         
         <div className="flex items-center justify-between text-xs text-muted-foreground">
           <div className="flex items-center gap-4">
             <span className="flex items-center gap-1">
               <Clock className="h-3 w-3" />
               {format(new Date(ticket.createdAt), 'dd/MM/yyyy', { locale: fr })}
             </span>
             <span className="flex items-center gap-1">
               <MessageSquare className="h-3 w-3" />
               {ticket.messages.length} message{ticket.messages.length > 1 ? 's' : ''}
             </span>
           </div>
           <Button variant="ghost" size="sm" className="h-6 text-xs p-0">
             Voir <ChevronRight className="h-3 w-3 ml-1" />
           </Button>
         </div>
       </CardContent>
     </Card>
   );
 }