import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, X } from 'lucide-react';
import { Logo } from '../common/Logo';
import { INITIAL_PRODUCTS } from '../../services/api';
import type { CatalogProductItem } from '../../types/catalog';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

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
  onSelectProduct,
}) => {
  const { totalCount, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const cartItemCount = propCartItemCount !== undefined ? propCartItemCount : totalCount;
  const handleCartClick = onOpenCart || (() => setIsCartOpen(true));

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Suggestions filtered by current query
  const suggestions = searchQuery.trim().length >= 2
    ? INITIAL_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenSearch = () => {
    setIsSearchExpanded(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleClear = () => {
    onSearchChange('');
    searchInputRef.current?.focus();
  };

  const handleSelectSuggestion = (product: CatalogProductItem) => {
    onSelectProduct?.(product);
    setShowSuggestions(false);
    setIsSearchExpanded(false);
  };

  return (
    <header className="w-full bg-[#1E0B1A] border-b border-[#36132F] sticky top-0 z-40 transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4 sm:gap-8">
        {/* Left: Logo */}
        <Logo />

        {/* Center: Search Bar in top panel */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative flex items-center bg-[#FFD7F1] rounded-full overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#F5B2E2]">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => {
                onSearchChange(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Швидкий пошук квітів, букетів..."
              className="w-full bg-transparent pl-5 pr-16 py-2 text-[#1E0B1A] placeholder-[#1E0B1A]/60 focus:outline-none text-[14px] font-sans font-medium"
            />

            <div className="absolute right-1 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-[#1E0B1A]/70 hover:text-[#1E0B1A] transition-colors"
                  aria-label="Очистити"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="w-8 h-8 rounded-full bg-[#4E1E45] flex items-center justify-center text-white">
                <Search className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Quick Suggestions Dropdown */}
          {showSuggestions && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#2B1127] border border-[#522149] rounded-2xl shadow-2xl overflow-hidden z-50 animate-scale-in">
              <div className="p-2 border-b border-[#3E1838] text-[11px] uppercase tracking-wider text-[#FFD7F1]/70 font-semibold px-3">
                Результати швидкого пошуку ({suggestions.length})
              </div>

              {suggestions.length > 0 ? (
                <div className="divide-y divide-[#3A1734]">
                  {suggestions.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item)}
                      className="flex items-center gap-3 p-2.5 hover:bg-[#3D1A37] cursor-pointer transition-colors"
                    >
                      <img
                        src={item.imageUrl || ''}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-[#1E0B1A]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-white truncate font-serif">
                          {item.name}
                        </p>
                        <p className="text-[12px] text-[#FFD7F1] font-bold">
                          {item.currency}{item.price.toLocaleString('uk-UA')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-[#FFD7F1]/60">
                  Букетів за запитом "{searchQuery}" не знайдено
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center-Right: Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-[15px] font-sans tracking-wide">
          <Link
            to="/"
            className="text-[#F5B2E2] font-semibold border-b-2 border-[#F5B2E2] pb-0.5"
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
          {/* Mobile Search Toggle */}
          <button
            onClick={handleOpenSearch}
            aria-label="Пошук"
            className="p-1 md:hidden hover:text-[#F5B2E2] transition-transform active:scale-95"
          >
            <Search className="w-5 h-5" strokeWidth={1.8} />
          </button>

          <button
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

          <button
            aria-label="Улюблене"
            className="p-1 hover:text-[#F5B2E2] transition-transform active:scale-95 hidden sm:block"
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
          </button>

          {/* Staff Login / Admin Entry */}
          <Link
            to={user ? "/admin" : "/admin/login"}
            aria-label={user ? `Кабінет (${user.role})` : "Вхід до адмін-панелі"}
            className="p-1 hover:text-[#F5B2E2] transition-transform active:scale-95 relative"
            title={user ? `Авторизовано як ${user.fullName} (${user.role})` : "Вхід до адмін-панелі"}
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
            {user && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#1E0B1A]" />
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
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
