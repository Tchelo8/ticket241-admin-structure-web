import { useNavigate, useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { EventStatusBadge } from '@/components/admin/EventStatusBadge';
import { DeleteEventDialog } from '@/components/admin/DeleteEventDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Send,
  Download,
  Image as ImageIcon,
} from "@/components/icons";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { evenements, recuperer, supprimer } from '@/lib/Transmission';
import { statut } from '@/lib/backoffice';
import { dateLongue, fcfa, fcfaCompact, nombre, pourcentage } from '@/lib/format';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TicketCategory {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  price: number;
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  soldSeats: number;
  displayOrder: number;
  isActive: boolean;
  maxTicketsPerOrder: number;
  benefits: string | null;
  colorCode: string | null;
  hasAvailableSeats: boolean;
}

interface EventDetail {
  id: number;
  uuid: string | null;
  name: string;
  slug: string;
  fullDescription: string;
  category: string;
  categoryDisplayName?: string | null;
  subCategory: string | null;
  startDate: string;
  endDate: string | null;
  doorsOpenTime: string | null;
  saleStartDate: string | null;
  saleEndDate: string | null;
  venueName: string;
  venueAddress: string | null;
  cityId: number;
  cityName: string;
  cityCountry: string;
  venueAccessInfo: string | null;
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  soldSeats: number;
  minPrice: number;
  maxPrice: number;
  structureId: number;
  structureName: string;
  organizerName: string | null;
  organizerPhone: string | null;
  coverImageUrl: string | null;
  status: string | null;
  eventStatus?: string | null;
  isFeatured: boolean;
  isPromoted: boolean;
  isOnline: boolean;
  onlineMeetingUrl: string | null;
  isPublic: boolean;
  isActive: boolean;
  minAge: number | null;
  termsAndConditions: string | null;
  cancellationPolicy: string | null;
  allowRefund: boolean;
  refundDeadlineDays: number;
  maxTicketsPerUser: number;
  viewCount: number;
  favoriteCount: number;
  shareCount: number;
  averageRating: number | null;
  reviewCount: number;
  validationMode: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  ticketCategories: TicketCategory[];
  isSaleOpen: boolean;
  isPastEvent: boolean;
  isSoldOut: boolean;
}

/** Billet vendu, tel que renvoyé par GET /api/tickets/event/{eventId} (TicketSummaryDto) */
interface BilletVendu {
  id: number;
  ticketNumber: string;
  ticketCategoryName: string | null;
  ticketCategoryColor: string | null;
  finalPrice: number | null;
  status: string;
  purchaseDate: string | null;
}

interface PageBillets {
  content: BilletVendu[];
  totalElements: number;
}

const STATUTS_BILLET: Record<string, { label: string; className: string }> = {
  PAID: { label: 'Payé', className: 'bg-accs text-acc' },
  USED: { label: 'Utilisé', className: 'bg-surf text-ink2' },
  RESERVED: { label: 'Réservé', className: 'border border-line2 text-ink' },
  PENDING: { label: 'En attente', className: 'border border-line2 text-ink' },
  REFUNDED: { label: 'Remboursé', className: 'bg-acc2s text-acc2' },
  CANCELLED: { label: 'Annulé', className: 'bg-acc2s text-acc2' },
  EXPIRED: { label: 'Expiré', className: 'bg-surf text-ink3' },
  TRANSFERRED: { label: 'Transféré', className: 'bg-surf text-ink2' },
};

/** Adresse publique du site (facultative) pour « Copier le lien » */
const SITE_PUBLIC = (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.replace(/\/$/, '');

// ── Composant ─────────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [onglet, setOnglet] = useState('overview');
  const [billets, setBillets] = useState<PageBillets | null>(null);
  const [billetsLoading, setBilletsLoading] = useState(false);

  const chargerEvenement = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const reponse = await recuperer<EventDetail>(`/api/events/admin/slug/${slug}`);
      if (reponse.succes && reponse.donnees) {
        setEvent(reponse.donnees);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerEvenement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Acheteurs : chargés à la première ouverture de l'onglet
  useEffect(() => {
    if (onglet !== 'buyers' || !event || billets) return;
    setBilletsLoading(true);
    recuperer<PageBillets>(`/api/tickets/event/${event.id}?page=0&size=100`, { afficherErreur: false })
      .then(({ succes, donnees }) => setBillets(succes && donnees ? donnees : { content: [], totalElements: 0 }))
      .finally(() => setBilletsLoading(false));
  }, [onglet, event, billets]);

  const handleDelete = async () => {
    if (!event?.slug) return;
    setIsDeleting(true);
    try {
      const reponse = await supprimer(`/api/events/${event.slug}`);
      if (reponse.succes) {
        toast.success('Événement supprimé avec succès');
        navigate('/admin/events');
      }
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  /** Publication d'un brouillon : même route et mêmes règles que la publication groupée */
  const handlePublish = async () => {
    if (!event?.uuid) return;
    setConfirmPublish(false);
    setIsPublishing(true);
    try {
      const { succes, donnees, erreur } = await evenements.publierLot([event.uuid]);
      const resultat = donnees?.results?.[0];
      if (succes && resultat?.published) {
        toast.success('Événement publié');
        await chargerEvenement();
      } else {
        toast.error(resultat?.message ?? erreur ?? 'Publication impossible');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const copierLien = async () => {
    if (!event || !SITE_PUBLIC) return;
    try {
      await navigator.clipboard.writeText(`${SITE_PUBLIC}/events/${event.slug}`);
      toast.success('Lien copié');
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  const exporterCsv = () => {
    if (!event || !billets?.content.length) return;
    const lignes = [
      ['Référence', 'Catégorie', 'Prix (FCFA)', 'Statut', 'Date d’achat'],
      ...billets.content.map((b) => [
        b.ticketNumber,
        b.ticketCategoryName ?? '',
        String(Math.round(Number(b.finalPrice ?? 0))),
        STATUTS_BILLET[b.status]?.label ?? b.status,
        b.purchaseDate ? format(new Date(b.purchaseDate), 'dd/MM/yyyy HH:mm') : '',
      ]),
    ];
    const csv = lignes.map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `acheteurs-${event.slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── États de chargement ───────────────────────────────────────────────────

  if (loading) {
    return <div className="py-24 text-center text-ink3">Chargement de l’événement…</div>;
  }

  if (notFound || !event) {
    return (
      <div className="py-16 text-center">
        <h1 className="t-section-title !text-[26px]">Événement introuvable</h1>
        <p className="mb-6 mt-2 text-ink2">L’événement que vous recherchez n’existe pas ou a été supprimé.</p>
        <Button onClick={() => navigate('/admin/events')}>Retour aux événements</Button>
      </div>
    );
  }

  // ── Calculs ───────────────────────────────────────────────────────────────

  const st = statut({ eventStatus: event.eventStatus ?? event.status });
  const estBrouillon = st === 'draft' || st === 'pending_approval';
  const categories = [...(event.ticketCategories ?? [])].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  const vendusTotal = categories.length ? categories.reduce((a, c) => a + (c.soldSeats ?? 0), 0) : event.soldSeats ?? 0;
  const capaciteTotale = event.totalSeats || categories.reduce((a, c) => a + (c.totalSeats ?? 0), 0);
  const pct = pourcentage(vendusTotal, capaciteTotale);
  const revenusEstimes = categories.reduce((acc, cat) => acc + (cat.soldSeats ?? 0) * Number(cat.price), 0);
  const heure = (d?: string | null) => (d ? format(new Date(d), 'HH:mm') : '—');

  const parametres: [string, string][] = [
    ['Visibilité', event.isPublic ? 'Public' : 'Privé'],
    ['Format', event.isOnline ? 'En ligne' : 'Sur place'],
    ['Validation', event.validationMode === 'MANUAL' ? 'Manuelle' : 'Automatique'],
    ['Billets par personne', event.maxTicketsPerUser ? `${event.maxTicketsPerUser} maximum` : '—'],
    ['Âge minimum', event.minAge ? `${event.minAge} ans` : 'Tous publics'],
    ['Remboursement', event.allowRefund ? `Jusqu’à ${event.refundDeadlineDays} j avant` : 'Non'],
  ];

  const kpi = 't-card p-4';
  const kpiValue = 't-num mt-2 text-[26px] font-semibold tracking-[-0.024em]';
  const actionBtn = 'h-[42px] px-3.5 text-sm font-normal bg-card';

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <Link to="/admin/events" className="flex w-fit items-center gap-[7px] text-sm text-ink2 no-underline hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Mes événements
      </Link>

      {/* En-tête */}
      <div className="mt-4 flex flex-wrap items-end gap-6">
        <div className="aspect-[4/3] w-[clamp(160px,22vw,240px)] flex-none overflow-hidden rounded-md bg-surf shadow-shm">
          {event.coverImageUrl ? (
            <img src={event.coverImageUrl} alt="" className="t-img h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-ink3">
              <ImageIcon className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-[1_1_320px]">
          <div className="flex flex-wrap items-center gap-2">
            <EventStatusBadge status={st} />
            <span className="text-[13px] text-ink3">{event.categoryDisplayName ?? event.category}</span>
            {event.isFeatured && <span className="text-[13px] text-acc2">· À la une</span>}
          </div>
          <h1 className="mt-2.5 text-[clamp(30px,3.8vw,46px)] font-semibold leading-[1.04] tracking-[-0.032em] [text-wrap:balance]">
            {event.name}
          </h1>
          <div className="mt-2.5 flex flex-wrap gap-[18px] text-[14.5px] text-ink2">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-acc" />
              {dateLongue(event.startDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-acc" />
              {event.venueName}, {event.cityName}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {SITE_PUBLIC && st === 'published' && (
            <Button variant="outline" onClick={copierLien} className={actionBtn}>
              <LinkIcon className="h-4 w-4" />
              Copier le lien
            </Button>
          )}
          <Button asChild variant="outline" className={actionBtn}>
            <Link to={`/admin/events/${event.slug}/edit`} className="no-underline">
              <Pencil className="h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className={cn(actionBtn, 'border-acc2 bg-transparent text-acc2 hover:bg-acc2s hover:text-acc2')}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
          {estBrouillon && (
            <Button onClick={() => setConfirmPublish(true)} disabled={isPublishing} className="h-[42px] px-4 text-sm">
              <Send className="h-4 w-4" />
              {isPublishing ? 'Publication…' : 'Publier'}
            </Button>
          )}
        </div>
      </div>

      {/* Indicateurs */}
      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3.5">
        <div className={kpi}>
          <div className="t-label">Billets vendus</div>
          <div className={kpiValue}>
            {nombre(vendusTotal)} <span className="text-sm font-normal text-ink3">/ {nombre(capaciteTotale)}</span>
          </div>
          <div className="t-meter mt-2 !h-1">
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className={kpi}>
          <div className="t-label">Revenus bruts</div>
          <div className={kpiValue}>{fcfaCompact(revenusEstimes)}</div>
          <div className="mt-1 text-[12.5px] text-ink3">Avant commission Ticket241</div>
        </div>
        <div className={kpi}>
          <div className="t-label">Vues de la page</div>
          <div className={kpiValue}>{event.viewCount ? nombre(event.viewCount) : '—'}</div>
          <div className="mt-1 text-[12.5px] text-ink3">{nombre(event.shareCount)} partages</div>
        </div>
        <div className={kpi}>
          <div className="t-label">Prix des billets</div>
          <div className={kpiValue}>
            {Number(event.minPrice) === Number(event.maxPrice) ? fcfa(event.minPrice) : `${nombre(event.minPrice)} – ${nombre(event.maxPrice)}`}
          </div>
          <div className="mt-1 text-[12.5px] text-ink3">
            {categories.length} catégorie{categories.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Onglets */}
      <Tabs value={onglet} onValueChange={setOnglet} className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="buyers">Acheteurs</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
        </TabsList>

        {/* Aperçu */}
        <TabsContent value="overview">
          <div className="flex flex-wrap items-start gap-5">
            <section className="t-card min-w-0 flex-[2_1_480px] p-[22px]">
              <h2 className="m-0 text-[19px] font-semibold">Description</h2>
              <p className="mt-2.5 max-w-[680px] whitespace-pre-wrap text-[15.5px] leading-[1.65] text-ink2">
                {event.fullDescription || 'Aucune description.'}
              </p>
              {event.venueAddress && (
                <>
                  <h2 className="mt-[26px] text-[19px] font-semibold">Lieu</h2>
                  <p className="mt-2.5 text-[15px] text-ink2">
                    {event.venueName} — {event.venueAddress}, {event.cityName}
                    {event.venueAccessInfo && <span className="mt-1 block text-ink3">{event.venueAccessInfo}</span>}
                  </p>
                </>
              )}
              {event.termsAndConditions && (
                <>
                  <h2 className="mt-[26px] text-[19px] font-semibold">Conditions</h2>
                  <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-ink2">{event.termsAndConditions}</p>
                </>
              )}
              {event.cancellationPolicy && (
                <>
                  <h2 className="mt-[26px] text-[19px] font-semibold">Politique d’annulation</h2>
                  <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-ink2">{event.cancellationPolicy}</p>
                </>
              )}
            </section>

            <aside className="t-card min-w-0 flex-[1_1_280px] p-[22px]">
              <h2 className="m-0 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink3">Paramètres</h2>
              <div className="mt-2">
                {parametres.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-line py-[11px] text-sm">
                    <span className="text-ink2">{k}</span>
                    <span className="text-right font-semibold">{v}</span>
                  </div>
                ))}
              </div>
              <h2 className="mt-[22px] text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink3">Horaires</h2>
              <div className="flex justify-between border-b border-line py-[11px] text-sm">
                <span className="text-ink2">Ouverture des portes</span>
                <span className="t-num font-semibold">{heure(event.doorsOpenTime)}</span>
              </div>
              <div className="flex justify-between border-b border-line py-[11px] text-sm">
                <span className="text-ink2">Début</span>
                <span className="t-num font-semibold">{heure(event.startDate)}</span>
              </div>
              {event.endDate && (
                <div className="flex justify-between border-b border-line py-[11px] text-sm">
                  <span className="text-ink2">Fin</span>
                  <span className="t-num font-semibold">{dateLongue(event.endDate)}</span>
                </div>
              )}
              {(event.organizerName || event.organizerPhone) && (
                <>
                  <h2 className="mt-[22px] text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink3">Contact sur place</h2>
                  <p className="mt-2 text-sm">
                    {event.organizerName}
                    {event.organizerPhone && <span className="t-num block text-ink2">{event.organizerPhone}</span>}
                  </p>
                </>
              )}
            </aside>
          </div>
        </TabsContent>

        {/* Acheteurs */}
        <TabsContent value="buyers">
          <section className="t-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <h2 className="m-0 text-[19px] font-semibold">
                Billets vendus
                {billets && <span className="t-num ml-2 text-sm font-normal text-ink3">{nombre(billets.totalElements)}</span>}
              </h2>
              <Button variant="outline" size="sm" onClick={exporterCsv} disabled={!billets?.content.length}>
                <Download className="h-4 w-4" />
                Exporter (CSV)
              </Button>
            </div>
            {billetsLoading ? (
              <p className="border-t border-line px-5 py-8 text-center text-[14.5px] text-ink3">Chargement des billets…</p>
            ) : billets?.content.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse">
                  <thead>
                    <tr className="bg-surf text-left text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink3">
                      <th className="px-5 py-2.5 font-semibold">Référence</th>
                      <th className="px-3 py-2.5 font-semibold">Catégorie</th>
                      <th className="px-3 py-2.5 font-semibold">Date d’achat</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Prix</th>
                      <th className="px-5 py-2.5 text-right font-semibold">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billets.content.map((b) => {
                      const s = STATUTS_BILLET[b.status] ?? { label: b.status, className: 'bg-surf text-ink2' };
                      return (
                        <tr key={b.id} className="border-t border-line">
                          <td className="t-num px-5 py-3 text-[13px] tracking-[0.06em] text-ink2">{b.ticketNumber}</td>
                          <td className="px-3 py-3 text-sm">
                            <span className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.ticketCategoryColor ?? 'var(--acc)' }} />
                              {b.ticketCategoryName ?? '—'}
                            </span>
                          </td>
                          <td className="t-num px-3 py-3 text-sm text-ink2">
                            {b.purchaseDate ? format(new Date(b.purchaseDate), 'dd/MM/yyyy · HH:mm') : '—'}
                          </td>
                          <td className="t-num px-3 py-3 text-right text-sm">{fcfa(b.finalPrice)}</td>
                          <td className="px-5 py-3 text-right">
                            <span
                              className={cn(
                                'rounded-pill px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em]',
                                s.className,
                              )}
                            >
                              {s.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="m-0 border-t border-line px-5 py-8 text-center text-[14.5px] text-ink3">
                Aucun billet vendu pour l’instant.
              </p>
            )}
          </section>
        </TabsContent>

        {/* Catégories */}
        <TabsContent value="categories">
          {categories.length === 0 ? (
            <p className="t-card p-8 text-center text-ink3">Aucune catégorie de billets.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-3.5">
              {categories.map((c) => {
                const p = pourcentage(c.soldSeats ?? 0, c.totalSeats ?? 0);
                const restant = Math.max(0, (c.totalSeats ?? 0) - (c.soldSeats ?? 0));
                return (
                  <div key={c.id} className="t-card p-[18px]">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: c.colorCode ?? 'var(--acc)' }} />
                      <span className="flex-1 truncate text-[17px] font-semibold">{c.name}</span>
                      <span className="t-num text-[15px] font-semibold">{fcfa(c.price)}</span>
                    </div>
                    {c.description && <p className="mt-1.5 text-[13px] text-ink3">{c.description}</p>}
                    <div className="t-num mt-3.5 flex justify-between text-[13px] text-ink2">
                      <span>
                        <b className="font-semibold text-ink">{nombre(c.soldSeats)}</b> / {nombre(c.totalSeats)} vendus
                      </span>
                      <span className="text-ink3">{p}%</span>
                    </div>
                    <div className="t-meter mt-1.5">
                      <span style={{ width: `${p}%`, background: c.colorCode ?? undefined }} />
                    </div>
                    <div className="t-num mt-2.5 flex justify-between text-[12.5px] text-ink3">
                      <span>{restant ? `${nombre(restant)} restants` : 'Complet'}</span>
                      <span className="font-semibold text-ink">{fcfa((c.soldSeats ?? 0) * Number(c.price))}</span>
                    </div>
                    {!c.isActive && <p className="mt-2 text-[12.5px] text-acc2">Catégorie désactivée</p>}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation de publication */}
      <AlertDialog open={confirmPublish} onOpenChange={setConfirmPublish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publier « {event.name} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              L’événement sera visible du public et la billetterie ouvrira selon vos dates de vente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish}>Publier</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeleteEventDialog
        event={{ ...event, title: event.name } as any}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
