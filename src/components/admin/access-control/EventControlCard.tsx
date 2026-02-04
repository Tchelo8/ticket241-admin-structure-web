import { EventControlStats } from '@/types/accessControl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle, XCircle, AlertTriangle, AlertCircle, Clock, Ticket } from 'lucide-react';

interface EventControlCardProps {
  stats: EventControlStats;
}

export function EventControlCard({ stats }: EventControlCardProps) {
  const scanProgress = stats.totalTickets > 0 
    ? (stats.scannedTickets / stats.totalTickets) * 100 
    : 0;
  
  const isLive = stats.scannedTickets > 0 || new Date() >= stats.eventDate;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold truncate">{stats.eventName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {format(stats.eventDate, 'EEEE dd MMMM yyyy à HH:mm', { locale: fr })}
            </p>
          </div>
          <Badge 
            variant="outline" 
            className={isLive 
              ? 'bg-green-500/10 text-green-600 border-green-500/20 animate-pulse' 
              : 'bg-muted text-muted-foreground'
            }
          >
            {isLive ? '🔴 En cours' : 'À venir'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Progression des entrées</span>
            </div>
            <span className="font-medium">
              {stats.scannedTickets} / {stats.totalTickets}
            </span>
          </div>
          <Progress value={scanProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {scanProgress.toFixed(1)}% scannés
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-lg font-semibold text-green-600">{stats.scannedTickets}</p>
              <p className="text-xs text-muted-foreground">Scannés</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10">
            <XCircle className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-lg font-semibold text-orange-600">{stats.rejectedScans}</p>
              <p className="text-xs text-muted-foreground">Refusés</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <div>
              <p className="text-lg font-semibold text-destructive">{stats.fraudAttempts}</p>
              <p className="text-xs text-muted-foreground">Fraudes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <div>
              <p className="text-lg font-semibold text-yellow-600">{stats.anomalies}</p>
              <p className="text-xs text-muted-foreground">Anomalies</p>
            </div>
          </div>
        </div>

        {/* Last activity */}
        {stats.lastActivity && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="h-3.5 w-3.5" />
            <span>Dernière activité: {format(stats.lastActivity, 'HH:mm:ss', { locale: fr })}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
