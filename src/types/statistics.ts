export interface EventStatistics {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  ticketsSold: number;
  ticketsScanned: number;
  grossRevenue: number;
  platformCommission: number;
  netRevenue: number;
  participationRate: number;
  salesByCategory: CategorySales[];
  dailySales: DailySales[];
}

export interface CategorySales {
  category: string;
  quantity: number;
  revenue: number;
  color: string;
}

export interface DailySales {
  date: string;
  sales: number;
  revenue: number;
}

export interface GlobalStatistics {
  totalTicketsSold: number;
  totalGrossRevenue: number;
  totalNetRevenue: number;
  totalCommission: number;
  averageParticipationRate: number;
  totalEvents: number;
}

export interface PeriodComparison {
  label: string;
  currentValue: number;
  previousValue: number;
  change: number;
  isPositive: boolean;
}
