import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TeamMemberCard } from '@/components/admin/access-control/TeamMemberCard';
import { ScanAgentCard } from '@/components/admin/access-control/ScanAgentCard';
import { EventControlCard } from '@/components/admin/access-control/EventControlCard';
import { ControlEventBadge } from '@/components/admin/access-control/ControlEventBadge';
import { TeamMemberDialog } from '@/components/admin/access-control/TeamMemberDialog';
import { ScanAgentDialog } from '@/components/admin/access-control/ScanAgentDialog';
import { DeleteConfirmDialog } from '@/components/admin/access-control/DeleteConfirmDialog';
import { 
  mockTeamMembers, 
  mockScanAgents, 
  mockControlEvents, 
  mockEventControlStats 
} from '@/data/mockAccessControl';
import { TeamMember, ScanAgent, TeamRole } from '@/types/accessControl';
import { useToast } from '@/hooks/use-toast';

export default function AccessControlPage() {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [scanAgents, setScanAgents] = useState(mockScanAgents);
  const [searchTeam, setSearchTeam] = useState('');
  const [searchAgents, setSearchAgents] = useState('');
  const [searchHistory, setSearchHistory] = useState('');
  const [historyEventFilter, setHistoryEventFilter] = useState('all');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('all');

  // Dialog states
  const [showTeamMemberDialog, setShowTeamMemberDialog] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
  const [showScanAgentDialog, setShowScanAgentDialog] = useState(false);
  const [selectedScanAgent, setSelectedScanAgent] = useState<ScanAgent | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'team' | 'agent'; item: TeamMember | ScanAgent } | null>(null);

  // Event names mapping for display
  const eventNames: Record<string, string> = {
    'evt-001': 'Concert Afrobeat Night',
    'evt-002': 'Festival Gaboma',
    'evt-003': 'Soirée Jazz & Wine',
  };

  const availableEvents = [
    { id: 'evt-001', name: 'Concert Afrobeat Night' },
    { id: 'evt-002', name: 'Festival Gaboma' },
    { id: 'evt-003', name: 'Soirée Jazz & Wine' },
  ];

  // Handlers for team members
  const handleAddTeamMember = () => {
    setSelectedTeamMember(null);
    setShowTeamMemberDialog(true);
  };

  const handleEditTeamMember = (member: TeamMember) => {
    setSelectedTeamMember(member);
    setShowTeamMemberDialog(true);
  };

  const handleSaveTeamMember = (memberData: Omit<TeamMember, 'id' | 'createdAt' | 'lastLogin'> & { id?: string }) => {
    if (memberData.id) {
      // Update existing member
      setTeamMembers(prev => prev.map(m => 
        m.id === memberData.id 
          ? { ...m, ...memberData }
          : m
      ));
    } else {
      // Add new member
      const newMember: TeamMember = {
        id: `member-${Date.now()}`,
        name: memberData.name,
        email: memberData.email,
        phone: memberData.phone,
        role: memberData.role,
        isActive: memberData.isActive,
        createdAt: new Date(),
      };
      setTeamMembers(prev => [...prev, newMember]);
    }
  };

  const handleDeleteTeamMember = (member: TeamMember) => {
    setDeleteTarget({ type: 'team', item: member });
    setShowDeleteDialog(true);
  };

  const handleToggleTeamMember = (member: TeamMember) => {
    setTeamMembers(prev => 
      prev.map(m => m.id === member.id ? { ...m, isActive: !m.isActive } : m)
    );
    toast({
      title: member.isActive ? 'Membre désactivé' : 'Membre activé',
      description: `${member.name} a été ${member.isActive ? 'désactivé' : 'activé'}`,
    });
  };

  // Handlers for scan agents
  const handleAddScanAgent = () => {
    setSelectedScanAgent(null);
    setShowScanAgentDialog(true);
  };

  const handleEditScanAgent = (agent: ScanAgent) => {
    setSelectedScanAgent(agent);
    setShowScanAgentDialog(true);
  };

  const handleSaveScanAgent = (agentData: Omit<ScanAgent, 'id' | 'createdAt' | 'lastActivity'> & { id?: string }) => {
    if (agentData.id) {
      // Update existing agent
      setScanAgents(prev => prev.map(a => 
        a.id === agentData.id 
          ? { ...a, ...agentData }
          : a
      ));
    } else {
      // Add new agent
      const newAgent: ScanAgent = {
        id: `agent-${Date.now()}`,
        name: agentData.name,
        phone: agentData.phone,
        pin: agentData.pin,
        assignedEvents: agentData.assignedEvents,
        isActive: agentData.isActive,
        createdAt: new Date(),
      };
      setScanAgents(prev => [...prev, newAgent]);
    }
  };

  const handleDeleteScanAgent = (agent: ScanAgent) => {
    setDeleteTarget({ type: 'agent', item: agent });
    setShowDeleteDialog(true);
  };

  const handleToggleScanAgent = (agent: ScanAgent) => {
    setScanAgents(prev => 
      prev.map(a => a.id === agent.id ? { ...a, isActive: !a.isActive } : a)
    );
    toast({
      title: agent.isActive ? 'Agent désactivé' : 'Agent activé',
      description: `${agent.name} a été ${agent.isActive ? 'désactivé' : 'activé'}`,
    });
  };

  // Confirm delete handler
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'team') {
      const member = deleteTarget.item as TeamMember;
      setTeamMembers(prev => prev.filter(m => m.id !== member.id));
      toast({
        title: 'Membre supprimé',
        description: `${member.name} a été supprimé de l'équipe`,
      });
    } else {
      const agent = deleteTarget.item as ScanAgent;
      setScanAgents(prev => prev.filter(a => a.id !== agent.id));
      toast({
        title: 'Agent supprimé',
        description: `${agent.name} a été supprimé`,
      });
    }

    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  // Filtered data
  const filteredTeamMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTeam.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTeam.toLowerCase())
  );

  const filteredScanAgents = scanAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchAgents.toLowerCase()) ||
    agent.phone.includes(searchAgents)
  );

  const filteredHistory = mockControlEvents.filter(event => {
    const matchesSearch = 
      event.ticketCode.toLowerCase().includes(searchHistory.toLowerCase()) ||
      event.agentName.toLowerCase().includes(searchHistory.toLowerCase()) ||
      event.eventName.toLowerCase().includes(searchHistory.toLowerCase());
    const matchesEvent = historyEventFilter === 'all' || event.eventId === historyEventFilter;
    const matchesType = historyTypeFilter === 'all' || event.type === historyTypeFilter;
    return matchesSearch && matchesEvent && matchesType;
  });

  // Stats
  const teamStats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.isActive).length,
    admins: teamMembers.filter(m => m.role === 'admin').length,
  };

  const agentStats = {
    total: scanAgents.length,
    active: scanAgents.filter(a => a.isActive).length,
  };

  const controlStats = {
    totalScans: mockControlEvents.filter(e => e.type === 'scan_success').length,
    rejections: mockControlEvents.filter(e => e.type === 'scan_rejected').length,
    fraudAttempts: mockControlEvents.filter(e => e.type === 'fraud_attempt').length,
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Accès & Contrôle</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Gérez votre équipe et contrôlez l'accès à vos événements
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamStats.active}/{teamStats.total}</p>
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
                <p className="text-2xl font-bold">{agentStats.active}/{agentStats.total}</p>
                <p className="text-xs text-muted-foreground">Agents scan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{controlStats.totalScans}</p>
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
                <p className="text-2xl font-bold">{controlStats.fraudAttempts}</p>
                <p className="text-xs text-muted-foreground">Fraudes détectées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="team" className="space-y-4">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted p-1">
          <TabsTrigger value="team" className="flex-1 min-w-[140px] gap-2 data-[state=active]:bg-background">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Équipe</span>
            <span className="sm:hidden">Équipe</span>
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex-1 min-w-[140px] gap-2 data-[state=active]:bg-background">
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">Agents Scan</span>
            <span className="sm:hidden">Agents</span>
          </TabsTrigger>
          <TabsTrigger value="control" className="flex-1 min-w-[140px] gap-2 data-[state=active]:bg-background">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Contrôle Live</span>
            <span className="sm:hidden">Live</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 min-w-[140px] gap-2 data-[state=active]:bg-background">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Historique</span>
            <span className="sm:hidden">Hist.</span>
          </TabsTrigger>
        </TabsList>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeamMembers.map(member => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onEdit={handleEditTeamMember}
                onDelete={handleDeleteTeamMember}
                onToggleActive={handleToggleTeamMember}
              />
            ))}
          </div>

          {filteredTeamMembers.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-foreground">Aucun membre trouvé</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTeam ? 'Essayez avec d\'autres termes' : 'Ajoutez votre premier membre d\'équipe'}
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

        {/* Scan Agents Tab */}
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
                    Les agents ont un accès limité : ils peuvent uniquement scanner les billets des événements qui leur sont assignés. 
                    Ils se connectent via leur numéro de téléphone et un code PIN à 4 chiffres.
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
                  {searchAgents ? 'Essayez avec d\'autres termes' : 'Ajoutez votre premier agent de scan'}
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

        {/* Live Control Tab */}
        <TabsContent value="control" className="space-y-4">
          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-green-600 mt-0.5 animate-pulse" />
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

        {/* History Tab */}
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

          {/* Mobile cards view */}
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

          {/* Desktop table view */}
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
                        <TableCell>
                          <ControlEventBadge type={event.type} />
                        </TableCell>
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

      {/* Dialogs */}
      <TeamMemberDialog
        member={selectedTeamMember}
        open={showTeamMemberDialog}
        onOpenChange={setShowTeamMemberDialog}
        onSave={handleSaveTeamMember}
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
        description={`Êtes-vous sûr de vouloir supprimer ${deleteTarget?.item.name} ? Cette action est irréversible.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
