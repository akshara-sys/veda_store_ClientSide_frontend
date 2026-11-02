import React, { useState } from 'react';
import {
  Search,
  Heart,
  User,
  ShoppingCart,
  Coins,
  Flower2,
  Menu,
  X
} from 'lucide-react';
import { navigate } from '../utils/storeUtils';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/collections/all' },
  { name: 'Categories', path: '/categories' },
  { name: 'About Us', path: '/about' }
];

export default function Navbar({
  currentPath = '/',
  cartCount = 0,
  rewardPoints = 0
}) {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (e, path) => {
    e.preventDefault();
    setMenuOpen(false);
    navigate(path);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/collections/all?q=${encodeURIComponent(q)}` : '/collections/all');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F8F6EF] border-b border-[#E8E3D8]">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-12 h-[68px] flex items-center justify-between gap-4">

        {/* LOGO */}
        <a href="/" onClick={(e) => go(e, '/')} className="flex items-center gap-2.5 shrink-0">
          <Flower2 size={34} strokeWidth={1.4} className="text-[#C58B20]" />
          <div className="flex flex-col leading-none">
            <span className="font-serif text-[18px] font-semibold tracking-[3px] text-[#1B4332]">
              VEDA <span className="text-[#B8862B]">SANKALPA</span>
            </span>
            <span className="mt-1 text-[7px] tracking-[3px] uppercase text-[#6F786B]">
              The Sacred Store
            </span>
          </div>
        </a>

        {/* CENTER NAV */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const active = currentPath === link.path;
            return (
              <a
                key={link.name}
                href={link.path}
                onClick={(e) => go(e, link.path)}
                className={`text-[13px] pb-1 border-b-2 transition-colors ${
                  active
                    ? 'text-[#1B4332] border-[#1B4332]'
                    : 'text-[#555B53] border-transparent hover:text-[#1B4332]'
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-3 lg:gap-4">

          {/* SEARCH */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center w-[240px] h-[38px] rounded-full
                       border border-[#E3DED1] bg-white overflow-hidden"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the collection"
              className="w-full min-w-0 px-4 text-[11px] bg-transparent outline-none
                         placeholder:text-[#9AA096]"
            />
            <button
              type="submit"
              aria-label="Search"
              className="h-full px-4 bg-[#1B4332] text-white hover:bg-[#143225] transition-colors"
            >
              <Search size={15} />
            </button>
          </form>

          {/* WISHLIST (red ring) */}
          <button
            type="button"
            aria-label="Wishlist"
            onClick={() => navigate('/wishlist')}
            className="w-9 h-9 rounded-full border border-red-500 bg-white
                       flex items-center justify-center text-red-500 hover:bg-red-50"
          >
            <Heart size={18} strokeWidth={1.6} />
          </button>

          {/* PROFILE */}
          <button
            type="button"
            aria-label="Account"
            onClick={() => navigate('/account')}
            className="text-[#1B4332] hover:text-[#C58B20] transition-colors"
          >
            <User size={21} strokeWidth={1.5} />
          </button>

          {/* CART */}
          <button
            type="button"
            aria-label="Cart"
            onClick={() => navigate('/cart')}
            className="relative text-[#1B4332] hover:text-[#C58B20] transition-colors"
          >
            <ShoppingCart size={21} strokeWidth={1.5} />
            <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full
                             bg-red-600 text-white text-[9px] flex items-center justify-center">
              {cartCount}
            </span>
          </button>

          {/* REWARDS */}
          <button
            type="button"
            aria-label="Reward points"
            onClick={() => navigate('/rewards')}
            className="flex items-center gap-1.5"
          >
            <span className="w-7 h-7 rounded-full bg-[#F3D27A] flex items-center justify-center text-[#9A6B0A]">
              <Coins size={15} />
            </span>
            <span className="text-[12px] font-medium text-[#1B4332]">{rewardPoints}</span>
          </button>

          {/* MOBILE TOGGLE */}
          <button
            type="button"
            aria-label="Menu"
            className="md:hidden text-[#1B4332]"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#E8E3D8] bg-[#F8F6EF] px-4 py-3">
          <form onSubmit={handleSearch} className="flex h-[38px] mb-3 rounded-full border border-[#E3DED1] bg-white overflow-hidden">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the collection"
              className="w-full px-4 text-[12px] bg-transparent outline-none"
            />
            <button type="submit" className="px-4 bg-[#1B4332] text-white">
              <Search size={15} />
            </button>
          </form>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              onClick={(e) => go(e, link.path)}
              className={`block py-2.5 text-[14px] ${
                currentPath === link.path ? 'text-[#1B4332] font-medium' : 'text-[#555B53]'
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}