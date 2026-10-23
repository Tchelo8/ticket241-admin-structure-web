import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { EventStatusBadge } from '@/components/admin/EventStatusBadge';
import { DeleteEventDialog } from '@/components/admin/DeleteEventDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  recuperer,
  supprimer,
  obtenirUtilisateur,
  evenements,
  MAX_PUBLICATION_LOT,
} from '@/lib/Transmission';

// ── Types ─────────────────────────────────────────────────────────────────────

interface EventSummary {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  startDate: string;
  venueName: string;
  cityName: string;
  coverImageUrl: string | null;
  soldSeats: number;
  availableSeats: number;
  viewCount: number;
  eventStatus: string | null;
}

interface PageResponse {
  content: EventSummary[];
  totalElements: number;
  totalPages: number;
  number: number;
}

interface SessionUtilisateur {
  structureId: number;
  roles?: string[];
}

const ITEMS_PER_PAGE = 5;

/** Seuls ces statuts sont acceptés par POST /api/events/publish-batch */
const STATUTS_PUBLIABLES = ['DRAFT', 'PENDING_APPROVAL'];

const estPubliable = (event: EventSummary) =>
  STATUTS_PUBLIABLES.includes((event.eventStatus ?? '').toUpperCase());

const MESSAGE_STRUCTURE_NON_VERIFIEE =
  'Votre structure doit être vérifiée par Ticket241 avant de pouvoir publier un événement';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EventsListPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventToDelete, setEventToDelete] = useState<EventSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Publication groupée
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [confirmPublication, setConfirmPublication] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [refus, setRefus] = useState<Record<string, { name: string | null; message: string }>>({});
  const [structureVerifiee, setStructureVerifiee] = useState<boolean | null>(null);

  const session = useMemo(() => obtenirUtilisateur<SessionUtilisateur>(), []);
  const estAdminTicket241 = session?.roles?.includes('ROLE_ADMIN') ?? false;

  // ── Chargement des événements de la structure ─────────────────────────────

  const chargerEvenements = useCallback(async () => {
    setLoading(true);
    try {
      const structureId = session?.structureId;

      if (!structureId) {
        setLoading(false);
        return;
      }

      const reponse = await recuperer<PageResponse>(
        `/api/events/structure/${structureId}?page=0&size=100`
      );

      if (reponse.succes && reponse.donnees) {
        const liste = reponse.donnees.content;
        setEvents(liste);
        setTotalElements(reponse.donnees.totalElements);
        // On ne garde cochés que les événements encore publiables
        const publiables = new Set(liste.filter(estPubliable).map((e) => e.uuid));
        setSelection((prev) => new Set([...prev].filter((u) => publiables.has(u))));
      }
    } catch (erreur) {
      console.error('Erreur chargement événements:', erreur);
      toast.error('Impossible de charger les événements');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    chargerEvenements();
  }, [chargerEvenements]);

  // ── Vérification de la structure (seul l'admin Ticket241 peut s'en passer) ─

  useEffect(() => {
    if (estAdminTicket241 || !session?.structureId) return;
    recuperer<{ isVerified: boolean }>(`/api/events/structures/${session.structureId}`, {
      afficherErreur: false,
    }).then(({ succes, donnees }) => {
      setStructureVerifiee(succes && donnees ? !!donnees.isVerified : null);
    });
  }, [estAdminTicket241, session]);

  // ── Filtrage côté front ───────────────────────────────────────────────────

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.cityName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (event.eventStatus ?? 'PUBLISHED').toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

  // ── Pagination côté front ─────────────────────────────────────────────────

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ── Sélection pour la publication groupée ─────────────────────────────────

  const publiablesFiltres = useMemo(
    () => filteredEvents.filter(estPubliable),
    [filteredEvents]
  );

  const toutSelectionne =
    publiablesFiltres.length > 0 && publiablesFiltres.every((e) => selection.has(e.uuid));

  const basculerSelection = (uuid: string, coche: boolean) => {
    setSelection((prev) => {
      const suivant = new Set(prev);
      if (coche) suivant.add(uuid);
      else suivant.delete(uuid);
      return suivant;
    });
  };

  const basculerTout = (coche: boolean) => {
    setSelection((prev) => {
      const suivant = new Set(prev);
      publiablesFiltres.forEach((e) => (coche ? suivant.add(e.uuid) : suivant.delete(e.uuid)));
      return suivant;
    });
  };

  const nbSelection = selection.size;
  const bloqueParVerification = !estAdminTicket241 && structureVerifiee === false;
  const boutonPublierDesactive =
    nbSelection === 0 ||
    nbSelection > MAX_PUBLICATION_LOT ||
    bloqueParVerification ||
    isPublishing;

  const raisonDesactivation = bloqueParVerification
    ? MESSAGE_STRUCTURE_NON_VERIFIEE
    : nbSelection > MAX_PUBLICATION_LOT
    ? `${MAX_PUBLICATION_LOT} événements au maximum par publication`
    : nbSelection === 0
    ? 'Cochez au moins un brouillon à publier'
    : null;

  // ── Publication groupée ───────────────────────────────────────────────────

  const handlePublierSelection = async () => {
    const eventUuids = [...selection];
    setConfirmPublication(false);
    setIsPublishing(true);
    try {
      const { succes, donnees, erreur, erreursChamps, codeStatut } =
        await evenements.publierLot(eventUuids);

      if (!succes || !donnees) {
        // 401 : la déconnexion est déjà gérée par Transmission
        if (codeStatut === 401) return;
        const details = erreursChamps ? Object.values(erreursChamps).join(' · ') : undefined;
        toast.error(
          codeStatut === 503
            ? 'Service indisponible, veuillez réessayer dans un instant'
            : erreur ?? 'Erreur lors de la publication',
          { description: details ?? 'Aucun événement n\'a été publié.' }
        );
        return;
      }

      const nouveauxRefus: typeof refus = {};
      donnees.results.forEach((r) => {
        if (!r.published) nouveauxRefus[r.uuid] = { name: r.name, message: r.message };
      });
      setRefus(nouveauxRefus);

      const synthese =
        `${donnees.published} publié${donnees.published > 1 ? 's' : ''}, ` +
        `${donnees.refused} refusé${donnees.refused > 1 ? 's' : ''}`;
      if (donnees.refused === 0) toast.success(synthese);
      else if (donnees.published === 0) toast.error(synthese);
      else toast.warning(synthese);

      setSelection(new Set());
      await chargerEvenements();
    } finally {
      setIsPublishing(false);
    }
  };

  // Refus dont l'événement n'est plus dans la liste (introuvable, autre structure…)
  const refusHorsListe = Object.entries(refus).filter(
    ([uuid]) => !events.some((e) => e.uuid === uuid)
  );

  // ── Suppression ───────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      const reponse = await supprimer(`/api/events/delete/${eventToDelete.slug}`);
      if (reponse.succes) {
        setEvents((prev) => prev.filter((e) => e.slug !== eventToDelete.slug));
        setEventToDelete(null);
        toast.success('Événement supprimé avec succès');
      }
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8 page-transition">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Mes événements</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? '...' : `${totalElements} événement${totalElements !== 1 ? 's' : ''} au total`}
          </p>
        </div>
        <Link to="/admin/events/create">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" />
            Créer un événement
          </Button>
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un événement..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="PUBLISHED">Publié</SelectItem>
              <SelectItem value="DRAFT">Brouillon</SelectItem>
              <SelectItem value="PENDING_APPROVAL">En attente</SelectItem>
              <SelectItem value="CANCELLED">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Compteur résultats + publication groupée */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredEvents.length} événement{filteredEvents.length !== 1 ? 's' : ''} trouvé{filteredEvents.length !== 1 ? 's' : ''}
        </p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* span : un bouton désactivé ne déclenche pas l'info-bulle */}
              <span tabIndex={boutonPublierDesactive ? 0 : -1}>
                <Button
                  onClick={() => setConfirmPublication(true)}
                  disabled={boutonPublierDesactive}
                  className="w-full sm:w-auto"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isPublishing ? 'Publication...' : `Publier la sélection (${nbSelection})`}
                </Button>
              </span>
            </TooltipTrigger>
            {raisonDesactivation && !isPublishing && (
              <TooltipContent className="max-w-xs">{raisonDesactivation}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Refus sans ligne correspondante dans la liste */}
      {refusHorsListe.length > 0 && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive space-y-1">
          {refusHorsListe.map(([uuid, { name, message }]) => (
            <p key={uuid} className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {name ? `${name} : ${message}` : message}
            </p>
          ))}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="pl-6 py-4 w-10">
                  <Checkbox
                    checked={toutSelectionne}
                    onCheckedChange={(v) => basculerTout(v === true)}
                    disabled={publiablesFiltres.length === 0 || isPublishing}
                    aria-label="Sélectionner tous les brouillons"
                    title="Tout sélectionner (brouillons seulement)"
                  />
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Événement
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Lieu
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Vues
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Chargement des événements...
                  </td>
                </tr>
              ) : paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Aucun événement trouvé
                  </td>
                </tr>
              ) : (
                paginatedEvents.map((event) => (
                  <tr key={event.id} className="table-row-hover">
                    {/* Sélection (brouillons et en attente uniquement) */}
                    <td className="pl-6 py-4 w-10">
                      {estPubliable(event) && (
                        <Checkbox
                          checked={selection.has(event.uuid)}
                          onCheckedChange={(v) => basculerSelection(event.uuid, v === true)}
                          disabled={isPublishing}
                          aria-label={`Sélectionner ${event.name}`}
                        />
                      )}
                    </td>

                    {/* Événement */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {event.coverImageUrl ? (
                          <img
                            src={event.coverImageUrl}
                            alt={event.name}
                            className="h-12 w-16 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-16 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                            N/A
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-xs">{event.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.soldSeats} / {event.soldSeats + event.availableSeats} tickets
                          </p>
                          {refus[event.uuid] && (
                            <p className="mt-1 flex items-start gap-1 text-xs text-destructive max-w-xs">
                              <AlertCircle className="h-3.5 w-3.5 mt-px flex-shrink-0" />
                              {refus[event.uuid].message}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        {format(new Date(event.startDate), 'dd MMM yyyy', { locale: fr })}
                      </div>
                    </td>

                    {/* Lieu */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm max-w-48">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{event.venueName} · {event.cityName}</span>
                      </div>
                    </td>

                    {/* Statut */}
                    <td className="px-6 py-4">
                      <EventStatusBadge status={event.eventStatus ?? 'published'} />
                    </td>

                    {/* Vues */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        {event.viewCount.toLocaleString('fr-FR')}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/events/${event.slug}`} className="flex items-center">
                              <Eye className="h-4 w-4 mr-2" />
                              Voir
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/events/${event.slug}/edit`} className="flex items-center">
                              <Pencil className="h-4 w-4 mr-2" />
                              Modifier
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setEventToDelete(event)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation publication groupée */}
      <AlertDialog open={confirmPublication} onOpenChange={setConfirmPublication}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Publier {nbSelection} événement{nbSelection > 1 ? 's' : ''} ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {nbSelection > 1 ? 'Ils seront visibles' : 'Il sera visible'} du public.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublierSelection}>Publier</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <DeleteEventDialog
        event={eventToDelete ? { ...eventToDelete, title: eventToDelete.name } as any : null}
        open={!!eventToDelete}
        onOpenChange={(open) => !open && setEventToDelete(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}