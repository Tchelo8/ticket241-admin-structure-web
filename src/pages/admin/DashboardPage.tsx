import { mockEvents, calculateDashboardStats } from '@/data/mockEvents';
import { StatsCard } from '@/components/admin/StatsCard';
import { RecentEventsTable } from '@/components/admin/RecentEventsTable';
import { CalendarDays, FileText, Ticket, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const stats = calculateDashboardStats(mockEvents);
  const recentEvents = mockEvents.slice(0, 5);

  return (
    <div className="p-6 lg:p-8 page-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue ! Voici un aperçu de votre activité.
          </p>
        </div>
        <Link to="/admin/events/create">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" />
            Créer un événement
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total événements"
          value={stats.totalEvents}
          icon={CalendarDays}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Événements publiés"
          value={stats.publishedEvents}
          subtitle={`${stats.draftEvents} brouillons`}
          icon={FileText}
        />
        <StatsCard
          title="Tickets vendus"
          value={stats.totalTicketsSold.toLocaleString('fr-FR')}
          icon={Ticket}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Revenus totaux"
          value={`${(stats.totalRevenue / 1000000).toFixed(1)}M FCFA`}
          icon={TrendingUp}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Recent Events */}
      <RecentEventsTable events={recentEvents} />
    </div>
  );
}
