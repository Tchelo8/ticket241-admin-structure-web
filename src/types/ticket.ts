export type TicketStatus = 'paid' | 'used' | 'unused';

export interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  categoryName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  price: number;
  status: TicketStatus;
  purchaseDate: string;
  usedDate?: string;
  ticketCode: string;
}

export const ticketStatusConfig: Record<TicketStatus, { label: string; className: string }> = {
  paid: {
    label: 'Payé',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  used: {
    label: 'Utilisé',
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  unused: {
    label: 'Non utilisé',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
};
