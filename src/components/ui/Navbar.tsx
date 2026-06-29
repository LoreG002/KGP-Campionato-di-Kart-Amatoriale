import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Flag, Lock } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/classifica', label: 'Classifica' },
  { to: '/gare', label: 'Gare' },
  { to: '/piloti', label: 'Piloti' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-lime-400 rounded flex items-center justify-center group-hover:shadow-[0_0_12px_#a3e635] transition-shadow">
              <Flag className="w-5 h-5 text-zinc-950" />
            </div>
            <span className="font-rajdhani font-bold text-xl text-white tracking-wider uppercase">
              K<span className="text-lime-400">-GP</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded font-rajdhani font-semibold text-sm tracking-widest uppercase transition-all duration-200
                  ${pathname === to
                    ? 'text-lime-400 bg-lime-400/10'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Admin + Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all text-xs font-rajdhani tracking-wider uppercase"
            >
              <Lock className="w-3.5 h-3.5" />
              Admin
            </Link>
            <button
              className="md:hidden p-2 text-zinc-400 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-zinc-950 border-t border-zinc-800 px-4 py-3 space-y-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded font-rajdhani font-semibold text-sm tracking-widest uppercase
                ${pathname === to
                  ? 'text-lime-400 bg-lime-400/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/admin"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-3 rounded text-zinc-500 hover:text-zinc-300 font-rajdhani font-semibold text-sm tracking-widest uppercase"
          >
            <Lock className="w-4 h-4" />
            Admin Login
          </Link>
        </div>
      )}
    </header>
  );
}
