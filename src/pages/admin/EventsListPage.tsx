import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EventStatusBadge } from '@/components/admin/EventStatusBadge';
import { DeleteEventDialog } from '@/components/admin/DeleteEventDialog';
import { Button } from '@/components/ui/button';
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
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  ListChecks,
  Image as ImageIcon,
} from "@/components/icons";
import { cn } from '@/lib/utils';
import { capacite, recette, statut, vendus, type EvenementStructure } from '@/lib/backoffice';
import { dateCourte, fcfaCompact, nombre, pourcentage } from '@/lib/format';
import { toast } from 'sonner';
import {
  recuperer,
  supprimer,
  obtenirUtilisateur,
  evenements,
  MAX_PUBLICATION_LOT,
} from '@/lib/Transmission';

// ── Types ─────────────────────────────────────────────────────────────────────

type EventSummary = EvenementStructure;

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

const ITEMS_PER_PAGE = 10;

/** Seuls ces statuts sont acceptés par POST /api/events/publish-batch */
const STATUTS_PUBLIABLES = ['DRAFT', 'PENDING_APPROVAL'];

const estPubliable = (event: EventSummary) =>
  STATUTS_PUBLIABLES.includes((event.eventStatus ?? '').toUpperCase());

const MESSAGE_STRUCTURE_NON_VERIFIEE =
  'Votre structure doit être vérifiée par Ticket241 avant de pouvoir publier un événement';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EventsListPage() {
  const navigate = useNavigate();
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

  const filtresStatut: [string, string][] = [
    ['all', 'Tous'],
    ['PUBLISHED', 'Publiés'],
    ['DRAFT', 'Brouillons'],
    ['PENDING_APPROVAL', 'En validation'],
    ['COMPLETED', 'Terminés'],
    ['CANCELLED', 'Annulés'],
  ];
  const compterStatut = (cle: string) =>
    cle === 'all'
      ? events.length
      : events.filter((e) => (e.eventStatus ?? 'PUBLISHED').toUpperCase() === cle).length;

  const resultat = loading
    ? 'Chargement…'
    : `${filteredEvents.length} événement${filteredEvents.length !== 1 ? 's' : ''}` +
      (filteredEvents.length !== totalElements ? ` sur ${totalElements}` : '') +
      (publiablesFiltres.length ? ` · ${publiablesFiltres.length} à publier` : '');

  const iconBtn =
    'flex h-8 w-8 items-center justify-center rounded-sm border border-transparent text-ink2 transition-colors hover:border-line2 hover:text-acc';

  return (
    <div>
      {/* En-tête : titre, résultat, recherche */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-page-title">Mes événements</h1>
          <p className="mt-1.5 text-[15px] text-ink2">{resultat}</p>
        </div>
        <label className="flex h-[46px] flex-[0_1_360px] items-center gap-2.5 rounded-pill border border-line2 bg-card px-4 shadow-sh focus-within:border-acc">
          <Search className="h-[18px] w-[18px] text-ink2" />
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Rechercher un événement…"
            aria-label="Rechercher un événement"
            className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-ink outline-none placeholder:text-ink3 focus-visible:outline-none"
          />
        </label>
      </div>

      {/* Filtres par statut */}
      <div className="mt-[18px] flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par statut">
        {filtresStatut.map(([cle, libelle]) => {
          const actif = statusFilter === cle;
          return (
            <button
              key={cle}
              type="button"
              role="tab"
              aria-selected={actif}
              onClick={() => {
                setStatusFilter(cle);
                setCurrentPage(1);
              }}
              className={cn(
                'flex items-center gap-[7px] rounded-pill border px-3.5 py-2 text-[13.5px] transition-all',
                actif ? 'border-ink bg-ink text-bg' : 'border-line2 bg-transparent text-ink2 hover:text-ink',
              )}
            >
              {libelle}
              <span className="t-num text-[11.5px] opacity-65">{compterStatut(cle)}</span>
            </button>
          );
        })}
      </div>

      {/* Barre collante de publication groupée */}
      {(nbSelection > 0 || isPublishing) && (
        <div className="sticky top-[74px] z-30 mt-4 flex flex-wrap items-center gap-3 rounded-md bg-ink px-4 py-3 text-bg shadow-shm animate-rise">
          <ListChecks className="h-5 w-5" />
          <span className="flex-1 text-[14.5px] font-medium">
            {nbSelection} brouillon{nbSelection > 1 ? 's' : ''} sélectionné{nbSelection > 1 ? 's' : ''}
            {raisonDesactivation && nbSelection > 0 && (
              <span className="mt-0.5 block text-[12.5px] font-normal opacity-75">{raisonDesactivation}</span>
            )}
          </span>
          <button
            type="button"
            onClick={() => setSelection(new Set())}
            disabled={isPublishing}
            className="h-9 rounded-sm border border-white/30 px-3.5 text-[13.5px] text-inherit transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            Désélectionner
          </button>
          <button
            type="button"
            onClick={() => setConfirmPublication(true)}
            disabled={boutonPublierDesactive}
            className="flex h-9 items-center gap-[7px] rounded-sm bg-acc px-4 text-[13.5px] font-semibold text-on-acc transition-colors hover:bg-acc/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-[15px] w-[15px]" />
            {isPublishing ? 'Publication…' : 'Publier la sélection'}
          </button>
        </div>
      )}

      {/* Refus sans ligne correspondante dans la liste */}
      {refusHorsListe.length > 0 && (
        <div className="mt-4 space-y-1 rounded-md border border-acc2/30 bg-acc2s p-3 text-sm text-acc2">
          {refusHorsListe.map(([uuid, { name, message }]) => (
            <p key={uuid} className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              {name ? `${name} : ${message}` : message}
            </p>
          ))}
        </div>
      )}

      {/* Tableau */}
      <section className="t-card mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse">
            <thead>
              <tr className="bg-surf text-left text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink3">
                <th className="w-12 py-2.5 pl-[18px]">
                  {publiablesFiltres.length > 0 && (
                    <Checkbox
                      checked={toutSelectionne}
                      onCheckedChange={(v) => basculerTout(v === true)}
                      disabled={isPublishing}
                      aria-label="Sélectionner tous les brouillons"
                      title="Sélectionner tous les brouillons"
                    />
                  )}
                </th>
                <th className="px-3 py-2.5 font-semibold">Événement</th>
                <th className="px-3 py-2.5 font-semibold">Date</th>
                <th className="px-3 py-2.5 font-semibold">Statut</th>
                <th className="w-[180px] px-3 py-2.5 font-semibold">Remplissage</th>
                <th className="px-3 py-2.5 text-right font-semibold">Revenus</th>
                <th className="w-[130px] px-[18px] py-2.5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="border-t border-line px-6 py-12 text-center text-ink3">
                    Chargement des événements…
                  </td>
                </tr>
              ) : (
                paginatedEvents.map((event) => {
                  const coche = selection.has(event.uuid);
                  const total = capacite(event);
                  const vendu = vendus(event);
                  const pct = pourcentage(vendu, total);
                  return (
                    <tr
                      key={event.id}
                      onClick={() => navigate(`/admin/events/${event.slug}`)}
                      className={cn('table-row-hover cursor-pointer border-t border-line', coche && 'bg-accs')}
                    >
                      {/* Sélection (brouillons et en validation uniquement) */}
                      <td className="py-3 pl-[18px]" onClick={(e) => e.stopPropagation()}>
                        {estPubliable(event) && (
                          <Checkbox
                            checked={coche}
                            onCheckedChange={(v) => basculerSelection(event.uuid, v === true)}
                            disabled={isPublishing}
                            aria-label={`Sélectionner ${event.name}`}
                          />
                        )}
                      </td>

                      <td className="min-w-[300px] px-3 py-3">
                        <div className="flex items-center gap-3">
                          {event.coverImageUrl ? (
                            <img src={event.coverImageUrl} alt="" className="t-img h-11 w-16 flex-none rounded-[3px] object-cover" />
                          ) : (
                            <div className="flex h-11 w-16 flex-none items-center justify-center rounded-[3px] bg-surf text-ink3">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="max-w-[280px] truncate text-[15.5px] font-semibold">{event.name}</div>
                            <div className="whitespace-nowrap text-[12.5px] text-ink3">
                              {[event.categoryDisplayName, event.venueName, event.cityName].filter(Boolean).join(' · ')}
                            </div>
                            {refus[event.uuid] && (
                              <p className="mt-1 flex max-w-xs items-start gap-1 text-xs text-acc2">
                                <AlertCircle className="mt-px h-3.5 w-3.5 flex-shrink-0" />
                                {refus[event.uuid].message}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-sm">{dateCourte(event.startDate)}</td>

                      <td className="px-3 py-3">
                        <EventStatusBadge status={statut(event)} />
                      </td>

                      <td className="px-3 py-3">
                        <div className="t-num flex justify-between text-[12.5px]">
                          <span>
                            <b className="font-semibold">{nombre(vendu)}</b>
                            <span className="text-ink3"> / {nombre(total)}</span>
                          </span>
                          <span className="text-ink3">{pct}%</span>
                        </div>
                        <div className="t-meter mt-[5px] !h-1">
                          <span style={{ width: `${pct}%` }} />
                        </div>
                      </td>

                      <td className="t-num whitespace-nowrap px-3 py-3 text-right text-sm font-semibold">
                        {fcfaCompact(recette(event))}
                      </td>

                      <td className="px-[18px] py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <Link to={`/admin/events/${event.slug}`} title="Voir" aria-label={`Voir ${event.name}`} className={iconBtn}>
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/admin/events/${event.slug}/edit`}
                            title="Modifier"
                            aria-label={`Modifier ${event.name}`}
                            className={iconBtn}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setEventToDelete(event)}
                            title="Supprimer"
                            aria-label={`Supprimer ${event.name}`}
                            className={cn(iconBtn, 'hover:border-acc2 hover:text-acc2')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && paginatedEvents.length === 0 && (
          <div className="border-t border-line px-5 py-14 text-center">
            <Calendar className="mx-auto h-10 w-10 text-ink3" />
            <p className="mt-3 text-[17px] font-semibold">Aucun événement trouvé</p>
            <p className="mt-1 text-sm text-ink3">
              {events.length ? 'Modifiez la recherche ou le filtre.' : 'Créez votre premier événement pour commencer.'}
            </p>
            {!events.length && (
              <Button asChild className="mt-4">
                <Link to="/admin/events/create" className="no-underline">
                  <Plus className="h-4 w-4" />
                  Créer un événement
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3.5">
            <p className="t-num text-sm text-ink3">
              Page {currentPage} sur {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Page précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Page suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Confirmation publication groupée */}
      <AlertDialog open={confirmPublication} onOpenChange={setConfirmPublication}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Publier {nbSelection} événement{nbSelection > 1 ? 's' : ''} ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {nbSelection > 1 ? 'Ils seront visibles' : 'Il sera visible'} du public et la billetterie ouvrira selon vos
              dates de vente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublierSelection}>Publier</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suppression */}
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
