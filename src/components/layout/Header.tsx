import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, X } from 'lucide-react';
import { Logo } from '../common/Logo';
import type { CatalogProductItem } from '../../types/catalog';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { STAFF_ROLE_LABELS } from '../../types/auth';

interface HeaderProps {
  cartItemCount?: number;
  onOpenCart?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectProduct?: (product: CatalogProductItem) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount: propCartItemCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
}) => {
  const { totalCount, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const cartItemCount = propCartItemCount !== undefined ? propCartItemCount : totalCount;
  const handleCartClick = onOpenCart || (() => setIsCartOpen(true));

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchIconClick = () => {
    // If desktop, focus the main catalog search input on the page
    const catalogSearchInput = document.getElementById('catalog-search-input') as HTMLInputElement | null;
    if (catalogSearchInput) {
      catalogSearchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => catalogSearchInput.focus(), 300);
    } else {
      setIsSearchExpanded(prev => !prev);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  return (
    <header className="w-full bg-[#1E0B1A] border-b border-[#36132F] sticky top-0 z-40 transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4 sm:gap-8">
        {/* Left: Logo */}
        <Logo />

        {/* Center: Navigation matching Figma */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-sans tracking-wide">
          <Link
            to="/"
            className="text-[#F5B2E2] font-semibold border-b-2 border-[#F5B2E2] pb-0.5 transition-colors"
          >
            Каталог
          </Link>
          <a
            href="#footer"
            className="text-white/80 hover:text-[#F5B2E2] transition-colors font-medium"
          >
            Контакти
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 sm:gap-6 text-white">
          {/* Search Icon button (focuses catalog search or opens mobile bar) */}
          <button
            type="button"
            onClick={handleSearchIconClick}
            aria-label="Пошук"
            title="Знайти букет"
            className="p-1 hover:text-[#F5B2E2] transition-transform active:scale-95"
          >
            <Search className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
          </button>

          {/* Cart Icon */}
          <button
            type="button"
            onClick={handleCartClick}
            aria-label={cartItemCount > 0 ? `Кошик, ${cartItemCount} товарів` : 'Кошик'}
            className="p-1 hover:text-[#F5B2E2] transition-transform active:scale-95 relative"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#F5B2E2] text-[#1E0B1A] text-[11px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center animate-scale-in shadow-md">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </button>

          {/* Wishlist Icon */}
          <button
            type="button"
            aria-label="Улюблене"
            className="p-1 hover:text-[#F5B2E2] transition-transform active:scale-95 hidden sm:block"
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
          </button>

          {/* Staff Login / Admin Entry */}
          <Link
            to={user ? "/admin" : "/admin/login"}
            aria-label={user ? `Панель персоналу (${STAFF_ROLE_LABELS[user.role]})` : "Вхід до адмін-панелі"}
            className="p-1 hover:text-[#F5B2E2] transition-transform active:scale-95 relative"
            title={user ? `Авторизовано як ${user.email} (${STAFF_ROLE_LABELS[user.role]})` : "Вхід до адмін-панелі"}
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
            {user && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#1E0B1A]" />
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Expandable Search Bar (when toggled on mobile) */}
      {isSearchExpanded && (
        <div className="md:hidden px-4 pb-4 pt-1 bg-[#1E0B1A] border-t border-[#36132F] animate-fade-in">
          <div className="relative flex items-center bg-[#FFD7F1] rounded-full overflow-hidden shadow-sm">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Пошук квітів..."
              className="w-full bg-transparent pl-4 pr-16 py-2 text-[#1E0B1A] text-sm focus:outline-none"
            />
            <button
              onClick={() => setIsSearchExpanded(false)}
              className="absolute right-3 text-[#1E0B1A]/70 hover:text-[#1E0B1A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
