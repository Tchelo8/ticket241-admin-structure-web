import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/admin/StatsCard';
import { RecentEventsTable } from '@/components/admin/RecentEventsTable';
import { CalendarDays, FileText, Ticket, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { obtenirUtilisateur, recuperer } from '@/lib/Transmission';

interface EventSummary {
  id: number;
  uuid: string | null;
  name: string;
  slug: string;
  startDate: string;
  venueName: string;
  cityName: string;
  coverImageUrl: string | null;
  soldSeats: number;
  availableSeats: number;
  viewCount: number;
  minPrice: number;
  maxPrice: number;
}

interface PageResponse {
  content: EventSummary[];
  totalElements: number;
}

interface DashboardStats {
  totalEvents: number;
  totalTicketsSold: number;
  totalAvailableSeats: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalAvailableSeats: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const chargerEvenements = async () => {
      try {
        const utilisateur = obtenirUtilisateur<{ structureId: number }>();
        const structureId = utilisateur?.structureId;

        if (!structureId) {
          setLoading(false);
          return;
        }

        const reponse = await recuperer<PageResponse>(`/api/events/structure/${structureId}?page=0&size=50`);

        if (reponse.succes && reponse.donnees) {
          const liste = reponse.donnees.content;
          setEvents(liste);

          // Calculer les stats depuis les données reçues
          const totalTicketsSold = liste.reduce((acc, e) => acc + e.soldSeats, 0);
          const totalAvailableSeats = liste.reduce((acc, e) => acc + e.availableSeats, 0);
          const totalRevenue = liste.reduce((acc, e) => acc + (e.soldSeats * e.minPrice), 0);

          setStats({
            totalEvents: reponse.donnees.totalElements,
            totalTicketsSold,
            totalAvailableSeats,
            totalRevenue,
          });
        }
      } catch (erreur) {
        console.error('Erreur chargement événements:', erreur);
      } finally {
        setLoading(false);
      }
    };

    chargerEvenements();
  }, []);

  const recentEvents = events.slice(0, 5);

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
          value={loading ? '...' : stats.totalEvents}
          icon={CalendarDays}
        />
        <StatsCard
          title="Événements publiés"
          value={loading ? '...' : stats.totalEvents}
          subtitle="Tous publiés"
          icon={FileText}
        />
        <StatsCard
          title="Tickets vendus"
          value={loading ? '...' : stats.totalTicketsSold.toLocaleString('fr-FR')}
          icon={Ticket}
        />
        <StatsCard
          title="Revenus estimés"
          value={loading ? '...' : `${(stats.totalRevenue / 1000000).toFixed(1)}M FCFA`}
          icon={TrendingUp}
        />
      </div>

      {/* Recent Events */}
      {loading ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
          Chargement des événements...
        </div>
      ) : (
        <RecentEventsTable events={recentEvents} />
      )}
    </div>
  );
}