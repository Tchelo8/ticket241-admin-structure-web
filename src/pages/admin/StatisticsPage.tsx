import { useState, useMemo } from 'react';
import { mockEventStatistics, mockGlobalStatistics } from '@/data/mockStatistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Ticket, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

// Format currency
const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M FCFA`;
  }
  return `${value.toLocaleString('fr-FR')} FCFA`;
};

export default function StatisticsPage() {
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30days');
  const [compareEvent, setCompareEvent] = useState<string>('none');

  // Get event statistics based on selection
  const currentStats = useMemo(() => {
    if (selectedEvent === 'all') {
      return {
        ticketsSold: mockGlobalStatistics.totalTicketsSold,
        ticketsScanned: Math.round(mockGlobalStatistics.totalTicketsSold * (mockGlobalStatistics.averageParticipationRate / 100)),
        grossRevenue: mockGlobalStatistics.totalGrossRevenue,
        netRevenue: mockGlobalStatistics.totalNetRevenue,
        commission: mockGlobalStatistics.totalCommission,
        participationRate: mockGlobalStatistics.averageParticipationRate,
      };
    }
    const event = mockEventStatistics.find(e => e.eventId === selectedEvent);
    if (!event) return null;
    return {
      ticketsSold: event.ticketsSold,
      ticketsScanned: event.ticketsScanned,
      grossRevenue: event.grossRevenue,
      netRevenue: event.netRevenue,
      commission: event.platformCommission,
      participationRate: event.participationRate,
    };
  }, [selectedEvent]);

  // Get selected event for charts
  const selectedEventData = useMemo(() => {
    if (selectedEvent === 'all') {
      // Aggregate all events
      const aggregatedDailySales: { [key: string]: { date: string; sales: number; revenue: number } } = {};
      mockEventStatistics.forEach(event => {
        event.dailySales.forEach(day => {
          if (aggregatedDailySales[day.date]) {
            aggregatedDailySales[day.date].sales += day.sales;
            aggregatedDailySales[day.date].revenue += day.revenue;
          } else {
            aggregatedDailySales[day.date] = { ...day };
          }
        });
      });
      return {
        dailySales: Object.values(aggregatedDailySales).sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
        salesByCategory: mockEventStatistics.flatMap(e => e.salesByCategory),
      };
    }
    return mockEventStatistics.find(e => e.eventId === selectedEvent) || null;
  }, [selectedEvent]);

  // Comparison data
  const comparisonData = useMemo(() => {
    if (compareEvent === 'none' || selectedEvent === 'all') return null;
    const current = mockEventStatistics.find(e => e.eventId === selectedEvent);
    const compare = mockEventStatistics.find(e => e.eventId === compareEvent);
    if (!current || !compare) return null;
    
    return {
      current: {
        title: current.eventTitle,
        ticketsSold: current.ticketsSold,
        grossRevenue: current.grossRevenue,
        participationRate: current.participationRate,
      },
      compare: {
        title: compare.eventTitle,
        ticketsSold: compare.ticketsSold,
        grossRevenue: compare.grossRevenue,
        participationRate: compare.participationRate,
      },
    };
  }, [selectedEvent, compareEvent]);

  // Aggregate category data for pie chart
  const categoryData = useMemo(() => {
    if (!selectedEventData) return [];
    const categories: { [key: string]: { category: string; quantity: number; revenue: number; color: string } } = {};
    
    const salesData = 'salesByCategory' in selectedEventData 
      ? selectedEventData.salesByCategory 
      : [];
    
    salesData.forEach(cat => {
      if (categories[cat.category]) {
        categories[cat.category].quantity += cat.quantity;
        categories[cat.category].revenue += cat.revenue;
      } else {
        categories[cat.category] = { ...cat };
      }
    });
    
    return Object.values(categories);
  }, [selectedEventData]);

  const COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(262, 83%, 58%)'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 page-transition">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Statistiques & Performances</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Analysez vos événements pour optimiser vos futures décisions
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
        <div>
          <Label>Événement</Label>
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Sélectionner un événement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les événements</SelectItem>
              {mockEventStatistics.map(event => (
                <SelectItem key={event.eventId} value={event.eventId}>
                  {event.eventTitle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Période</Label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 derniers jours</SelectItem>
              <SelectItem value="30days">30 derniers jours</SelectItem>
              <SelectItem value="90days">90 derniers jours</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedEvent !== 'all' && (
          <div>
            <Label>Comparer avec</Label>
            <Select value={compareEvent} onValueChange={setCompareEvent}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Choisir un événement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune comparaison</SelectItem>
                {mockEventStatistics
                  .filter(e => e.eventId !== selectedEvent)
                  .map(event => (
                    <SelectItem key={event.eventId} value={event.eventId}>
                      {event.eventTitle}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      {currentStats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:pt-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Ticket className="h-5 w-5 text-primary" />
                  <Badge variant="secondary" className="text-xs">+12%</Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Billets vendus</p>
                <p className="text-lg sm:text-2xl font-bold">{currentStats.ticketsSold.toLocaleString('fr-FR')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:pt-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Users className="h-5 w-5 text-primary" />
                  <Badge variant="secondary" className="text-xs">{currentStats.participationRate}%</Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Billets scannés</p>
                <p className="text-lg sm:text-2xl font-bold">{currentStats.ticketsScanned.toLocaleString('fr-FR')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:pt-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">CA Brut</p>
                <p className="text-lg sm:text-2xl font-bold">{formatCurrency(currentStats.grossRevenue)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:pt-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">CA Net</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(currentStats.netRevenue)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:pt-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Percent className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Commission</p>
                <p className="text-lg sm:text-2xl font-bold text-amber-600">{formatCurrency(currentStats.commission)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:pt-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Taux participation</p>
                <div className="space-y-1">
                  <p className="text-lg sm:text-2xl font-bold">{currentStats.participationRate}%</p>
                  <Progress value={currentStats.participationRate} className="h-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comparison Section */}
      {comparisonData && (
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Comparaison d'événements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Event */}
              <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold text-sm sm:text-base truncate">{comparisonData.current.title}</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{comparisonData.current.ticketsSold}</p>
                    <p className="text-xs text-muted-foreground">Billets</p>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{formatCurrency(comparisonData.current.grossRevenue)}</p>
                    <p className="text-xs text-muted-foreground">CA Brut</p>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{comparisonData.current.participationRate}%</p>
                    <p className="text-xs text-muted-foreground">Participation</p>
                  </div>
                </div>
              </div>

              {/* Compare Event */}
              <div className="space-y-4 p-4 rounded-lg bg-secondary/50 border border-border">
                <h4 className="font-semibold text-sm sm:text-base truncate">{comparisonData.compare.title}</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{comparisonData.compare.ticketsSold}</p>
                    <p className="text-xs text-muted-foreground">Billets</p>
                    {comparisonData.current.ticketsSold > comparisonData.compare.ticketsSold ? (
                      <span className="text-xs text-red-500 flex items-center justify-center gap-0.5">
                        <ArrowDownRight className="h-3 w-3" />
                        {Math.round((1 - comparisonData.compare.ticketsSold / comparisonData.current.ticketsSold) * 100)}%
                      </span>
                    ) : (
                      <span className="text-xs text-green-500 flex items-center justify-center gap-0.5">
                        <ArrowUpRight className="h-3 w-3" />
                        {Math.round((comparisonData.compare.ticketsSold / comparisonData.current.ticketsSold - 1) * 100)}%
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{formatCurrency(comparisonData.compare.grossRevenue)}</p>
                    <p className="text-xs text-muted-foreground">CA Brut</p>
                    {comparisonData.current.grossRevenue > comparisonData.compare.grossRevenue ? (
                      <span className="text-xs text-red-500 flex items-center justify-center gap-0.5">
                        <ArrowDownRight className="h-3 w-3" />
                        {Math.round((1 - comparisonData.compare.grossRevenue / comparisonData.current.grossRevenue) * 100)}%
                      </span>
                    ) : (
                      <span className="text-xs text-green-500 flex items-center justify-center gap-0.5">
                        <ArrowUpRight className="h-3 w-3" />
                        {Math.round((comparisonData.compare.grossRevenue / comparisonData.current.grossRevenue - 1) * 100)}%
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{comparisonData.compare.participationRate}%</p>
                    <p className="text-xs text-muted-foreground">Participation</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Tabs defaultValue="evolution" className="space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="evolution" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4 hidden sm:block" />
            Évolution
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <PieChartIcon className="h-4 w-4 hidden sm:block" />
            Catégories
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4 hidden sm:block" />
            Par événement
          </TabsTrigger>
        </TabsList>

        {/* Sales Evolution */}
        <TabsContent value="evolution">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Évolution des ventes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={selectedEventData?.dailySales || []}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: fr })}
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(value) => format(new Date(value), 'dd MMMM yyyy', { locale: fr })}
                      formatter={(value: number, name: string) => [
                        name === 'sales' ? `${value} billets` : formatCurrency(value),
                        name === 'sales' ? 'Ventes' : 'Revenus'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(217, 91%, 60%)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Distribution */}
        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Répartition par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="quantity"
                        nameKey="category"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number, name: string) => [`${value} billets`, name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Revenus par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((cat, index) => (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{cat.category}</span>
                        </div>
                        <span className="text-muted-foreground">{formatCurrency(cat.revenue)}</span>
                      </div>
                      <Progress 
                        value={(cat.revenue / Math.max(...categoryData.map(c => c.revenue))) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">{cat.quantity} billets vendus</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Event Comparison */}
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Performance par événement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockEventStatistics.map(e => ({
                      name: e.eventTitle.length > 20 ? e.eventTitle.substring(0, 20) + '...' : e.eventTitle,
                      billets: e.ticketsSold,
                      revenus: e.grossRevenue / 1000000,
                    }))}
                    margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'billets' ? `${value} billets` : `${value}M FCFA`,
                        name === 'billets' ? 'Billets vendus' : 'Revenus'
                      ]}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="billets" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="revenus" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
