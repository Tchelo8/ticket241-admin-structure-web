import { useState, useMemo, useEffect } from 'react';
import { recuperer, obtenirUtilisateur } from '@/lib/Transmission';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Ticket,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  AlertCircle,
} from "@/components/icons";
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

// ============================================================
// TYPES
// ============================================================

interface TicketCategory {
  id: number;
  name: string;
  description?: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  soldSeats: number;
  displayOrder: number;
  isActive: boolean;
  maxTicketsPerOrder: number;
  benefits?: string;
  colorCode?: string | null;
  hasAvailableSeats: boolean;
}

interface Evenement {
  id: number;
  name: string;
  slug: string;
  category: string;
  startDate: string;
  venueName: string;
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  soldSeats: number;
  minPrice: number;
  maxPrice: number;
  coverImageUrl?: string;
  ticketCategories: TicketCategory[];
  isActive: boolean;
  isSoldOut: boolean;
  isPastEvent: boolean;
}

interface PageEvenements {
  content: Evenement[];
  totalElements: number;
  totalPages: number;
  number: number;
}

// ============================================================
// UTILITAIRES
// ============================================================

const formatMonnaie = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M FCFA`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k FCFA`;
  return `${value.toLocaleString('fr-FR')} FCFA`;
};

const COULEURS_DEFAUT = [
  'hsl(217, 91%, 60%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(262, 83%, 58%)',
  'hsl(0, 84%, 60%)',
  'hsl(180, 71%, 45%)',
];

const getCouleurCategorie = (cat: TicketCategory, index: number): string =>
  cat.colorCode ?? COULEURS_DEFAUT[index % COULEURS_DEFAUT.length];

// ============================================================
// CALCULS MÉTIER
// ============================================================

/**
 * Calcule les KPIs d'un événement à partir des ticketCategories.
 * CA = somme(soldSeats * price) par catégorie
 * Commission = 5% du CA brut (taux fixe en attendant l'API Ticket Service)
 * Taux de remplissage = soldSeats / totalSeats
 */
const calculerKPIs = (evenements: Evenement[]) => {
  const totalBillets = evenements.reduce((s, e) => s + e.soldSeats, 0);
  const totalPlaces = evenements.reduce((s, e) => s + e.totalSeats, 0);
  const totalDisponibles = evenements.reduce((s, e) => s + e.availableSeats, 0);
  const totalReserves = evenements.reduce((s, e) => s + e.reservedSeats, 0);

  const caBrut = evenements.reduce((total, evt) =>
    total + evt.ticketCategories.reduce((s, cat) => s + cat.soldSeats * cat.price, 0), 0);

  const TAUX_COMMISSION = 0.05;
  const commission = caBrut * TAUX_COMMISSION;
  const caNet = caBrut - commission;
  const tauxRemplissage = totalPlaces > 0 ? Math.round((totalBillets / totalPlaces) * 100) : 0;

  return { totalBillets, totalPlaces, totalDisponibles, totalReserves, caBrut, caNet, commission, tauxRemplissage };
};

/**
 * Agrège les catégories de tickets de plusieurs événements.
 * Regroupe par nom de catégorie pour le PieChart.
 */
const aggreguerCategories = (evenements: Evenement[]) => {
  const map: Record<string, { name: string; totalSeats: number; soldSeats: number; revenue: number; colorCode: string }> = {};

  evenements.forEach(evt => {
    evt.ticketCategories.forEach((cat, idx) => {
      const key = cat.name;
      if (!map[key]) {
        map[key] = {
          name: cat.name,
          totalSeats: 0,
          soldSeats: 0,
          revenue: 0,
          colorCode: getCouleurCategorie(cat, idx),
        };
      }
      map[key].totalSeats += cat.totalSeats;
      map[key].soldSeats += cat.soldSeats;
      map[key].revenue += cat.soldSeats * cat.price;
    });
  });

  return Object.values(map);
};

// ============================================================
// COMPOSANTS UTILITAIRES
// ============================================================

const SkeletonKPI = () => (
  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-4 sm:pt-6">
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-7 w-24" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const EtatVide = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
    <p className="text-muted-foreground text-sm">Aucun événement trouvé pour cette structure.</p>
  </div>
);

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function StatisticsPage() {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [compareEvent, setCompareEvent] = useState<string>('none');

  // ── Récupération du structureId depuis le JWT ──────────────
  const utilisateur = obtenirUtilisateur<{ structureId?: number; structure?: { id: number } }>();
  const structureId: number | null =
    utilisateur?.structureId ?? utilisateur?.structure?.id ?? null;

  // ── Chargement des événements ──────────────────────────────
  useEffect(() => {
    if (!structureId) {
      setErreur("Structure introuvable dans la session.");
      setChargement(false);
      return;
    }

    const charger = async () => {
      setChargement(true);
      setErreur(null);

      const res = await recuperer<PageEvenements>(
        `/api/events/structure/${structureId}?page=0&size=100`
      );

      if (res.succes && res.donnees) {
        setEvenements(res.donnees.content);
      } else {
        setErreur(res.erreur ?? "Impossible de charger les événements.");
      }
      setChargement(false);
    };

    charger();
  }, [structureId]);

  // ── Événements filtrés selon la sélection ─────────────────
  const evenementsFiltres = useMemo(() => {
    if (selectedEvent === 'all') return evenements;
    return evenements.filter(e => String(e.id) === selectedEvent);
  }, [evenements, selectedEvent]);

  // ── KPIs calculés ─────────────────────────────────────────
  const kpis = useMemo(() => calculerKPIs(evenementsFiltres), [evenementsFiltres]);

  // ── Données catégories pour PieChart ──────────────────────
  const donneesCategories = useMemo(() => aggreguerCategories(evenementsFiltres), [evenementsFiltres]);

  // ── Données BarChart (tous les événements) ────────────────
  const donneesBar = useMemo(() =>
    evenements.map(e => ({
      name: e.name.length > 22 ? e.name.substring(0, 22) + '…' : e.name,
      billets: e.soldSeats,
      places: e.totalSeats,
      // CA en milliers FCFA pour l'axe
      caK: Math.round(
        e.ticketCategories.reduce((s, cat) => s + cat.soldSeats * cat.price, 0) / 1_000
      ),
    })), [evenements]);

  // ── Données comparaison ───────────────────────────────────
  const donneesComparaison = useMemo(() => {
    if (compareEvent === 'none' || selectedEvent === 'all') return null;
    const courant = evenements.find(e => String(e.id) === selectedEvent);
    const compare = evenements.find(e => String(e.id) === compareEvent);
    if (!courant || !compare) return null;

    const kpiCourant = calculerKPIs([courant]);
    const kpiCompare = calculerKPIs([compare]);

    return { courant, compare, kpiCourant, kpiCompare };
  }, [selectedEvent, compareEvent, evenements]);

  // ── Rendu ─────────────────────────────────────────────────
  if (erreur) {
    return (
      <div className="p-8 flex flex-col items-center gap-3 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-destructive font-medium">{erreur}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 page-transition">

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Statistiques & Performances</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Analysez vos événements pour optimiser vos futures décisions
        </p>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
        <div>
          <Label>Événement</Label>
          <Select value={selectedEvent} onValueChange={setSelectedEvent} disabled={chargement}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Sélectionner un événement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les événements</SelectItem>
              {evenements.map(evt => (
                <SelectItem key={evt.id} value={String(evt.id)}>
                  {evt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedEvent !== 'all' && (
          <div>
            <Label>Comparer avec</Label>
            <Select value={compareEvent} onValueChange={setCompareEvent} disabled={chargement}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Choisir un événement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune comparaison</SelectItem>
                {evenements
                  .filter(e => String(e.id) !== selectedEvent)
                  .map(evt => (
                    <SelectItem key={evt.id} value={String(evt.id)}>
                      {evt.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      {chargement ? <SkeletonKPI /> : evenements.length === 0 ? <EtatVide /> : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">

          {/* Billets vendus */}
          <Card>
            <CardContent className="p-4 sm:pt-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Ticket className="h-5 w-5 text-primary" />
                  <Badge variant="secondary" className="text-xs">vendus</Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Billets vendus</p>
                <p className="text-lg sm:text-2xl font-bold">{kpis.totalBillets.toLocaleString('fr-FR')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Places disponibles */}
          <Card>
            <CardContent className="p-4 sm:pt-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Users className="h-5 w-5 text-primary" />
                  <Badge variant="secondary" className="text-xs">{kpis.tauxRemplissage}%</Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Places disponibles</p>
                <p className="text-lg sm:text-2xl font-bold">{kpis.totalDisponibles.toLocaleString('fr-FR')}</p>
              </div>
            </CardContent>
          </Card>

          {/* CA Brut */}
          <Card>
            <CardContent className="p-4 sm:pt-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <TrendingUp className="h-4 w-4 text-acc" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">CA Brut</p>
                <p className="text-lg sm:text-2xl font-bold">{formatMonnaie(kpis.caBrut)}</p>
              </div>
            </CardContent>
          </Card>

          {/* CA Net */}
          <Card>
            <CardContent className="p-4 sm:pt-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <DollarSign className="h-5 w-5 text-acc" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">CA Net</p>
                <p className="text-lg sm:text-2xl font-bold text-acc">{formatMonnaie(kpis.caNet)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Commission (5% fixe) */}
          <Card>
            <CardContent className="p-4 sm:pt-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Percent className="h-5 w-5 text-acc2" />
                  <Badge variant="outline" className="text-xs">5%</Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Commission</p>
                <p className="text-lg sm:text-2xl font-bold text-acc2">{formatMonnaie(kpis.commission)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Taux de remplissage */}
          <Card>
            <CardContent className="p-4 sm:pt-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Remplissage</p>
                <div className="space-y-1">
                  <p className="text-lg sm:text-2xl font-bold">{kpis.tauxRemplissage}%</p>
                  <Progress value={kpis.tauxRemplissage} className="h-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section Comparaison */}
      {donneesComparaison && (
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Comparaison d'événements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Événement courant */}
              <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold text-sm sm:text-base truncate">{donneesComparaison.courant.name}</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{donneesComparaison.kpiCourant.totalBillets}</p>
                    <p className="text-xs text-muted-foreground">Billets</p>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{formatMonnaie(donneesComparaison.kpiCourant.caBrut)}</p>
                    <p className="text-xs text-muted-foreground">CA Brut</p>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{donneesComparaison.kpiCourant.tauxRemplissage}%</p>
                    <p className="text-xs text-muted-foreground">Remplissage</p>
                  </div>
                </div>
              </div>

              {/* Événement comparé */}
              <div className="space-y-4 p-4 rounded-lg bg-secondary/50 border border-border">
                <h4 className="font-semibold text-sm sm:text-base truncate">{donneesComparaison.compare.name}</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {/* Billets */}
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{donneesComparaison.kpiCompare.totalBillets}</p>
                    <p className="text-xs text-muted-foreground">Billets</p>
                    {(() => {
                      const diff = donneesComparaison.kpiCourant.totalBillets;
                      if (diff === 0) return null;
                      const pct = Math.round((donneesComparaison.kpiCompare.totalBillets / diff - 1) * 100);
                      return pct >= 0
                        ? <span className="text-xs text-acc flex items-center justify-center gap-0.5"><ArrowUpRight className="h-3 w-3" />{pct}%</span>
                        : <span className="text-xs text-acc2 flex items-center justify-center gap-0.5"><ArrowDownRight className="h-3 w-3" />{Math.abs(pct)}%</span>;
                    })()}
                  </div>
                  {/* CA */}
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{formatMonnaie(donneesComparaison.kpiCompare.caBrut)}</p>
                    <p className="text-xs text-muted-foreground">CA Brut</p>
                    {(() => {
                      const ref = donneesComparaison.kpiCourant.caBrut;
                      if (ref === 0) return null;
                      const pct = Math.round((donneesComparaison.kpiCompare.caBrut / ref - 1) * 100);
                      return pct >= 0
                        ? <span className="text-xs text-acc flex items-center justify-center gap-0.5"><ArrowUpRight className="h-3 w-3" />{pct}%</span>
                        : <span className="text-xs text-acc2 flex items-center justify-center gap-0.5"><ArrowDownRight className="h-3 w-3" />{Math.abs(pct)}%</span>;
                    })()}
                  </div>
                  {/* Remplissage */}
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{donneesComparaison.kpiCompare.tauxRemplissage}%</p>
                    <p className="text-xs text-muted-foreground">Remplissage</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {!chargement && evenements.length > 0 && (
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
            <TabsTrigger value="categories" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <PieChartIcon className="h-4 w-4 hidden sm:block" />
              Catégories
            </TabsTrigger>
            <TabsTrigger value="comparison" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 hidden sm:block" />
              Par événement
            </TabsTrigger>
          </TabsList>

          {/* ── Onglet Catégories ── */}
          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* PieChart — répartition des places par catégorie */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Répartition par catégorie</CardTitle>
                  <p className="text-xs text-muted-foreground">Basé sur les places totales par catégorie</p>
                </CardHeader>
                <CardContent>
                  {donneesCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-10">Aucune catégorie trouvée.</p>
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donneesCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="totalSeats"
                            nameKey="name"
                          >
                            {donneesCategories.map((cat, index) => (
                              <Cell key={`cell-${index}`} fill={cat.colorCode} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                            formatter={(value: number, name: string) => [`${value} places`, name]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Liste — revenus & places par catégorie */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Détail par catégorie</CardTitle>
                  <p className="text-xs text-muted-foreground">CA = billets vendus × prix unitaire</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {donneesCategories.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">Aucune catégorie.</p>
                    ) : (
                      donneesCategories.map((cat, index) => {
                        const maxRevenu = Math.max(...donneesCategories.map(c => c.revenue), 1);
                        return (
                          <div key={`${cat.name}-${index}`} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: cat.colorCode }}
                                />
                                <span className="font-medium">{cat.name}</span>
                              </div>
                              <span className="text-muted-foreground text-xs">{formatMonnaie(cat.revenue)}</span>
                            </div>
                            <Progress
                              value={(cat.revenue / maxRevenu) * 100}
                              className="h-2"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{cat.soldSeats} vendus / {cat.totalSeats} places</span>
                              <span>
                                {cat.totalSeats > 0
                                  ? `${Math.round((cat.soldSeats / cat.totalSeats) * 100)}% rempli`
                                  : '—'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Onglet Par événement ── */}
          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Performance par événement</CardTitle>
                <p className="text-xs text-muted-foreground">Billets vendus et CA en milliers FCFA</p>
              </CardHeader>
              <CardContent>
                {donneesBar.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">Aucune donnée.</p>
                ) : (
                  <div className="h-[300px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={donneesBar}
                        margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis
                          dataKey="name"
                          angle={-40}
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
                          tickFormatter={(v) => `${v}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number, name: string) => [
                            name === 'billets' ? `${value} billets` : `${value}k FCFA`,
                            name === 'billets' ? 'Billets vendus' : 'CA (k FCFA)',
                          ]}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="billets" name="billets" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="caK" name="caK" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}