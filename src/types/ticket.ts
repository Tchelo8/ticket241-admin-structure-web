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
    className: 'bg-acc/10 text-acc border-acc/20',
  },
  used: {
    label: 'Utilisé',
    className: 'bg-acc/10 text-acc border-acc/20',
  },
  unused: {
    label: 'Non utilisé',
    className: 'bg-acc2/10 text-acc2 border-acc2/20',
  },
};
