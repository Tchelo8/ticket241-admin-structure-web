// ============================================================
// TYPES BACKEND — alignés avec Event Service Ticket241
// ============================================================

export type EventStatus =
  | 'draft' | 'pending_approval' | 'published' | 'cancelled' | 'completed';

export type EventCategory =
  | 'CONCERT' | 'SPORT' | 'THEATRE' | 'CONFERENCE' | 'FESTIVAL'
  | 'CINEMA' | 'EXPOSITION' | 'DANSE' | 'COMEDIE' | 'OPERA'
  | 'CIRQUE' | 'FAMILLE' | 'GASTRONOMIE' | 'FORMATION'
  | 'NETWORKING' | 'CHARITY' | 'RELIGION' | 'AUTRE';

export type ValidationMode = 'AUTO' | 'MANUAL';

// ============================================================
// TICKET CATEGORY
// Aligné avec CreateTicketCategoryDto.java
// ============================================================

/**
 * Structure locale (dans le formulaire) — contient id et isEnabled
 * qui sont gérés côté front uniquement (pas envoyés au backend)
 */
export interface TicketCategory {
  id: string;                // front uniquement — UUID local
  name: string;              // → name
  description: string;       // → description
  price: number;             // → price (BigDecimal)
  availableSeats: number;    // → totalSeats
  maxPerPerson: number;      // → maxTicketsPerOrder
  isEnabled: boolean;        // front uniquement — filtré avant envoi
  benefits?: string;         // → benefits
  colorCode?: string;        // → colorCode (#RRGGBB)
  displayOrder?: number;     // → displayOrder
}

// ============================================================
// EVENT FORM DATA — données du formulaire React
// ============================================================

export interface EventFormData {
  // Infos générales → name, fullDescription, category
  title: string;
  description: string;
  category: number;

  // Dates → startDate, endDate, doorsOpenTime, saleStartDate, saleEndDate
  date: string;
  time: string;
  endDate?: string;
  endTime?: string;
  doorOpeningTime: string;
  doorClosingTime: string;
  saleStartDate?: string;
  saleEndDate?: string;

  // Lieu → venueName, venueAddress, cityId, venueAccessInfo
  venueName: string;         // NOUVEAU — obligatoire backend
  city: string;              // stocke l'id de la ville (ex: "1")
  address: string;
  locationDetails: string;

  // Image
  imageFile: File | null;
  imageUrl: string;

  // Organisateur → organizerName, organizerPhone
  organizationName: string;
  organizerName: string;
  organizerPhone: string;

  // Tickets → ticketCategories, totalSeats, maxTicketsPerUser
  ticketCategories: TicketCategory[];
  totalSeats: number;        // NOUVEAU — obligatoire backend
  maxTicketsPerUser: number;

  // Toggles → isPublic, isOnline, onlineMeetingUrl
  isPublished: boolean;      // front uniquement
  isFeatured: boolean;       // front uniquement
  isPromoted: boolean;       // front uniquement
  isPublic: boolean;
  isOnline: boolean;
  onlineLink: string;

  // Paramètres → minAge, termsAndConditions, cancellationPolicy, allowRefund, refundDeadlineDays
  minimumAge: number;
  lowestPrice: number;       // front uniquement — affiché, non envoyé
  refundDays: number;
  termsAndConditions: string;
  cancellationPolicy?: string;
  validationMode: ValidationMode;
}

// ============================================================
// EVENT — réponse du backend (EventResponseDto)
// ============================================================

export interface Event {
  uuid: string;
  title: string;
  description: string;
  date: string;
  time: string;
  doorOpeningTime: string;
  doorClosingTime: string;
  city: string;
  address: string;
  locationDetails: string;
  location: string;
  imageUrl: string;
  totalSeats: number;
  ticketPrice: number;
  lowestPrice: number;
  status: EventStatus;
  views: number;
  ticketsSold: number;
  createdAt: string;
  updatedAt: string;
  organizationName: string;
  organizerName: string;
  organizerPhone: string;
  category: EventCategory;
  ticketCategories: TicketCategory[];
  isPublished: boolean;
  isFeatured: boolean;
  isPromoted: boolean;
  isPublic: boolean;
  isOnline: boolean;
  onlineLink: string;
  minimumAge: number;
  refundDays: number;
  termsAndConditions: string;
}

// ============================================================
// DASHBOARD
// ============================================================

export interface DashboardStats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
}

// ============================================================
// CONSTANTES
// ============================================================

export const EVENT_CATEGORIES = [
  { value: 'CONCERT',     label: 'Concert' },
  { value: 'SPORT',       label: 'Sport' },
  { value: 'THEATRE',     label: 'Théâtre' },
  { value: 'CONFERENCE',  label: 'Conférence' },
  { value: 'FESTIVAL',    label: 'Festival' },
  { value: 'CINEMA',      label: 'Cinéma' },
  { value: 'EXPOSITION',  label: 'Exposition' },
  { value: 'DANSE',       label: 'Danse' },
  { value: 'COMEDIE',     label: 'Comédie' },
  { value: 'OPERA',       label: 'Opéra' },
  { value: 'CIRQUE',      label: 'Cirque' },
  { value: 'FAMILLE',     label: 'Famille' },
  { value: 'GASTRONOMIE', label: 'Gastronomie' },
  { value: 'FORMATION',   label: 'Formation' },
  { value: 'NETWORKING',  label: 'Networking' },
  { value: 'CHARITY',     label: 'Charité' },
  { value: 'RELIGION',    label: 'Religion' },
  { value: 'AUTRE',       label: 'Autre' },
];

export const CITIES = [
  { value: 'libreville',   label: 'Libreville' },
  { value: 'port-gentil',  label: 'Port-Gentil' },
  { value: 'franceville',  label: 'Franceville' },
  { value: 'oyem',         label: 'Oyem' },
  { value: 'moanda',       label: 'Moanda' },
  { value: 'mouila',       label: 'Mouila' },
  { value: 'lambarene',    label: 'Lambaréné' },
  { value: 'tchibanga',    label: 'Tchibanga' },
  { value: 'koulamoutou',  label: 'Koulamoutou' },
  { value: 'makokou',      label: 'Makokou' },
];