export type EventStatus = 'draft' | 'published' | 'cancelled';

export interface TicketCategory {
  id: string;
  name: string;
  description: string;
  price: number;
  availableSeats: number;
  maxPerPerson: number;
  isEnabled: boolean;
}

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
  
  // New fields
  organizationName: string;
  organizerName: string;
  organizerPhone: string;
  category: string;
  ticketCategories: TicketCategory[];
  
  // Toggles
  isPublished: boolean;
  isFeatured: boolean;
  isPromoted: boolean;
  isPublic: boolean;
  isOnline: boolean;
  onlineLink: string;
  
  // Additional info
  minimumAge: number;
  refundDays: number;
  termsAndConditions: string;
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  doorOpeningTime: string;
  doorClosingTime: string;
  city: string;
  address: string;
  locationDetails: string;
  imageFile: File | null;
  imageUrl: string;
  
  // Organization
  organizationName: string;
  organizerName: string;
  organizerPhone: string;
  category: string;
  
  // Ticket categories
  ticketCategories: TicketCategory[];
  
  // Toggles
  isPublished: boolean;
  isFeatured: boolean;
  isPromoted: boolean;
  isPublic: boolean;
  isOnline: boolean;
  onlineLink: string;
  
  // Additional info
  minimumAge: number;
  lowestPrice: number;
  refundDays: number;
  termsAndConditions: string;
}

export interface DashboardStats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
}

// Event categories
export const EVENT_CATEGORIES = [
  { value: 'concert', label: 'Concert' },
  { value: 'festival', label: 'Festival' },
  { value: 'conference', label: 'Conférence' },
  { value: 'sport', label: 'Sport' },
  { value: 'theatre', label: 'Théâtre' },
  { value: 'cinema', label: 'Cinéma' },
  { value: 'exposition', label: 'Exposition' },
  { value: 'gala', label: 'Gala' },
  { value: 'other', label: 'Autre' },
];

// Cities in Gabon
export const CITIES = [
  { value: 'libreville', label: 'Libreville' },
  { value: 'port-gentil', label: 'Port-Gentil' },
  { value: 'franceville', label: 'Franceville' },
  { value: 'oyem', label: 'Oyem' },
  { value: 'moanda', label: 'Moanda' },
  { value: 'mouila', label: 'Mouila' },
  { value: 'lambarene', label: 'Lambaréné' },
  { value: 'tchibanga', label: 'Tchibanga' },
  { value: 'koulamoutou', label: 'Koulamoutou' },
  { value: 'makokou', label: 'Makokou' },
];
