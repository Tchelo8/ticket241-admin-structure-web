import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Menu, Plus } from "@/components/icons";
import { AdminSidebar, nombreNonLues } from './AdminSidebar';
import { useStructure } from '@/hooks/use-structure';

/** Libellé du fil d'Ariane selon la route */
const crumbFor = (path: string) => {
  if (path === '/admin') return 'Tableau de bord';
  if (path === '/admin/events') return 'Événements';
  if (path === '/admin/events/create') return 'Créer un événement';
  if (path.endsWith('/edit')) return 'Modifier l’événement';
  if (path.startsWith('/admin/events/')) return 'Détail de l’événement';
  if (path.startsWith('/admin/organization')) return 'Ma structure';
  if (path.startsWith('/admin/statistics')) return 'Statistiques & performances';
  if (path.startsWith('/admin/access-control')) return 'Accès & contrôle';
  if (path.startsWith('/admin/notifications')) return 'Notifications';
  if (path.startsWith('/admin/finances')) return 'Finances & paiements';
  return '';
};

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: structure } = useStructure();
  const [navOpen, setNavOpen] = useState(false);
  const hasUnread = nombreNonLues() > 0;

  // Le tiroir se referme à chaque changement de page
  useEffect(() => setNavOpen(false), [location.pathname]);

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-[var(--glass)] backdrop-blur-[14px]">
          <div className="flex items-center gap-3.5 px-[clamp(16px,3vw,36px)] py-3">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="Menu"
              className="flex h-10 w-10 items-center justify-center rounded-[5px] border border-line bg-card text-ink nav:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden whitespace-nowrap text-[13.5px] text-ink3">
              <Link to="/admin" className="truncate text-ink3 no-underline hover:text-ink2">
                {structure?.nom ?? 'Ticket241'}
              </Link>
              <ChevronRight className="h-3 w-3 flex-none" />
              <span className="truncate font-semibold text-ink">{crumbFor(location.pathname)}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/notifications')}
              aria-label="Notifications"
              className="relative flex h-10 w-10 flex-none items-center justify-center rounded-full border border-line bg-card text-ink"
            >
              <Bell className="h-[19px] w-[19px]" />
              {hasUnread && <span className="absolute right-[9px] top-2 h-[7px] w-[7px] rounded-full bg-acc2" />}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/events/create')}
              className="flex h-10 flex-none items-center gap-2 whitespace-nowrap rounded-sm bg-acc px-4 text-[14.5px] font-semibold text-on-acc transition-colors hover:bg-acc/90"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Créer un événement</span>
              <span className="sm:hidden">Créer</span>
            </button>
          </div>
        </header>

        <main
          key={location.pathname}
          className="mx-auto w-full max-w-[1320px] flex-1 px-[clamp(16px,3vw,36px)] pb-12 pt-[clamp(20px,3vw,36px)] page-transition"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
