import { ControlEventType, CONTROL_EVENT_TYPES } from '@/types/accessControl';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, AlertCircle } from 'lucide-react';

interface ControlEventBadgeProps {
  type: ControlEventType;
}

const iconMap = {
  scan_success: CheckCircle,
  scan_rejected: XCircle,
  fraud_attempt: AlertTriangle,
  anomaly: AlertCircle,
};

export function ControlEventBadge({ type }: ControlEventBadgeProps) {
  const config = CONTROL_EVENT_TYPES[type];
  const Icon = iconMap[type];

  return (
    <Badge variant="outline" className={`${config.color} gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
