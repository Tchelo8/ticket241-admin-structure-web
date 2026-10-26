import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { differenceInCalendarDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { StatsCard } from '@/components/admin/StatsCard';
import { RecentEventsTable } from '@/components/admin/RecentEventsTable';
import { Calendar, Broadcast, Ticket, Coins, Image } from "@/components/icons";
import { Button } from '@/components/ui/button';
import { obtenirUtilisateur, recuperer } from '@/lib/Transmission';
import { capacite, recette, statut, vendus, type EvenementStructure } from '@/lib/backoffice';
import { dateLongue, fcfaCompact, nombre, pourcentage } from '@/lib/format';

interface PageResponse {
  content: EvenementStructure[];
  totalElements: number;
}

export default function DashboardPage() {
  const [events, setEvents] = useState<EvenementStructure[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const session = useMemo(() => obtenirUtilisateur<{ structureId: number; firstName?: string }>(), []);

  useEffect(() => {
    const chargerEvenements = async () => {
      try {
        const structureId = session?.structureId;

        if (!structureId) {
          setLoading(false);
          return;
        }

        const reponse = await recuperer<PageResponse>(`/api/events/structure/${structureId}?page=0&size=50`);

        if (reponse.succes && reponse.donnees) {
          setEvents(reponse.donnees.content);
          setTotalEvents(reponse.donnees.totalElements);
        }
      } catch (erreur) {
        console.error('Erreur chargement événements:', erreur);
      } finally {
        setLoading(false);
      }
    };

    chargerEvenements();
  }, [session]);

  // Indicateurs calculés à partir des événements reçus
  const publies = events.filter((e) => statut(e) === 'published');
  const brouillons = events.filter((e) => statut(e) === 'draft').length;
  const enValidation = events.filter((e) => statut(e) === 'pending_approval').length;
  const billets = events.reduce((a, e) => a + vendus(e), 0);
  const revenus = events.filter((e) => statut(e) !== 'cancelled').reduce((a, e) => a + recette(e), 0);

  const maintenant = new Date();
  const prochain = publies
    .filter((e) => new Date(e.startDate) >= maintenant)
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate))[0];
  const enVente = publies
    .filter((e) => new Date(e.startDate) >= maintenant)
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate))
    .slice(0, 6);

  const dateline = format(maintenant, 'EEEE d MMMM yyyy', { locale: fr });
  const v = (x: string | number) => (loading ? '…' : x);

  return (
    <div>
      {/* Dateline */}
      <div className="t-dateline-top" />
      <div className="flex flex-wrap justify-between gap-4 py-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink2">
        <span>{dateline}</span>
        <span className="t-num">
          {publies.length} événement{publies.length > 1 ? 's' : ''} en vente · {nombre(billets)} billets
        </span>
      </div>
      <div className="t-dateline-bottom" />

      <div className="mt-6">
        <h1 className="m-0 text-[clamp(32px,4vw,46px)] font-semibold leading-[1.02] tracking-[-0.032em]">
          Bonjour{session?.firstName ? `, ${session.firstName}` : ''}.
        </h1>
        <p className="mt-2 text-base text-ink2">Voici où en sont vos ventes.</p>
      </div>

      {/* Indicateurs */}
      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-4">
        <StatsCard
          title="Événements"
          value={v(totalEvents)}
          subtitle={`${publies.length} publiés · ${brouillons} brouillons`}
          icon={Calendar}
        />
        <StatsCard
          title="En vente"
          value={v(publies.length)}
          subtitle={enValidation ? `${enValidation} en validation` : 'Aucun en validation'}
          icon={Broadcast}
        />
        <StatsCard title="Billets vendus" value={v(nombre(billets))} subtitle="Tous événements confondus" icon={Ticket} />
        <StatsCard title="Revenus bruts" value={v(fcfaCompact(revenus))} subtitle="Avant commission Ticket241" icon={Coins} />
      </div>

      <div className="mt-5 flex flex-wrap items-stretch gap-5">
        {/* Remplissage des événements à venir */}
        <section className="t-card min-w-0 flex-[2_1_520px] p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="t-section-title">Remplissage des événements à venir</h2>
            <span className="t-num text-[13px] text-ink3">{enVente.length} en vente</span>
          </div>
          {enVente.length === 0 ? (
            <p className="mt-6 text-sm text-ink3">{loading ? 'Chargement…' : 'Aucun événement publié à venir.'}</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {enVente.map((e) => {
                const pct = pourcentage(vendus(e), capacite(e));
                return (
                  <li key={e.id}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <Link to={`/admin/events/${e.slug}`} className="min-w-0 truncate font-semibold text-ink no-underline hover:text-acc">
                        {e.name}
                      </Link>
                      <span className="t-num flex-none text-ink2">
                        {nombre(vendus(e))} / {nombre(capacite(e))} · <strong className="text-ink">{pct}%</strong>
                      </span>
                    </div>
                    <div className="t-meter mt-1.5">
                      <span style={{ width: `${pct}%` }} className="origin-left animate-[t-grow_.6s_cubic-bezier(.2,.8,.2,1)_both]" />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Prochain événement */}
        <section className="t-card flex min-w-0 flex-[1_1_300px] flex-col p-5">
          {prochain ? (
            <>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-acc">
                Prochain événement · J-{Math.max(0, differenceInCalendarDays(new Date(prochain.startDate), maintenant))}
              </div>
              <div className="mt-3 aspect-video overflow-hidden rounded-[5px] bg-surf">
                {prochain.coverImageUrl ? (
                  <img src={prochain.coverImageUrl} alt="" className="t-img h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink3">
                    <Image className="h-8 w-8" />
                  </div>
                )}
              </div>
              <h3 className="mt-3 text-[21px] font-semibold leading-tight tracking-[-0.02em]">{prochain.name}</h3>
              <div className="mt-1 text-[13.5px] text-ink2">
                {dateLongue(prochain.startDate)} · {prochain.venueName}
              </div>
              <div className="mt-4 flex justify-between text-[13px]">
                <span className="text-ink2">Remplissage</span>
                <span className="t-num font-semibold">
                  {nombre(vendus(prochain))} / {nombre(capacite(prochain))}
                </span>
              </div>
              <div className="t-meter mt-1.5">
                <span style={{ width: `${pourcentage(vendus(prochain), capacite(prochain))}%` }} />
              </div>
              <div className="flex-1" />
              <Button asChild variant="outline" className="mt-4 h-11">
                <Link to={`/admin/events/${prochain.slug}`} className="no-underline">
                  Voir l’événement
                </Link>
              </Button>
            </>
          ) : (
            <>
              <div className="t-label">Prochain événement</div>
              <p className="mt-3 text-sm text-ink2">
                {loading ? 'Chargement…' : 'Aucun événement publié à venir. Publiez un brouillon pour ouvrir la billetterie.'}
              </p>
              <div className="flex-1" />
              <Button asChild variant="outline" className="mt-4 h-11">
                <Link to="/admin/events" className="no-underline">
                  Voir mes événements
                </Link>
              </Button>
            </>
          )}
        </section>
      </div>

      {/* Événements récents */}
      <div className="mt-5">
        {loading ? (
          <div className="t-card p-12 text-center text-ink3">Chargement des événements…</div>
        ) : (
          <RecentEventsTable events={events.slice(0, 5)} />
        )}
      </div>
    </div>
  );
}
