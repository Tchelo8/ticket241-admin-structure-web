import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  PlusCircle, 
  Ticket,
  LogOut,
  Menu,
  X,
  Building2,
  TrendingUp,
  ScanLine,
  KeyRound,
  Bell,
  HelpCircle,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Événements', href: '/admin/events', icon: CalendarDays },
  { name: 'Créer un événement', href: '/admin/events/create', icon: PlusCircle },
  { name: 'Ma structure', href: '/admin/organization', icon: Building2 },
  { name: 'Statistiques & Performances', href: '/admin/statistics', icon: TrendingUp },
  { name: 'Agent de Scan', href: '/admin/scan-agents', icon: ScanLine },
  { name: 'Accès & contrôle', href: '/admin/access-control', icon: KeyRound },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Support & assistance', href: '/admin/support', icon: HelpCircle },
  { name: 'Sécurité & accès', href: '/admin/security', icon: Shield },
];

export function AdminSidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <Ticket className="h-5 w-5 text-accent-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-sidebar-accent-foreground">Ticket241</span>
          <span className="text-xs text-sidebar-muted">Espace Organisateur</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                active
                  ? 'sidebar-item-active'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', active && 'text-sidebar-primary')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-accent-foreground">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
              Jean Dupont
            </p>
            <p className="text-xs text-sidebar-muted truncate">
              organisateur@email.com
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-sidebar flex items-center px-4 border-b border-sidebar-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        <div className="flex items-center gap-2 ml-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Ticket className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-accent-foreground">Ticket241</span>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed top-16 left-0 bottom-0 z-40 w-64 bg-sidebar transform transition-transform duration-300',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar">
        <SidebarContent />
      </aside>
    </>
  );
}
