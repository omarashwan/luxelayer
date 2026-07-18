import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Tags, FolderTree, Image as ImageIcon,
  Users, Ticket, LogOut, Menu, X, ExternalLink, Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { classNames, initials } from '../../lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: typeof Package;
}

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'brands', label: 'Brands', icon: Tags },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'coupons', label: 'Coupons', icon: Ticket },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'content', label: 'Content', icon: ImageIcon },
];

interface AdminShellProps {
  active: string;
  onNavigate: (id: string) => void;
  children: ReactNode;
}

export function AdminShell({ active, onNavigate, children }: AdminShellProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeNav = NAV.find((n) => n.id === active);

  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* Sidebar */}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 w-64 transform bg-ink-900 text-warmwhite transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-ink-800 px-6 py-5">
            <Link to="/" className="font-display text-xl font-semibold">
              Luxe<span className="text-gradient-gold">Layer</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                className={classNames(
                  'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                  active === item.id ? 'bg-warmwhite/10 text-warmwhite' : 'text-ink-300 hover:bg-warmwhite/5 hover:text-warmwhite',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-ink-800 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-ink-800 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-champagne-400 to-gold-500 text-xs font-semibold text-ink-900">
                {initials(profile?.first_name, profile?.last_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium text-warmwhite">{profile?.first_name} {profile?.last_name}</p>
                <p className="truncate text-[10px] text-ink-400">Administrator</p>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <Link to="/" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ink-800 py-2 text-xs font-medium text-warmwhite transition hover:bg-ink-700">
                <ExternalLink className="h-3 w-3" /> Store
              </Link>
              <button
                onClick={() => { signOut(); navigate('/'); }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ink-800 py-2 text-xs font-medium text-warmwhite transition hover:bg-ink-700"
              >
                <LogOut className="h-3 w-3" /> Exit
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-ink-900/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-200 bg-warmwhite px-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="h-5 w-5 text-ink-700" />
            </button>
            <h1 className="font-display text-lg font-medium text-ink-900">{activeNav?.label ?? 'Dashboard'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-2 text-ink-600 hover:bg-ink-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
            </button>
            <span className="text-xs text-ink-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
        </header>
        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
