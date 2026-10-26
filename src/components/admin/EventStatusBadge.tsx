import { cn } from '@/lib/utils';

interface EventStatusBadgeProps {
  status: string;
  className?: string;
}

/** Couleurs des statuts (README) : publié cyan, brouillon gris, en validation filet, annulé magenta. */
const statusConfig: Record<string, { label: string; className: string }> = {
  published: { label: 'Publié', className: 'bg-accs text-acc border-transparent' },
  draft: { label: 'Brouillon', className: 'bg-surf text-ink2 border-transparent' },
  pending_approval: { label: 'En validation', className: 'bg-transparent text-ink border-line2' },
  cancelled: { label: 'Annulé', className: 'bg-acc2s text-acc2 border-transparent' },
  completed: { label: 'Terminé', className: 'bg-surf text-ink3 border-transparent' },
  postponed: { label: 'Reporté', className: 'bg-transparent text-ink border-line2' },
  sold_out: { label: 'Complet', className: 'bg-accs text-acc border-transparent' },
};

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  // Repli sur le statut brut si le backend en renvoie un inconnu du front
  const config = statusConfig[(status ?? '').toLowerCase()] ?? { label: status, className: 'bg-surf text-ink2 border-transparent' };

  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-pill border px-2.5 py-1 text-[10.5px] font-semibold uppercase leading-none tracking-[0.1em]',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
