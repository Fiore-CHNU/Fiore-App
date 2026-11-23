import React from 'react';
import { Search, ShoppingBag, Heart, User } from 'lucide-react';
import { Logo } from '../common/Logo';

interface HeaderProps {
  cartItemCount?: number;
  onOpenCart?: () => void;
  onSearchClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount = 0,
  onOpenCart,
  onSearchClick,
}) => {
  return (
    <header className="w-full bg-[#1E0B1A] border-b border-[#36132F] sticky top-0 z-40 transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <Logo />

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-sans tracking-wide">
          <a
            href="#"
            className="text-white/80 hover:text-[#F5B2E2] transition-colors font-medium"
          >
            Home
          </a>
          <a
            href="#"
            className="text-[#F5B2E2] font-semibold border-b-2 border-[#F5B2E2] pb-0.5"
          >
            Catalog
          </a>
          <a
            href="#"
            className="text-white/80 hover:text-[#F5B2E2] transition-colors font-medium"
          >
            Contact Us
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-5 sm:gap-6 text-white">
          <button
            onClick={onSearchClick}
            aria-label="Пошук"
            className="p-1 hover:text-[#F5B2E2] transition-transform active:scale-95"
          >
            <Search className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
          </button>

          <button
            onClick={onOpenCart}
            aria-label="Кошик"
            className="p-1 hover:text-[#F5B2E2] transition-transform active:scale-95 relative"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#F5B2E2] text-[#1E0B1A] text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                {cartItemCount}
              </span>
            )}
          </button>

          <button
            aria-label="Улюблене"
            className="p-1 hover:text-[#F5B2E2] transition-transform active:scale-95 hidden sm:block"
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
          </button>

          <button
            aria-label="Особистий кабінет"
            className="p-1 hover:text-[#F5B2E2] transition-transform active:scale-95"
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
  );
};
