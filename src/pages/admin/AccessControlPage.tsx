import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  QrCode,
  Activity,
  History,
  Plus,
  Search,
  Shield,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
} from "@/components/icons";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ── Composants ────────────────────────────────────────────────
import { TeamMemberCard, StructureUser } from '@/components/admin/access-control/TeamMemberCard';
import { ScanAgentCard } from '@/components/admin/access-control/ScanAgentCard';
import { EventControlCard } from '@/components/admin/access-control/EventControlCard';
import { ControlEventBadge } from '@/components/admin/access-control/ControlEventBadge';
import { TeamMemberDialog } from '@/components/admin/access-control/TeamMemberDialog';
import { ScanAgentDialog } from '@/components/admin/access-control/ScanAgentDialog';
import { DeleteConfirmDialog } from '@/components/admin/access-control/DeleteConfirmDialog';

// ── Mocks (agents, contrôle, historique — pas encore dynamisés) ─
import {
  mockScanAgents,
  mockControlEvents,
  mockEventControlStats,
} from '@/data/mockAccessControl';
import { ScanAgent } from '@/types/accessControl';

// ── Transmission ──────────────────────────────────────────────
import { recuperer, obtenirUtilisateur, afficherToast } from '@/lib/Transmission';

// ── Type réponse API équipe ───────────────────────────────────
interface StructureUsersResponse {
  count: number;
  users: StructureUser[];
}

// ── Skeleton pour les cards en chargement ─────────────────────
function SkeletonTeamCard() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-6 w-10 rounded-full" />
        </div>
        <div className="pt-3 border-t space-y-2">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════
export default function AccessControlPage() {

  // ── État équipe (API) ──────────────────────────────────────
  const [teamMembers, setTeamMembers]         = useState<StructureUser[]>([]);
  const [totalEquipe, setTotalEquipe]         = useState<number>(0);
  const [chargementEquipe, setChargementEquipe] = useState(true);
  const [erreurEquipe, setErreurEquipe]       = useState<string | null>(null);

  // ── État agents scan (mock — dynamisé plus tard) ───────────
  const [scanAgents, setScanAgents] = useState(mockScanAgents);

  // ── Filtres ────────────────────────────────────────────────
  const [searchTeam, setSearchTeam]                     = useState('');
  const [searchAgents, setSearchAgents]                 = useState('');
  const [searchHistory, setSearchHistory]               = useState('');
  const [historyEventFilter, setHistoryEventFilter]     = useState('all');
  const [historyTypeFilter, setHistoryTypeFilter]       = useState('all');

  // ── Dialogs ────────────────────────────────────────────────
  const [showTeamMemberDialog, setShowTeamMemberDialog] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember]     = useState<StructureUser | null>(null);
  const [showScanAgentDialog, setShowScanAgentDialog]   = useState(false);
  const [selectedScanAgent, setSelectedScanAgent]       = useState<ScanAgent | null>(null);
  const [showDeleteDialog, setShowDeleteDialog]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'team' | 'agent';
    item: StructureUser | ScanAgent;
  } | null>(null);

  // ── Récupération du structureId depuis le JWT ──────────────
  const utilisateur = obtenirUtilisateur<{
    structureId?: number;
    structure?: { id: number };
  }>();
  const structureId: number | null =
    utilisateur?.structureId ?? utilisateur?.structure?.id ?? null;

  // ── Chargement de l'équipe depuis l'API ────────────────────
  useEffect(() => {
    if (!structureId) {
      setErreurEquipe("Structure introuvable dans la session.");
      setChargementEquipe(false);
      return;
    }

    const chargerEquipe = async () => {
      setChargementEquipe(true);
      setErreurEquipe(null);

      const res = await recuperer<StructureUsersResponse>(
        `/api/auth/structure/${structureId}/users`,
        { afficherErreur: false } // on gère l'erreur nous-mêmes
      );

      if (res.succes && res.donnees) {
        setTeamMembers(res.donnees.users);
        setTotalEquipe(res.donnees.count);
      } else {
        setErreurEquipe(res.erreur ?? "Impossible de charger l'équipe.");
      }

      setChargementEquipe(false);
    };

    chargerEquipe();
  }, [structureId]);

  // ── Handlers équipe ────────────────────────────────────────
  // (UI only pour l'instant — les routes PATCH/DELETE sont à brancher)

  const handleAddTeamMember = () => {
    setSelectedTeamMember(null);
    setShowTeamMemberDialog(true);
  };

  const handleEditTeamMember = (member: StructureUser) => {
    setSelectedTeamMember(member);
    setShowTeamMemberDialog(true);
  };

  const handleDeleteTeamMember = (member: StructureUser) => {
    setDeleteTarget({ type: 'team', item: member });
    setShowDeleteDialog(true);
  };

  const handleToggleTeamMember = (member: StructureUser) => {
    // Optimistic UI — à remplacer par un appel PATCH quand la route existe
    setTeamMembers(prev =>
      prev.map(m => m.phone === member.phone ? { ...m, enabled: !m.enabled } : m)
    );
    afficherToast.succes(
      `${member.firstName} ${member.lastName} a été ${member.enabled ? 'désactivé' : 'activé'}`,
      member.enabled ? 'Membre désactivé' : 'Membre activé'
    );
  };

  // ── Handlers agents scan (mock) ────────────────────────────
  const handleAddScanAgent    = () => { setSelectedScanAgent(null); setShowScanAgentDialog(true); };
  const handleEditScanAgent   = (a: ScanAgent) => { setSelectedScanAgent(a); setShowScanAgentDialog(true); };
  const handleDeleteScanAgent = (a: ScanAgent) => { setDeleteTarget({ type: 'agent', item: a }); setShowDeleteDialog(true); };

  const handleToggleScanAgent = (a: ScanAgent) => {
    setScanAgents(prev => prev.map(ag => ag.id === a.id ? { ...ag, isActive: !ag.isActive } : ag));
    afficherToast.succes(
      `${a.name} a été ${a.isActive ? 'désactivé' : 'activé'}`,
      a.isActive ? 'Agent désactivé' : 'Agent activé'
    );
  };

  const handleSaveScanAgent = (
    agentData: Omit<ScanAgent, 'id' | 'createdAt' | 'lastActivity'> & { id?: string }
  ) => {
    if (agentData.id) {
      setScanAgents(prev => prev.map(a => a.id === agentData.id ? { ...a, ...agentData } : a));
    } else {
      setScanAgents(prev => [...prev, {
        id: `agent-${Date.now()}`,
        name: agentData.name,
        phone: agentData.phone,
        pin: agentData.pin,
        assignedEvents: agentData.assignedEvents,
        isActive: agentData.isActive,
        createdAt: new Date(),
      }]);
    }
  };

  // ── Confirmation suppression ───────────────────────────────
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'team') {
      const m = deleteTarget.item as StructureUser;
      // Optimistic UI — à remplacer par un appel DELETE quand la route existe
      setTeamMembers(prev => prev.filter(u => u.phone !== m.phone));
      setTotalEquipe(prev => Math.max(0, prev - 1));
      afficherToast.succes(`${m.firstName} ${m.lastName} a été supprimé`, 'Membre supprimé');
    } else {
      const a = deleteTarget.item as ScanAgent;
      setScanAgents(prev => prev.filter(ag => ag.id !== a.id));
      afficherToast.succes(`${a.name} a été supprimé`, 'Agent supprimé');
    }

    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  // ── Données filtrées ───────────────────────────────────────
  const filteredTeamMembers = teamMembers.filter(m =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTeam.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTeam.toLowerCase()) ||
    m.phone.includes(searchTeam)
  );

  const filteredScanAgents = scanAgents.filter(a =>
    a.name.toLowerCase().includes(searchAgents.toLowerCase()) ||
    a.phone.includes(searchAgents)
  );

  const filteredHistory = mockControlEvents.filter(event => {
    const matchesSearch =
      event.ticketCode.toLowerCase().includes(searchHistory.toLowerCase()) ||
      event.agentName.toLowerCase().includes(searchHistory.toLowerCase()) ||
      event.eventName.toLowerCase().includes(searchHistory.toLowerCase());
    const matchesEvent = historyEventFilter === 'all' || event.eventId === historyEventFilter;
    const matchesType  = historyTypeFilter  === 'all' || event.type    === historyTypeFilter;
    return matchesSearch && matchesEvent && matchesType;
  });

  // ── Stats summary ──────────────────────────────────────────
  const equipeActive  = teamMembers.filter(m => m.enabled).length;
  const agentsActifs  = scanAgents.filter(a => a.isActive).length;
  const totalScans    = mockControlEvents.filter(e => e.type === 'scan_success').length;
  const fraudAttempts = mockControlEvents.filter(e => e.type === 'fraud_attempt').length;

  const eventNames: Record<string, string> = {
    'evt-001': 'Concert Afrobeat Night',
    'evt-002': 'Festival Gaboma',
    'evt-003': 'Soirée Jazz & Wine',
  };
  const availableEvents = Object.entries(eventNames).map(([id, name]) => ({ id, name }));

  // ══════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-accs flex items-center justify-center">
          <Shield className="h-5 w-5 text-acc" />
        </div>
        <div>
          <h1 className="t-page-title">Accès & Contrôle</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Gérez votre équipe et contrôlez l'accès à vos événements
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accs flex items-center justify-center">
                <Users className="h-5 w-5 text-acc" />
              </div>
              <div>
                {chargementEquipe ? (
                  <Skeleton className="h-7 w-14 mb-1" />
                ) : (
                  <p className="t-num text-[26px] font-semibold tracking-[-0.024em]">
                    {equipeActive}
                    <span className="text-base font-normal text-muted-foreground">/4</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Équipe active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <QrCode className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="t-num text-[26px] font-semibold tracking-[-0.024em]">
                  {agentsActifs}
                  <span className="text-base font-normal text-muted-foreground">/{scanAgents.length}</span>
                </p>
                <p className="text-xs text-muted-foreground">Agents scan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-acc/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-acc" />
              </div>
              <div>
                <p className="t-num text-[26px] font-semibold tracking-[-0.024em]">{totalScans}</p>
                <p className="text-xs text-muted-foreground">Scans réussis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="t-num text-[26px] font-semibold tracking-[-0.024em]">{fraudAttempts}</p>
                <p className="text-xs text-muted-foreground">Fraudes détectées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="team" className="space-y-4">
        <TabsList>
          <TabsTrigger value="team">
            <Users className="h-4 w-4" />
            Équipe
            {/* Badge count depuis l'API */}
            {!chargementEquipe && totalEquipe > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {totalEquipe}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="agents">
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">Agents Scan</span>
            <span className="sm:hidden">Agents</span>
          </TabsTrigger>
          <TabsTrigger value="control">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Contrôle Live</span>
            <span className="sm:hidden">Live</span>
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Historique</span>
            <span className="sm:hidden">Hist.</span>
          </TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════
            ONGLET ÉQUIPE — données réelles via API
        ════════════════════════════════════════════════════ */}
        <TabsContent value="team" className="space-y-4">

          {/* Barre de recherche + bouton ajout */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un membre..."
                value={searchTeam}
                onChange={(e) => setSearchTeam(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button className="gap-2" onClick={handleAddTeamMember}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Ajouter un membre</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </div>

          {/* Erreur chargement */}
          {erreurEquipe && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{erreurEquipe}</p>
              </CardContent>
            </Card>
          )}

          {/* Grille — skeleton ou cards réelles */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {chargementEquipe
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonTeamCard key={i} />)
              : filteredTeamMembers.map(member => (
                  <TeamMemberCard
                    key={member.phone}
                    member={member}
                    onEdit={handleEditTeamMember}
                    onDelete={handleDeleteTeamMember}
                    onToggleActive={handleToggleTeamMember}
                  />
                ))
            }
          </div>

          {/* État vide */}
          {!chargementEquipe && !erreurEquipe && filteredTeamMembers.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-foreground">Aucun membre trouvé</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTeam
                    ? "Essayez avec d'autres termes"
                    : "Ajoutez votre premier membre d'équipe"}
                </p>
                {!searchTeam && (
                  <Button className="mt-4" onClick={handleAddTeamMember}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un membre
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ════════════════════════════════════════════════════
            ONGLET AGENTS SCAN — mock (inchangé)
        ════════════════════════════════════════════════════ */}
        <TabsContent value="agents" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un agent..."
                value={searchAgents}
                onChange={(e) => setSearchAgents(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button className="gap-2" onClick={handleAddScanAgent}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Ajouter un agent</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </div>

          <Card className="bg-accent/50 border-accent">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <QrCode className="h-5 w-5 text-accent-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium text-accent-foreground">Agents de scan</h4>
                  <p className="text-sm text-muted-foreground">
                    Les agents ont un accès limité : ils peuvent uniquement scanner les billets
                    des événements qui leur sont assignés. Ils se connectent via leur numéro
                    de téléphone et un code PIN à 4 chiffres.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredScanAgents.map(agent => (
              <ScanAgentCard
                key={agent.id}
                agent={agent}
                eventNames={eventNames}
                onEdit={handleEditScanAgent}
                onDelete={handleDeleteScanAgent}
                onToggleActive={handleToggleScanAgent}
              />
            ))}
          </div>

          {filteredScanAgents.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-foreground">Aucun agent trouvé</h3>
                <p className="text-sm text-muted-foreground">
                  {searchAgents ? "Essayez avec d'autres termes" : "Ajoutez votre premier agent de scan"}
                </p>
                {!searchAgents && (
                  <Button className="mt-4" onClick={handleAddScanAgent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un agent
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ════════════════════════════════════════════════════
            ONGLET CONTRÔLE LIVE — mock (inchangé)
        ════════════════════════════════════════════════════ */}
        <TabsContent value="control" className="space-y-4">
          <Card className="bg-acc/5 border-acc/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-acc mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-medium text-foreground">Contrôle en temps réel</h4>
                  <p className="text-sm text-muted-foreground">
                    Suivez les entrées et les incidents de vos événements en direct.
                    Les données sont actualisées automatiquement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockEventControlStats.map(stats => (
              <EventControlCard key={stats.eventId} stats={stats} />
            ))}
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════
            ONGLET HISTORIQUE — mock (inchangé)
        ════════════════════════════════════════════════════ */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par code, agent, événement..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={historyEventFilter} onValueChange={setHistoryEventFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Événement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les événements</SelectItem>
                  {Object.entries(eventNames).map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={historyTypeFilter} onValueChange={setHistoryTypeFilter}>
                <SelectTrigger className="w-full lg:w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="scan_success">Scans réussis</SelectItem>
                  <SelectItem value="scan_rejected">Scans refusés</SelectItem>
                  <SelectItem value="fraud_attempt">Fraudes</SelectItem>
                  <SelectItem value="anomaly">Anomalies</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vue mobile */}
          <div className="block lg:hidden space-y-3">
            {filteredHistory.map(event => (
              <Card key={event.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm font-medium truncate">{event.ticketCode}</p>
                      <p className="text-xs text-muted-foreground">{event.eventName}</p>
                    </div>
                    <ControlEventBadge type={event.type} />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{event.agentName}</span>
                    <span>{format(event.timestamp, 'dd/MM HH:mm', { locale: fr })}</span>
                  </div>
                  {event.details && (
                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      {event.details}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Vue desktop */}
          <div className="hidden lg:block">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Heure</TableHead>
                      <TableHead>Événement</TableHead>
                      <TableHead>Code billet</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Détails</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map(event => (
                      <TableRow key={event.id}>
                        <TableCell className="text-sm">
                          {format(event.timestamp, 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                        </TableCell>
                        <TableCell className="font-medium">{event.eventName}</TableCell>
                        <TableCell className="font-mono text-sm">{event.ticketCode}</TableCell>
                        <TableCell>{event.agentName}</TableCell>
                        <TableCell><ControlEventBadge type={event.type} /></TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {event.details || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {filteredHistory.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-foreground">Aucun historique trouvé</h3>
                <p className="text-sm text-muted-foreground">
                  Les événements de contrôle apparaîtront ici
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Dialogs ── */}
      <TeamMemberDialog
        member={selectedTeamMember}
        open={showTeamMemberDialog}
        onOpenChange={setShowTeamMemberDialog}
        onSave={() => {}} // à brancher quand la route POST existe
      />

      <ScanAgentDialog
        agent={selectedScanAgent}
        open={showScanAgentDialog}
        onOpenChange={setShowScanAgentDialog}
        onSave={handleSaveScanAgent}
        availableEvents={availableEvents}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={deleteTarget?.type === 'team' ? 'Supprimer ce membre ?' : 'Supprimer cet agent ?'}
        description={`Êtes-vous sûr de vouloir supprimer ${
          deleteTarget?.item
            ? 'type' in deleteTarget.item
              ? (deleteTarget.item as ScanAgent).name
              : `${(deleteTarget.item as StructureUser).firstName} ${(deleteTarget.item as StructureUser).lastName}`
            : ''
        } ? Cette action est irréversible.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}