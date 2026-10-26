import { LucideIcon } from "@/components/icons";
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

/** Indicateur : libellé en capitales, icône cyan, grand chiffre tabulaire, sous-titre gris. */
export function StatsCard({ title, value, subtitle, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn('t-card p-[18px] animate-rise', className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="t-label">{title}</span>
        <Icon className="h-5 w-5 flex-none text-acc" />
      </div>
      <div className="t-num mt-3 text-[32px] font-semibold leading-tight tracking-[-0.03em]">{value}</div>
      {subtitle && <div className="mt-1 text-[13px] text-ink3">{subtitle}</div>}
      {trend && (
        <div className={cn('mt-1 text-[13px] font-medium', trend.isPositive ? 'text-acc' : 'text-acc2')}>
          {trend.isPositive ? '+' : ''}
          {trend.value}% vs mois dernier
        </div>
      )}
    </div>
  );
}
