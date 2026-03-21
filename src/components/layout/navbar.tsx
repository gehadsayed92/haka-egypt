'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Menu, X, User, Shield, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Matches' },
  ];

  return (
    <nav className={cn(
      'sticky top-0 z-40 transition-all duration-500',
      scrolled
        ? 'bg-[#06100a]/96 backdrop-blur-md shadow-lg shadow-black/40 border-b border-white/6'
        : 'bg-transparent border-b border-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.5rem]">

          {/* Logo */}
          <Link href="/" className="flex items-center group">
            {/* HAKA logo — use actual logo file if placed at /public/haka-logo.png */}
            <img
              src="/haka-logo.svg"
              alt="HAKA Egypt"
              className="h-8 w-auto"
              style={{ filter: 'drop-shadow(0 0 8px rgba(220,38,38,0.2))' }}
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                  pathname === link.href
                    ? 'text-red-400 bg-red-500/10'
                    : 'text-white/60 hover:text-white hover:bg-white/6'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {profile?.is_admin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-white/70 hover:text-white hover:bg-white/10">
                      <Shield className="w-4 h-4" /> Admin
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-white/70 hover:text-white hover:bg-white/10">
                    <User className="w-4 h-4" />
                    {profile?.full_name?.split(' ')[0] || 'Profile'}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={signOut} className="gap-1.5 border-white/15 text-white/70 hover:bg-white/10 hover:text-white">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="px-4 py-2 text-sm font-medium rounded-lg text-white/60 hover:text-white hover:bg-white/6 transition-colors">
                    Sign in
                  </button>
                </Link>
                <Link href="/events">
                  <button className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-all duration-200 shadow-md shadow-red-900/30 active:scale-95">
                    Find a Match
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-white/8 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/6 py-3 space-y-1 bg-[#06100a]/98 backdrop-blur-md rounded-b-2xl">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={cn(
                  'flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors',
                  pathname === link.href ? 'text-red-400 bg-red-500/10' : 'text-white/60 hover:text-white hover:bg-white/6'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/6">
              {user ? (
                <>
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/6 rounded-xl" onClick={() => setMobileOpen(false)}>
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  {profile?.is_admin && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/6 rounded-xl" onClick={() => setMobileOpen(false)}>
                      <Shield className="w-4 h-4" /> Admin
                    </Link>
                  )}
                  <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl" onClick={() => { signOut(); setMobileOpen(false); }}>
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-4 pt-1">
                  <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full border-white/15 text-white hover:bg-white/10">Sign in</Button>
                  </Link>
                  <Link href="/events" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <button className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors">
                      Find Match
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
