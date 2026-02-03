import { useState, useMemo } from 'react';
import { mockTickets } from '@/data/mockTickets';
import { mockEvents } from '@/data/mockEvents';
import { TicketStatusBadge } from '@/components/admin/TicketStatusBadge';
import { TicketStatus } from '@/types/ticket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Ticket, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SalesTrackingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Get unique events for filter
  const eventOptions = useMemo(() => {
    const uniqueEvents = [...new Set(mockTickets.map(t => t.eventId))];
    return uniqueEvents.map(id => {
      const event = mockEvents.find(e => e.uuid === id);
      return { id, title: event?.title || 'Événement inconnu' };
    });
  }, []);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return mockTickets.filter(ticket => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          ticket.buyerName.toLowerCase().includes(query) ||
          ticket.buyerEmail.toLowerCase().includes(query) ||
          ticket.ticketCode.toLowerCase().includes(query) ||
          ticket.eventTitle.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Event filter
      if (selectedEvent !== 'all' && ticket.eventId !== selectedEvent) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && ticket.status !== selectedStatus) {
        return false;
      }

      // Date filter
      const purchaseDate = new Date(ticket.purchaseDate);
      if (startDate && purchaseDate < new Date(startDate)) {
        return false;
      }
      if (endDate && purchaseDate > new Date(endDate + 'T23:59:59')) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedEvent, selectedStatus, startDate, endDate]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredTickets.length;
    const paid = filteredTickets.filter(t => t.status === 'paid').length;
    const used = filteredTickets.filter(t => t.status === 'used').length;
    const unused = filteredTickets.filter(t => t.status === 'unused').length;
    const totalRevenue = filteredTickets.reduce((sum, t) => sum + t.price, 0);

    return { total, paid, used, unused, totalRevenue };
  }, [filteredTickets]);

  return (
    <div className="p-6 lg:p-8 page-transition">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold">Suivi des ventes</h1>
        <p className="text-muted-foreground mt-1">
          Suivez tous les tickets vendus avec une transparence totale
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total tickets</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payés</p>
                <p className="text-2xl font-bold">{stats.paid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-secondary">
                <CheckCircle className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilisés</p>
                <p className="text-2xl font-bold">{stats.used}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenus</p>
                <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nom, email, code ticket..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Event filter */}
            <div>
              <Label>Événement</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Tous les événements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les événements</SelectItem>
                  {eventOptions.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status filter */}
            <div>
              <Label>Statut</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="paid">Payé</SelectItem>
                  <SelectItem value="used">Utilisé</SelectItem>
                  <SelectItem value="unused">Non utilisé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date range */}
            <div>
              <Label>Période</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Liste des tickets</span>
            <Badge variant="secondary">{filteredTickets.length} ticket(s)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Acheteur</TableHead>
                  <TableHead>Événement</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date d'achat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun ticket trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-sm">
                        {ticket.ticketCode}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.buyerName}</p>
                          <p className="text-sm text-muted-foreground">{ticket.buyerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-[200px] truncate">{ticket.eventTitle}</p>
                      </TableCell>
                      <TableCell>{ticket.categoryName}</TableCell>
                      <TableCell className="font-medium">
                        {ticket.price.toLocaleString('fr-FR')} FCFA
                      </TableCell>
                      <TableCell>
                        <TicketStatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(ticket.purchaseDate), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
