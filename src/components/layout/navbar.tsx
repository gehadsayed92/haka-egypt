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
    { href: '/events', label: 'Events' },
  ];

  return (
    <nav
      className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white border-b border-gray-100'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.5rem]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-orange-600 transition-colors shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
                <path d="M5 4h3v7l4-7h3l-4 7h4l-5 9V13H6l4-4H5V4z" fill="white" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-gray-900 text-base tracking-[0.08em] uppercase">HAKA</span>
              <span className="text-orange-500 text-[10px] font-bold tracking-[0.2em] uppercase">Egypt</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-orange-500 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Shield className="w-4 h-4" /> Admin
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <User className="w-4 h-4" />
                    {profile?.full_name?.split(' ')[0] || 'Profile'}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={signOut} className="gap-1.5">
                  <LogOut className="w-4 h-4" /> Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/register">
                  <button className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-full transition-all duration-200 shadow-sm hover:shadow-md active:scale-95">
                    Join Free
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors',
                  pathname === link.href
                    ? 'text-orange-500 bg-orange-50'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-gray-100">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  {profile?.is_admin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Shield className="w-4 h-4" /> Admin
                    </Link>
                  )}
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl"
                    onClick={() => { signOut(); setMobileOpen(false); }}
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-4 pt-1">
                  <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Sign in</Button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <button className="w-full py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-full transition-colors">
                      Join Free
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
