import type { ReactNode } from 'react';

/** Écran d'authentification : panneau photo sombre à gauche, formulaire à droite. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-wrap bg-bg text-ink animate-fade-in">
      <div className="relative min-h-[clamp(260px,40vh,100vh)] flex-[1_1_440px] overflow-hidden bg-[#141312]">
        <img src="/brand/party.png" alt="" className="t-img absolute inset-0 h-full w-full object-cover opacity-[.55]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(12,11,10,.92),rgba(12,11,10,.25)_70%)]" />
        <div className="absolute left-[clamp(24px,5vw,56px)] right-[clamp(24px,5vw,56px)] top-[clamp(24px,5vw,48px)] flex items-center gap-3">
          <img src="/brand/logo.png" alt="Ticket241" className="h-[34px] [filter:brightness(0)_invert(1)]" />
          <span className="rounded-pill border border-white/40 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white">
            Espace organisateur
          </span>
        </div>
        <div className="absolute bottom-[clamp(28px,6vw,64px)] left-[clamp(24px,5vw,56px)] right-[clamp(24px,5vw,56px)] text-white">
          <div className="h-[3px] w-[72px] bg-white" />
          <h1 className="mt-[18px] text-[clamp(34px,4.4vw,56px)] font-semibold leading-[1.02] tracking-[-0.032em] [text-wrap:balance]">
            Vos soirées,
            <br />
            <span className="font-normal italic">vos chiffres, vos entrées.</span>
          </h1>
          <p className="mt-4 max-w-[460px] text-[16.5px] leading-[1.55] opacity-[.86]">
            Publiez vos événements, suivez vos ventes en direct, contrôlez les accès au QR code et recevez vos revenus en
            mobile money.
          </p>
        </div>
      </div>

      <div className="flex flex-[1_1_420px] items-center justify-center px-[clamp(20px,4vw,48px)] py-[clamp(28px,5vw,64px)]">
        <div className="w-full max-w-[420px] animate-rise">{children}</div>
      </div>
    </div>
  );
}

/** Champ de l'écran d'authentification : 54px, icône à gauche, action optionnelle à droite. */
export function AuthField({ icon, children, action }: { icon: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mt-2 flex h-[54px] items-center gap-3 rounded-sm border border-line2 bg-card px-4 shadow-sh transition-colors focus-within:border-acc">
      <span className="flex text-ink3">{icon}</span>
      {children}
      {action}
    </div>
  );
}

/** Classe des <input> nus placés dans AuthField. */
export const authInputClass =
  'min-w-0 flex-1 border-none bg-transparent text-base text-ink outline-none placeholder:text-ink3 t-num focus-visible:outline-none';
