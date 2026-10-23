import { useNavigate, useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { EventStatusBadge } from '@/components/admin/EventStatusBadge';
import { DeleteEventDialog } from '@/components/admin/DeleteEventDialog';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  CreditCard,
  Share2,
  Ticket,
  Globe,
  Phone,
  User,
  Info,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { recuperer, supprimer } from '@/lib/Transmission';

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

// ── Composant ─────────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
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

    chargerEvenement();
  }, [slug]);

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

  // ── États de chargement ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-6 lg:p-8 page-transition">
        <div className="text-center py-24 text-muted-foreground">
          Chargement de l'événement...
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="p-6 lg:p-8 page-transition">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Événement non trouvé</h1>
          <p className="text-muted-foreground mb-6">
            L'événement que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => navigate('/admin/events')}>
            Retour aux événements
          </Button>
        </div>
      </div>
    );
  }

  // ── Calculs ───────────────────────────────────────────────────────────────

  const totalSoldSeats = event.soldSeats ?? 0;
  const ticketProgress = event.totalSeats > 0
    ? (totalSoldSeats / event.totalSeats) * 100
    : 0;

  const revenusEstimes = event.ticketCategories.reduce(
    (acc, cat) => acc + cat.soldSeats * Number(cat.price),
    0
  );

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8 page-transition">

      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/events')}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux événements
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-bold">{event.name}</h1>
              <EventStatusBadge status="published" />
              {event.isFeatured && (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                  À la une
                </span>
              )}
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.venueName} · {event.cityName}, {event.cityCountry}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
            <Link to={`/admin/events/${event.slug}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Image */}
          {event.coverImageUrl ? (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <img
                src={event.coverImageUrl}
                alt={event.name}
                className="w-full h-64 lg:h-80 object-cover"
              />
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border h-64 lg:h-80 flex items-center justify-center text-muted-foreground">
              Aucune image disponible
            </div>
          )}

          {/* Description */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {event.fullDescription}
            </p>
          </div>

          {/* Catégories de tickets */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Catégories de tickets
            </h2>
            <div className="space-y-3">
              {event.ticketCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    {/* Indicateur couleur */}
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.colorCode ?? '#6366f1' }}
                    />
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      {cat.description && (
                        <p className="text-sm text-muted-foreground">{cat.description}</p>
                      )}
                      {cat.benefits && (
                        <p className="text-xs text-muted-foreground mt-1">🎁 {cat.benefits}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{Number(cat.price).toLocaleString('fr-FR')} FCFA</p>
                    <p className="text-sm text-muted-foreground">
                      {cat.soldSeats} / {cat.totalSeats} vendus
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cat.availableSeats} disponibles
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Termes et conditions */}
          {event.termsAndConditions && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5" />
                Termes et conditions
              </h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                {event.termsAndConditions}
              </p>
            </div>
          )}

          {/* Politique d'annulation */}
          {event.cancellationPolicy && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Politique d'annulation</h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                {event.cancellationPolicy}
              </p>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">

          {/* Date & heure */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Date et heure</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">
                    {format(new Date(event.startDate), 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                  {event.endDate && (
                    <p className="text-sm text-muted-foreground">
                      Fin : {format(new Date(event.endDate), 'd MMMM yyyy', { locale: fr })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">
                    {format(new Date(event.startDate), 'HH:mm', { locale: fr })}
                  </p>
                  {event.doorsOpenTime && (
                    <p className="text-sm text-muted-foreground">
                      Portes : {format(new Date(event.doorsOpenTime), 'HH:mm', { locale: fr })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Billetterie globale */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Billetterie</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{totalSoldSeats.toLocaleString('fr-FR')}</span>
                <span className="text-muted-foreground">/ {event.totalSeats.toLocaleString('fr-FR')}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${ticketProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {ticketProgress.toFixed(1)}% des places vendues
              </p>

              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Prix min / max
                  </div>
                  <span className="font-medium text-sm">
                    {Number(event.minPrice).toLocaleString('fr-FR')} – {Number(event.maxPrice).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Revenus estimés
                  </div>
                  <span className="font-bold text-green-600">
                    {revenusEstimes.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Remboursement</span>
                  <span>{event.allowRefund ? `Oui (${event.refundDeadlineDays}j)` : 'Non'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Statistiques</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{event.viewCount.toLocaleString('fr-FR')}</p>
                  <p className="text-sm text-muted-foreground">Vues totales</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Share2 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{event.shareCount.toLocaleString('fr-FR')}</p>
                  <p className="text-sm text-muted-foreground">Partages</p>
                </div>
              </div>
            </div>
          </div>

          {/* Organisateur */}
          {(event.organizerName || event.organizerPhone) && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Organisateur</h3>
              <div className="space-y-3">
                {event.organizerName && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{event.organizerName}</span>
                  </div>
                )}
                {event.organizerPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{event.organizerPhone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paramètres */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Paramètres</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Public
                </span>
                {event.isPublic
                  ? <CheckCircle className="h-4 w-4 text-green-500" />
                  : <XCircle className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">En ligne</span>
                {event.isOnline
                  ? <CheckCircle className="h-4 w-4 text-green-500" />
                  : <XCircle className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Âge minimum</span>
                <span>{event.minAge ? `${event.minAge} ans` : 'Tous publics'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Validation</span>
                <span>{event.validationMode === 'AUTO' ? 'Automatique' : 'Manuelle'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Max tickets/user</span>
                <span>{event.maxTicketsPerUser}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Dialog */}
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