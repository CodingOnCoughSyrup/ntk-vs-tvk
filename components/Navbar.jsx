import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => {
      if (window.matchMedia('(min-width: 768px)').matches) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/issues', label: 'Issues Addressed' },
    { href: '/protests', label: 'Protest & People Meet' },
    { href: '/press-meets', label: 'Press Meets' },
    { href: '/conferences', label: 'Conferences' },
  ];

  return (
    <nav className="w-full flex justify-center py-4">
      <div className="w-full max-w-6xl px-4">
        {/* Desktop navbar */}
        <div className="hidden md:flex justify-center">
          <div className="tile flex gap-3">
            {links.map(l => (
              <Link key={l.href} className="px-3 py-1 rounded-lg hover:opacity-90" href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile navbar with hamburger */}
        <div className="md:hidden">
          <div className="tile flex items-center justify-between">
            <div className="font-semibold">Menu</div>
            <button
              className="px-3 py-2 rounded-lg bg-gray-200/70 dark:bg-white/10"
              aria-controls="mobile-nav"
              aria-expanded={open ? 'true' : 'false'}
              onClick={() => setOpen(o => !o)}
              title="Toggle navigation"
            >
              {/* Simple hamburger icon */}
              <span className="block w-6 h-0.5 bg-current mb-1"></span>
              <span className="block w-6 h-0.5 bg-current mb-1"></span>
              <span className="block w-6 h-0.5 bg-current"></span>
            </button>
          </div>
          {open && (
            <div id="mobile-nav" className="tile mt-2 flex flex-col gap-2">
              {links.map(l => (
                <Link
                  key={l.href}
                  className="px-3 py-2 rounded-lg hover:opacity-90"
                  href={l.href}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
