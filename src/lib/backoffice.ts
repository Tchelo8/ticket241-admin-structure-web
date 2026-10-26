/**
 * Événement tel que renvoyé par GET /api/events/structure/{id} (EventResponseDto),
 * réduit aux champs utilisés par le tableau de bord et la liste, et petits calculs d'affichage.
 */
export interface CategorieBillet {
  id?: number;
  uuid?: string;
  name: string;
  price: number;
  totalSeats: number;
  availableSeats?: number;
  soldSeats?: number;
  colorCode?: string | null;
}

export interface EvenementStructure {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  category?: string | null;
  categoryDisplayName?: string | null;
  startDate: string;
  venueName: string;
  cityName: string;
  coverImageUrl: string | null;
  totalSeats?: number;
  soldSeats: number;
  availableSeats: number;
  viewCount: number;
  shareCount?: number;
  minPrice?: number;
  eventStatus: string | null;
  ticketCategories?: CategorieBillet[];
}

export type StatutEvenement = "published" | "draft" | "pending_approval" | "cancelled" | "completed";

/** Statut normalisé ; POSTPONED et SOLD_OUT sont rangés avec les publiés. */
export const statut = (e: Pick<EvenementStructure, "eventStatus">): StatutEvenement => {
  const s = (e.eventStatus ?? "").toUpperCase();
  if (s === "DRAFT") return "draft";
  if (s === "PENDING_APPROVAL") return "pending_approval";
  if (s === "CANCELLED") return "cancelled";
  if (s === "COMPLETED") return "completed";
  return "published";
};

export const vendus = (e: EvenementStructure) =>
  e.ticketCategories?.length ? e.ticketCategories.reduce((a, c) => a + (c.soldSeats ?? 0), 0) : e.soldSeats ?? 0;

export const capacite = (e: EvenementStructure) =>
  e.totalSeats ??
  (e.ticketCategories?.length
    ? e.ticketCategories.reduce((a, c) => a + (c.totalSeats ?? 0), 0)
    : (e.soldSeats ?? 0) + (e.availableSeats ?? 0));

/** Recette brute : billets vendus × prix de chaque catégorie. */
export const recette = (e: EvenementStructure) =>
  e.ticketCategories?.length
    ? e.ticketCategories.reduce((a, c) => a + (c.soldSeats ?? 0) * Number(c.price ?? 0), 0)
    : (e.soldSeats ?? 0) * Number(e.minPrice ?? 0);
