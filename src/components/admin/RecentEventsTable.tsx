import { EventStatusBadge } from './EventStatusBadge';
import { Link } from 'react-router-dom';
import { Eye, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
}

interface RecentEventsTableProps {
  events: EventSummary[];
}

export function RecentEventsTable({ events }: RecentEventsTableProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold">Événements récents</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Événement
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Statut
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Vues
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tickets
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.map((event) => (
              <tr key={event.id} className="table-row-hover">
                <td className="px-6 py-4">
                  <Link
                    to={`/admin/events/${event.slug}`}
                    className="flex items-center gap-3 group"
                  >
                    {event.coverImageUrl ? (
                      <img
                        src={event.coverImageUrl}
                        alt={event.name}
                        className="h-12 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-16 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        N/A
                      </div>
                    )}
                    <div>
                      <p className="font-medium group-hover:text-accent transition-colors">
                        {event.name}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.venueName} · {event.cityName}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(event.startDate), 'dd MMM yyyy', { locale: fr })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {/* S'il est renvoyé par l'API publique c'est qu'il est publié */}
                  <EventStatusBadge status="published" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    {event.viewCount.toLocaleString('fr-FR')}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-medium">{event.soldSeats.toLocaleString('fr-FR')}</span>
                  <span className="text-muted-foreground"> / {event.availableSeats.toLocaleString('fr-FR')}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {events.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Aucun événement trouvé.
          </div>
        )}
      </div>
      <div className="px-6 py-4 border-t border-border">
        <Link
          to="/admin/events"
          className="text-sm font-medium text-accent hover:underline"
        >
          Voir tous les événements →
        </Link>
      </div>
    </div>
  );
}