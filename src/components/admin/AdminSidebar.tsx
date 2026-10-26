import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Building2,
  ChartLineUp,
  KeyRound,
  Bell,
  Landmark,
  LogOut,
  Sun,
  Moon,
  CircleHalf,
  BadgeCheck,
  SealWarning,
  type LucideIcon,
} from "@/components/icons";
import { cn } from '@/lib/utils';
import { deconnecter } from '@/lib/Transmission';
import { THEMES, useTheme, type Theme } from '@/lib/theme';
import { initiales, libelleRole, useSession, useStructure } from '@/hooks/use-structure';
import { mockNotifications } from '@/data/mockNotifications';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const navigation: { name: string; href: string; icon: LucideIcon }[] = [
  { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
  { name: 'Événements', href: '/admin/events', icon: Calendar },
  { name: 'Créer un événement', href: '/admin/events/create', icon: PlusCircle },
  { name: 'Ma structure', href: '/admin/organization', icon: Building2 },
  { name: 'Statistiques', href: '/admin/statistics', icon: ChartLineUp },
  { name: 'Accès & contrôle', href: '/admin/access-control', icon: KeyRound },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Finances', href: '/admin/finances', icon: Landmark },
];

const THEME_ICONS: Record<Theme, LucideIcon> = { paper: Sun, ink: Moon, mono: CircleHalf };

/** Nombre de notifications non lues (affiché en pastille magenta et dans l'en-tête). */
export const nombreNonLues = () => mockNotifications.filter((n) => !n.read).length;

interface AdminSidebarProps {
  /** Sous 980px, la barre latérale devient un tiroir */
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const session = useSession();
  const { data: structure } = useStructure();
  const { theme, setTheme } = useTheme();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const nonLues = nombreNonLues();

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    if (path === '/admin/events') {
      return location.pathname.startsWith(path) && !location.pathname.startsWith('/admin/events/create');
    }
    return location.pathname.startsWith(path);
  };

  const fullName = `${session?.firstName ?? ''} ${session?.lastName ?? ''}`.trim() || 'Utilisateur';
  const structureName = structure?.nom ?? 'Ma structure';

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-[rgba(16,15,14,.44)] animate-fade-in nav:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'z-[70] flex h-screen w-64 flex-none flex-col border-r border-line bg-side',
          'fixed inset-y-0 left-0 nav:sticky nav:top-0 nav:flex',
          open ? 'flex animate-slide-in' : 'hidden',
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 pb-4 pt-5">
          <img src="/brand/logo.png" alt="Ticket241" className="t-logo h-7" />
          <span className="t-label pt-1 !text-[10px]">Organisateur</span>
        </div>

        {/* Carte structure */}
        <Link
          to="/admin/organization"
          onClick={onClose}
          className="mx-3.5 flex items-center gap-2.5 rounded-md border border-line bg-card p-3 text-ink no-underline"
        >
          {structure?.logoUrl ? (
            <img src={structure.logoUrl} alt="" className="t-img h-9 w-9 flex-none rounded-md object-cover" />
          ) : (
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-accs text-sm font-bold text-acc">
              {initiales(structureName)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{structureName}</div>
            {structure?.isVerified ? (
              <div className="flex items-center gap-1 text-[11.5px] text-acc">
                <BadgeCheck className="h-[13px] w-[13px]" />
                Vérifiée
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11.5px] text-acc2">
                <SealWarning className="h-[13px] w-[13px]" />
                Non vérifiée
              </div>
            )}
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-4">
          {navigation.map((item) => {
            const active = isActive(item.href);
            const showBadge = item.href === '/admin/notifications' && nonLues > 0;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex items-center gap-3 rounded-[5px] px-3 py-2.5 text-[14.5px] no-underline transition-colors duration-200 hover:bg-card',
                  active ? 'bg-card font-semibold text-ink' : 'text-ink2',
                )}
              >
                <span
                  className={cn('absolute bottom-[9px] left-0 top-[9px] w-[3px] rounded-[3px]', active ? 'bg-acc' : 'bg-transparent')}
                />
                <item.icon className="h-[19px] w-[19px]" weight={active ? 'fill' : 'duotone'} />
                <span className="flex-1">{item.name}</span>
                {showBadge && (
                  <span className="t-num h-5 min-w-5 rounded-pill bg-acc2 px-1.5 text-center text-[11px] font-semibold leading-5 text-white">
                    {nonLues}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Thème + utilisateur */}
        <div className="border-t border-line p-3.5">
          <div className="mb-3 flex gap-[3px] rounded-pill bg-bg p-[3px]" role="radiogroup" aria-label="Thème">
            {THEMES.map((t) => {
              const Icon = THEME_ICONS[t.id];
              const selected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  title={t.label}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    'flex h-7 flex-1 items-center justify-center gap-1.5 rounded-pill text-[11.5px] transition-all',
                    selected ? 'bg-card text-ink shadow-sh' : 'text-ink3 hover:text-ink2',
                  )}
                >
                  <Icon className="h-[13px] w-[13px]" />
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full border border-line bg-card text-[12.5px] font-semibold text-ink2">
              {initiales(fullName, 'U')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] font-semibold">{fullName}</div>
              <div className="truncate text-[11.5px] text-ink3">{libelleRole(session?.roles)}</div>
            </div>
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              title="Déconnexion"
              aria-label="Déconnexion"
              className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full border border-line text-ink2 transition-colors hover:bg-card hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous devrez saisir à nouveau votre numéro et votre mot de passe pour revenir dans l’espace organisateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deconnecter()}>Se déconnecter</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
