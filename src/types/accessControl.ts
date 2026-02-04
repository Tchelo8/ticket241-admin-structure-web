// Team Member Roles
export type TeamRole = 'admin' | 'event_manager' | 'ticket_controller';

export const TEAM_ROLES: Record<TeamRole, { label: string; description: string; color: string }> = {
  admin: {
    label: 'Administrateur',
    description: 'Accès complet à toutes les fonctionnalités',
    color: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  event_manager: {
    label: 'Gestionnaire d\'événements',
    description: 'Création et gestion des événements',
    color: 'bg-primary/10 text-primary border-primary/20',
  },
  ticket_controller: {
    label: 'Contrôleur de billets',
    description: 'Scan et vérification des billets uniquement',
    color: 'bg-muted text-muted-foreground border-border',
  },
};

// Team Member
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: TeamRole;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

// Scan Agent - Limited access for field control
export interface ScanAgent {
  id: string;
  name: string;
  phone: string;
  pin: string; // 4-digit PIN for authentication
  assignedEvents: string[]; // Event UUIDs
  isActive: boolean;
  createdAt: Date;
  lastActivity?: Date;
}

// Control Event Types
export type ControlEventType = 'scan_success' | 'scan_rejected' | 'fraud_attempt' | 'anomaly';

export const CONTROL_EVENT_TYPES: Record<ControlEventType, { label: string; color: string; icon: string }> = {
  scan_success: {
    label: 'Scan réussi',
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    icon: 'check',
  },
  scan_rejected: {
    label: 'Scan refusé',
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    icon: 'x',
  },
  fraud_attempt: {
    label: 'Tentative de fraude',
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: 'alert-triangle',
  },
  anomaly: {
    label: 'Anomalie',
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    icon: 'alert-circle',
  },
};

// Control Event Log
export interface ControlEvent {
  id: string;
  eventId: string;
  eventName: string;
  type: ControlEventType;
  ticketCode: string;
  agentId: string;
  agentName: string;
  timestamp: Date;
  details?: string;
}

// Real-time stats for an event
export interface EventControlStats {
  eventId: string;
  eventName: string;
  eventDate: Date;
  totalTickets: number;
  scannedTickets: number;
  rejectedScans: number;
  fraudAttempts: number;
  anomalies: number;
  lastActivity?: Date;
}
