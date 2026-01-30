export type EventStatus = 'draft' | 'published' | 'cancelled';

export interface Event {
  uuid: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  totalSeats: number;
  ticketPrice: number;
  status: EventStatus;
  views: number;
  ticketsSold: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  totalSeats: number;
  ticketPrice: number;
  status: EventStatus;
}

export interface DashboardStats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
}
