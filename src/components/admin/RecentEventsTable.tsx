import { Link, useNavigate } from 'react-router-dom';
import { EventStatusBadge } from './EventStatusBadge';
import { Image } from "@/components/icons";
import { capacite, statut, vendus, type EvenementStructure } from '@/lib/backoffice';
import { dateCourte, nombre } from '@/lib/format';

interface RecentEventsTableProps {
  events: EvenementStructure[];
}

const th = 'px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink3';

export function RecentEventsTable({ events }: RecentEventsTableProps) {
  const navigate = useNavigate();

  return (
    <section className="t-card overflow-hidden">
      <div className="flex items-baseline justify-between gap-3 px-5 py-[18px]">
        <h2 className="t-section-title">Événements récents</h2>
        <Link to="/admin/events" className="text-sm font-medium text-acc no-underline hover:underline">
          Voir tous les événements
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr className="bg-surf">
              <th className={`${th} !px-5`}>Événement</th>
              <th className={th}>Date</th>
              <th className={th}>Statut</th>
              <th className={`${th} text-right`}>Vues</th>
              <th className={`${th} !px-5 text-right`}>Billets</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                onClick={() => navigate(`/admin/events/${event.slug}`)}
                className="table-row-hover cursor-pointer border-t border-line"
              >
                <td className="min-w-[280px] px-5 py-3">
                  <div className="flex items-center gap-3">
                    {event.coverImageUrl ? (
                      <img src={event.coverImageUrl} alt="" className="t-img h-10 w-14 flex-none rounded-[3px] object-cover" />
                    ) : (
                      <div className="flex h-10 w-14 flex-none items-center justify-center rounded-[3px] bg-surf text-ink3">
                        <Image className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <Link
                        to={`/admin/events/${event.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block max-w-[260px] truncate text-[15px] font-semibold text-ink no-underline"
                      >
                        {event.name}
                      </Link>
                      <div className="whitespace-nowrap text-[12.5px] text-ink3">
                        {event.venueName} · {event.cityName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm">{dateCourte(event.startDate)}</td>
                <td className="px-3 py-3">
                  <EventStatusBadge status={statut(event)} />
                </td>
                <td className="t-num px-3 py-3 text-right text-sm">{event.viewCount ? nombre(event.viewCount) : '—'}</td>
                <td className="t-num px-5 py-3 text-right text-sm">
                  <span className="font-semibold">{nombre(vendus(event))}</span>
                  <span className="text-ink3"> / {nombre(capacite(event))}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {events.length === 0 && (
          <div className="border-t border-line py-12 text-center text-ink3">Aucun événement pour le moment.</div>
        )}
      </div>
    </section>
  );
}
