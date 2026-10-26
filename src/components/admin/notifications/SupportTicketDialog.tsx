 import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Avatar, AvatarFallback } from '@/components/ui/avatar';
 import { SupportTicket, supportStatusConfig, supportCategoryConfig } from '@/types/notification';
 import { cn } from '@/lib/utils';
 import { format } from 'date-fns';
 import { fr } from 'date-fns/locale';
 import { Send, Headphones, User } from "@/components/icons";
 import { useState } from 'react';
 
 interface SupportTicketDialogProps {
   ticket: SupportTicket | null;
   open: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 export function SupportTicketDialog({ ticket, open, onOpenChange }: SupportTicketDialogProps) {
   const [newMessage, setNewMessage] = useState('');
 
   if (!ticket) return null;
 
   const statusConfig = supportStatusConfig[ticket.status];
   const categoryConfig = supportCategoryConfig[ticket.category];
 
   const handleSendMessage = () => {
     if (newMessage.trim()) {
       // TODO: Implement send message
       console.log('Sending message:', newMessage);
       setNewMessage('');
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
         <DialogHeader>
           <div className="flex items-start justify-between gap-4">
             <div>
               <p className="text-xs font-mono text-muted-foreground mb-1">{ticket.reference}</p>
               <DialogTitle className="text-lg">{ticket.subject}</DialogTitle>
             </div>
             <div className="flex items-center gap-2">
               <Badge variant="outline" className="text-xs">
                 {categoryConfig.label}
               </Badge>
               <Badge className={cn('text-xs', statusConfig.color, statusConfig.bgColor, 'border-0')}>
                 {statusConfig.label}
               </Badge>
             </div>
           </div>
         </DialogHeader>
 
         <div className="bg-muted/50 rounded-lg p-3 text-sm">
           <p className="text-muted-foreground">{ticket.description}</p>
           <p className="text-xs text-muted-foreground mt-2">
             Créé le {format(new Date(ticket.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
           </p>
         </div>
 
         <ScrollArea className="flex-1 min-h-[200px] max-h-[300px] pr-4">
           <div className="space-y-4">
             {ticket.messages.map((message) => (
               <div
                 key={message.id}
                 className={cn(
                   'flex gap-3',
                   message.senderType === 'user' && 'flex-row-reverse'
                 )}
               >
                 <Avatar className="h-8 w-8 shrink-0">
                   <AvatarFallback className={cn(
                     message.senderType === 'support' 
                       ? 'bg-primary text-primary-foreground' 
                       : 'bg-secondary'
                   )}>
                     {message.senderType === 'support' ? (
                       <Headphones className="h-4 w-4" />
                     ) : (
                       <User className="h-4 w-4" />
                     )}
                   </AvatarFallback>
                 </Avatar>
                 
                 <div className={cn(
                   'flex-1 max-w-[80%]',
                   message.senderType === 'user' && 'text-right'
                 )}>
                   <div className={cn(
                     'inline-block rounded-lg p-3 text-sm',
                     message.senderType === 'support' 
                       ? 'bg-muted text-left' 
                       : 'bg-primary text-primary-foreground text-left'
                   )}>
                     <p className="font-medium text-xs mb-1">{message.senderName}</p>
                     <p>{message.message}</p>
                   </div>
                   <p className="text-xs text-muted-foreground mt-1">
                     {format(new Date(message.createdAt), 'dd/MM à HH:mm', { locale: fr })}
                   </p>
                 </div>
               </div>
             ))}
           </div>
         </ScrollArea>
 
         {ticket.status !== 'closed' && (
           <div className="flex gap-2 pt-4 border-t">
             <Textarea
               placeholder="Écrire votre message..."
               value={newMessage}
               onChange={(e) => setNewMessage(e.target.value)}
               className="min-h-[80px] resize-none"
             />
             <Button 
               onClick={handleSendMessage} 
               disabled={!newMessage.trim()}
               className="self-end"
             >
               <Send className="h-4 w-4" />
             </Button>
           </div>
         )}
       </DialogContent>
     </Dialog>
   );
 }