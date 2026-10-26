 import { Bell, CalendarDays, CreditCard, Info, AlertTriangle, ChevronRight } from "@/components/icons";
 import { Card, CardContent } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { Notification, notificationTypeConfig } from '@/types/notification';
 import { cn } from '@/lib/utils';
 import { format } from 'date-fns';
 import { fr } from 'date-fns/locale';
 
 interface NotificationCardProps {
   notification: Notification;
   onMarkAsRead?: (id: string) => void;
 }
 
 const iconMap = {
   event: CalendarDays,
   sales: CreditCard,
   payment: CreditCard,
   system: AlertTriangle,
   info: Info,
 };
 
 export function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
   const config = notificationTypeConfig[notification.type];
   const Icon = iconMap[notification.type];
 
   return (
     <Card className={cn(
       'transition-all hover:shadow-md',
       !notification.read && 'border-l-4 border-l-primary bg-primary/5'
     )}>
       <CardContent className="p-4">
         <div className="flex items-start gap-4">
           <div className={cn('p-2 rounded-lg', config.bgColor)}>
             <Icon className={cn('h-5 w-5', config.color)} />
           </div>
           
           <div className="flex-1 min-w-0">
             <div className="flex items-start justify-between gap-2 mb-1">
               <div className="flex items-center gap-2 flex-wrap">
                 <h4 className={cn(
                   'font-medium',
                   !notification.read && 'font-semibold'
                 )}>
                   {notification.title}
                 </h4>
                 <Badge variant="outline" className={cn('text-xs', config.color, config.bgColor)}>
                   {config.label}
                 </Badge>
               </div>
               <span className="text-xs text-muted-foreground whitespace-nowrap">
                 {format(new Date(notification.createdAt), 'dd MMM à HH:mm', { locale: fr })}
               </span>
             </div>
             
             <p className="text-sm text-muted-foreground mb-2">
               {notification.message}
             </p>
             
             {notification.eventName && (
               <span className="text-xs text-muted-foreground">
                 📍 {notification.eventName}
               </span>
             )}
             
             <div className="flex items-center justify-between mt-2">
               {!notification.read && onMarkAsRead && (
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => onMarkAsRead(notification.id)}
                   className="text-xs h-7"
                 >
                   Marquer comme lu
                 </Button>
               )}
               
               {notification.actionUrl && (
                 <Button variant="link" size="sm" className="ml-auto text-xs h-7 p-0">
                   Voir plus <ChevronRight className="h-3 w-3 ml-1" />
                 </Button>
               )}
             </div>
           </div>
         </div>
       </CardContent>
     </Card>
   );
 }