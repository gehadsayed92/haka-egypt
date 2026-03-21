import Link from 'next/link';
import { Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit group">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center group-hover:bg-orange-600 transition-colors shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
                  <path d="M5 4h3v7l4-7h3l-4 7h4l-5 9V13H6l4-4H5V4z" fill="white" />
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-white text-base tracking-[0.08em] uppercase">HAKA</span>
                <span className="text-orange-500 text-[10px] font-bold tracking-[0.2em] uppercase">Egypt</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Egypt&apos;s community platform for events, adventures, and connections. Join thousands of young Egyptians living their best lives.
            </p>
            <div className="flex items-center gap-2.5 mt-5">
              {[
                { Icon: Instagram, href: 'https://www.instagram.com/hakaegypt/' },
                { Icon: Twitter, href: '#' },
                { Icon: Youtube, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 bg-gray-800 hover:bg-orange-500 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Explore</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/events', label: 'All Events' },
                { href: '/events', label: 'Adventures' },
                { href: '/events', label: 'Social' },
                { href: '/events', label: 'Nightlife' },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm hover:text-orange-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Account</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/register', label: 'Join Free' },
                { href: '/login', label: 'Sign In' },
                { href: '/profile', label: 'My Profile' },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm hover:text-orange-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">&copy; {new Date().getFullYear()} Haka Egypt. Built for the community.</p>
          <p className="text-xs">Made with ❤️ in Cairo 🇪🇬</p>
        </div>
      </div>
    </footer>
  );
}
