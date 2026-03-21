import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Calendar, Users, Home, ClipboardList } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) redirect('/');

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-white/6" style={{ background: 'var(--bg-card)' }}>
        <div className="p-5 border-b border-white/6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-red-600 group-hover:bg-red-500 rounded-lg flex items-center justify-center transition-colors shadow-md shadow-red-900/30">
              <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
                <rect x="4" y="4" width="24" height="24" rx="3" stroke="white" strokeWidth="2" fill="none" opacity="0.4"/>
                <circle cx="16" cy="16" r="5" fill="white"/>
                <line x1="16" y1="4" x2="16" y2="12" stroke="white" strokeWidth="2"/>
                <line x1="16" y1="20" x2="16" y2="28" stroke="white" strokeWidth="2"/>
                <line x1="4" y1="16" x2="12" y2="16" stroke="white" strokeWidth="2"/>
                <line x1="20" y1="16" x2="28" y2="16" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <span className="font-black text-white block text-sm tracking-wide">HAKA Egypt</span>
              <span className="text-red-400 text-[10px] font-bold tracking-widest uppercase">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {[
            { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/admin/registrations', label: 'Registrations', icon: ClipboardList },
            { href: '/admin/events', label: 'Events', icon: Calendar },
            { href: '/admin/users', label: 'Users', icon: Users },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors group"
            >
              <Icon className="w-4 h-4 group-hover:text-red-400 transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/6">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:text-gray-400 hover:bg-white/4 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
