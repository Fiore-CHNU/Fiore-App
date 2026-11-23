import React, { useState } from 'react';
import { ShoppingBag, Check, Plus } from 'lucide-react';
import type { CatalogProductItem } from '../../types/catalog';
import { useCart } from '../../hooks/useCart';
import { LazyImage } from '../common/LazyImage';

interface ProductCardProps {
  product: CatalogProductItem;
  onAddToCart?: (product: CatalogProductItem) => void;
  onSelectProduct?: (product: CatalogProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onSelectProduct,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, getItemQuantity } = useCart();

  const itemQuantity = getItemQuantity(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.isAvailable) return;

    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart(product);
    }

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

        {/* Stock status badge if unavailable (TC-3.1-2) */}
        {!product.isAvailable && (
          <div className="absolute top-3 left-3 bg-[#1E0B1A]/90 backdrop-blur-sm text-[#FFD7F1] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#F5B2E2]/30">
            Немає в наявності
          </div>
        )}

        {/* In-cart indicator badge on image when item is in cart */}
        {itemQuantity > 0 && (
          <div
            className="absolute top-3 right-3 bg-[#1E0B1A]/90 backdrop-blur-md text-[#F5B2E2] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#F5B2E2]/50 shadow-md flex items-center gap-1"
            title={`У кошику: ${itemQuantity} шт.`}
          >
            <ShoppingBag className="w-3 h-3 text-[#F5B2E2]" />
            <span>{itemQuantity}</span>
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

        {/* "Add to Cart" Pill Button with counter feedback (EAN-363 / US-3.1.2) */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.isAvailable}
          aria-label={
            !product.isAvailable
              ? `${product.name} немає в наявності`
              : `Додати ${product.name} в кошик${itemQuantity > 0 ? `, у кошику вже ${itemQuantity}` : ''}`
          }
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] sm:text-[13px] font-semibold tracking-wide transition-all duration-200 shadow-md active:scale-95 shrink-0 ${
            !product.isAvailable
              ? 'bg-[#3D1A35] text-white/40 cursor-not-allowed border border-white/5'
              : isAdded
              ? 'bg-emerald-500 text-white shadow-emerald-500/20 scale-105'
              : 'bg-[#F5B2E2] hover:bg-[#FDBDE9] text-[#1E0B1A] hover:shadow-[#F5B2E2]/25'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Додано</span>
            </>
          ) : !product.isAvailable ? (
            <span>Недоступно</span>
          ) : (
            <>
              <span>Додати</span>
              {itemQuantity > 0 ? (
                <span className="flex items-center gap-0.5 bg-[#1E0B1A]/20 px-1 rounded-full text-[11px] font-bold">
                  <Plus className="w-2.5 h-2.5" />
                  {itemQuantity}
                </span>
              ) : (
                <ShoppingBag className="w-3.5 h-3.5" strokeWidth={2.2} />
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
