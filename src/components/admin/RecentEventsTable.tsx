import { Event } from '@/types/event';
import { EventStatusBadge } from './EventStatusBadge';
import { Link } from 'react-router-dom';
import { Eye, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RecentEventsTableProps {
  events: Event[];
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
              <tr key={event.uuid} className="table-row-hover">
                <td className="px-6 py-4">
                  <Link 
                    to={`/admin/events/${event.uuid}`}
                    className="flex items-center gap-3 group"
                  >
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-12 w-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium group-hover:text-accent transition-colors">
                        {event.title}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(event.date), 'dd MMM yyyy', { locale: fr })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <EventStatusBadge status={event.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    {event.views.toLocaleString('fr-FR')}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-medium">{event.ticketsSold.toLocaleString('fr-FR')}</span>
                  <span className="text-muted-foreground"> / {event.totalSeats.toLocaleString('fr-FR')}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
