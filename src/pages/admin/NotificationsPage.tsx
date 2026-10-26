 import { useState } from 'react';
 import { Bell, MessageSquare, Plus, Filter, Search, CheckCheck } from "@/components/icons";
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Badge } from '@/components/ui/badge';
 import { NotificationCard } from '@/components/admin/notifications/NotificationCard';
 import { SupportTicketCard } from '@/components/admin/notifications/SupportTicketCard';
 import { SupportTicketDialog } from '@/components/admin/notifications/SupportTicketDialog';
 import { CreateTicketDialog } from '@/components/admin/notifications/CreateTicketDialog';
 import { mockNotifications, mockSupportTickets } from '@/data/mockNotifications';
 import { 
   Notification, 
   SupportTicket, 
   NotificationType, 
   SupportTicketStatus,
   notificationTypeConfig,
   supportStatusConfig 
 } from '@/types/notification';
 
 export default function NotificationsPage() {
   const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
   const [searchQuery, setSearchQuery] = useState('');
   const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
   const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | 'all'>('all');
   const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
   const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
   const [createDialogOpen, setCreateDialogOpen] = useState(false);
 
   const unreadCount = notifications.filter(n => !n.read).length;
   const openTicketsCount = mockSupportTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
 
   const handleMarkAsRead = (id: string) => {
     setNotifications(prev =>
       prev.map(n => n.id === id ? { ...n, read: true } : n)
     );
   };
 
   const handleMarkAllAsRead = () => {
     setNotifications(prev => prev.map(n => ({ ...n, read: true })));
   };
 
   const filteredNotifications = notifications.filter(n => {
     const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.message.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesType = typeFilter === 'all' || n.type === typeFilter;
     return matchesSearch && matchesType;
   });
 
   const filteredTickets = mockSupportTickets.filter(t => {
     const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
     return matchesSearch && matchesStatus;
   });
 
   const handleViewTicket = (ticket: SupportTicket) => {
     setSelectedTicket(ticket);
     setTicketDialogOpen(true);
   };
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
           <h1 className="text-2xl md:text-3xl font-bold">Centre de notifications</h1>
           <p className="text-muted-foreground mt-1">
             Gérez vos notifications et demandes de support
           </p>
         </div>
         <Button onClick={() => setCreateDialogOpen(true)} className="shrink-0">
           <Plus className="h-4 w-4 mr-2" />
           Nouvelle demande
         </Button>
       </div>
 
       {/* Stats */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-primary/10">
                 <Bell className="h-5 w-5 text-primary" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{unreadCount}</p>
                 <p className="text-xs text-muted-foreground">Non lues</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-secondary">
                 <MessageSquare className="h-5 w-5 text-primary" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{openTicketsCount}</p>
                 <p className="text-xs text-muted-foreground">Tickets ouverts</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-muted">
                 <CheckCheck className="h-5 w-5 text-muted-foreground" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{notifications.length}</p>
                 <p className="text-xs text-muted-foreground">Total notifications</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-accent">
                 <Filter className="h-5 w-5 text-accent-foreground" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{mockSupportTickets.length}</p>
                 <p className="text-xs text-muted-foreground">Total tickets</p>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Tabs */}
       <Tabs defaultValue="notifications" className="space-y-4">
         <TabsList className="w-full sm:w-auto">
           <TabsTrigger value="notifications" className="flex-1 sm:flex-none">
             <Bell className="h-4 w-4 mr-2" />
             Notifications
             {unreadCount > 0 && (
               <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs justify-center">
                 {unreadCount}
               </Badge>
             )}
           </TabsTrigger>
           <TabsTrigger value="support" className="flex-1 sm:flex-none">
             <MessageSquare className="h-4 w-4 mr-2" />
             Support
             {openTicketsCount > 0 && (
               <Badge className="ml-2 h-5 w-5 p-0 text-xs justify-center">
                 {openTicketsCount}
               </Badge>
             )}
           </TabsTrigger>
         </TabsList>
 
         {/* Notifications Tab */}
         <TabsContent value="notifications" className="space-y-4">
           <Card>
             <CardHeader className="pb-3">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                 <CardTitle className="text-lg">Toutes les notifications</CardTitle>
                 {unreadCount > 0 && (
                   <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                     <CheckCheck className="h-4 w-4 mr-2" />
                     Tout marquer comme lu
                   </Button>
                 )}
               </div>
             </CardHeader>
             <CardContent className="space-y-4">
               {/* Filters */}
               <div className="flex flex-col sm:flex-row gap-3">
                 <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input
                     placeholder="Rechercher..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-10"
                   />
                 </div>
                 <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as NotificationType | 'all')}>
                   <SelectTrigger className="w-full sm:w-[180px]">
                     <SelectValue placeholder="Type" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">Tous les types</SelectItem>
                     {Object.entries(notificationTypeConfig).map(([key, config]) => (
                       <SelectItem key={key} value={key}>{config.label}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
 
               {/* Notifications List */}
               <div className="space-y-3">
                 {filteredNotifications.length > 0 ? (
                   filteredNotifications.map((notification) => (
                     <NotificationCard
                       key={notification.id}
                       notification={notification}
                       onMarkAsRead={handleMarkAsRead}
                     />
                   ))
                 ) : (
                   <div className="text-center py-8 text-muted-foreground">
                     <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                     <p>Aucune notification trouvée</p>
                   </div>
                 )}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Support Tab */}
         <TabsContent value="support" className="space-y-4">
           <Card>
             <CardHeader className="pb-3">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                 <CardTitle className="text-lg">Demandes de support</CardTitle>
                 <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                   <Plus className="h-4 w-4 mr-2" />
                   Nouvelle demande
                 </Button>
               </div>
             </CardHeader>
             <CardContent className="space-y-4">
               {/* Filters */}
               <div className="flex flex-col sm:flex-row gap-3">
                 <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input
                     placeholder="Rechercher un ticket..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-10"
                   />
                 </div>
                 <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SupportTicketStatus | 'all')}>
                   <SelectTrigger className="w-full sm:w-[180px]">
                     <SelectValue placeholder="Statut" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">Tous les statuts</SelectItem>
                     {Object.entries(supportStatusConfig).map(([key, config]) => (
                       <SelectItem key={key} value={key}>{config.label}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
 
               {/* Tickets Grid */}
               <div className="grid gap-3 sm:grid-cols-2">
                 {filteredTickets.length > 0 ? (
                   filteredTickets.map((ticket) => (
                     <SupportTicketCard
                       key={ticket.id}
                       ticket={ticket}
                       onViewDetails={handleViewTicket}
                     />
                   ))
                 ) : (
                   <div className="col-span-2 text-center py-8 text-muted-foreground">
                     <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                     <p>Aucun ticket trouvé</p>
                   </div>
                 )}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
 
       {/* Dialogs */}
       <SupportTicketDialog
         ticket={selectedTicket}
         open={ticketDialogOpen}
         onOpenChange={setTicketDialogOpen}
       />
       <CreateTicketDialog
         open={createDialogOpen}
         onOpenChange={setCreateDialogOpen}
       />
     </div>
   );
 }