import type { ReactNode } from 'react';

/** Titre de section numéroté du formulaire d'événement (« 01 Informations générales »). */
export function SectionTitle({ n, children, hint }: { n: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-3">
      <span className="t-num text-[13px] font-bold text-acc">{n}</span>
      <h2 className="m-0 flex-1 text-[20px] font-semibold tracking-[-0.02em]">{children}</h2>
      {hint}
    </div>
  );
}
