import React from 'react';
import { ProductCard } from './ProductCard';
import type { CatalogProductItem } from '../../types/catalog';

interface CatalogGridProps {
  products: CatalogProductItem[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onAddToCart: (product: CatalogProductItem) => void;
  onSelectProduct?: (product: CatalogProductItem) => void;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({
  products,
  isLoading,
  hasMore,
  onLoadMore,
  onAddToCart,
  onSelectProduct,
}) => {
  if (isLoading && products.length === 0) {
    return (
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="w-full aspect-[4/5] rounded-2xl bg-[#2D1227] animate-pulse" />
            <div className="h-5 w-2/3 bg-[#2D1227] rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-[#2D1227] rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
        <p className="font-serif text-2xl text-[#FFD7F1] mb-2">Букетів не знайдено</p>
        <p className="text-white/60 text-sm max-w-md">
          Спробуйте змінити критерії пошуку або скинути фільтри.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* 3-Column Grid matching Figma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </div>

      {/* "Load More" Button matching Figma */}
      {hasMore && (
        <div className="flex justify-center mt-12 mb-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-10 py-3 rounded-full bg-[#5C234E] hover:bg-[#722A60] active:scale-95 text-[#FFD7F1] font-semibold text-[14px] tracking-wide transition-all shadow-md disabled:opacity-50"
          >
            {isLoading ? 'Завантаження...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
};
