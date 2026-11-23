import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { LazyImage } from '../common/LazyImage';
import type { CatalogProductItem } from '../../types/catalog';

interface ProductCardProps {
  product: CatalogProductItem;
  onAddToCart: (product: CatalogProductItem) => void;
  onSelectProduct?: (product: CatalogProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onSelectProduct,
}) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <div
      onClick={() => onSelectProduct?.(product)}
      className="group flex flex-col cursor-pointer transition-all duration-300"
    >
      {/* Product Image Container with Lazy Loading (NFR-03.2) matching Figma */}
      <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#2D1227] shadow-lg border border-[#43193B]/60 transition-transform duration-300 group-hover:scale-[1.015] group-hover:border-[#F5B2E2]/40">
        <LazyImage
          src={product.imageUrl}
          alt={product.name}
          aspectRatio="aspect-[4/5]"
          rootMargin="250px"
        />

        {/* Stock status badge if unavailable */}
        {!product.isAvailable && (
          <div className="absolute top-3 left-3 bg-[#1E0B1A]/85 backdrop-blur-sm text-[#FFD7F1] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#F5B2E2]/30 z-10">
            Немає в наявності
          </div>
        )}
      </div>

      {/* Info & Add to Cart button matching Figma */}
      <div className="pt-3 px-1 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3
            className="font-serif text-[17px] sm:text-[18px] text-white font-medium truncate group-hover:text-[#F5B2E2] transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="text-[14px] sm:text-[15px] font-sans font-bold text-[#FFD7F1] mt-0.5 tracking-wider">
            {product.currency}{product.price.toLocaleString('uk-UA')}
          </p>
        </div>

        {/* "Add to Cart" Pill Button matching Figma */}
        <button
          onClick={handleAdd}
          disabled={!product.isAvailable}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] sm:text-[13px] font-semibold tracking-wide transition-all shadow-md active:scale-95 shrink-0 ${
            !product.isAvailable
              ? 'bg-[#3D1A35] text-white/40 cursor-not-allowed'
              : isAdded
              ? 'bg-emerald-500 text-white'
              : 'bg-[#F5B2E2] hover:bg-[#FDBDE9] text-[#1E0B1A] hover:shadow-[#F5B2E2]/20'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Додано</span>
            </>
          ) : (
            <>
              <span>Add to Cart</span>
              <ShoppingBag className="w-3.5 h-3.5" strokeWidth={2.2} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
