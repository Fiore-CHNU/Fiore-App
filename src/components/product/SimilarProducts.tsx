import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import type { CatalogProductItem } from '../../types/catalog';
import { LazyImage } from '../common/LazyImage';
import { useCart } from '../../hooks/useCart';

interface SimilarProductsProps {
  products: CatalogProductItem[];
  isCurrentAvailable: boolean;
  onSelectProduct: (product: CatalogProductItem) => void;
  onAddToCart?: (product: CatalogProductItem) => void;
}

export const SimilarProducts: React.FC<SimilarProductsProps> = ({
  products,
  isCurrentAvailable,
  onSelectProduct,
  onAddToCart,
}) => {
  const { addToCart, getItemQuantity } = useCart();

  if (!products || products.length === 0) return null;

  const handleAdd = (e: React.MouseEvent, item: CatalogProductItem) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(item);
    } else {
      addToCart(item);
    }
  };

  return (
    <section className="mt-8 pt-8 border-t border-[#3A1734]">
      {/* Header with context alert if current item is out of stock (TC-2.2 / US-2.2 Scenario 2) */}
      <div className="mb-5">
        {!isCurrentAvailable && (
          <div className="mb-3 p-3.5 rounded-xl bg-[#3E1634] border border-[#F5B2E2]/30 text-xs sm:text-sm text-[#FFD7F1] flex items-center justify-between gap-2 animate-fade-in">
            <span>
              🌸 Цей букет наразі недоступний. Ми підібрали для вас чудові альтернативи:
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl sm:text-2xl text-white font-medium">
            {isCurrentAvailable ? 'Схожі букети' : 'Рекомендовані букети'}
          </h3>
          <span className="text-xs text-[#F5B2E2] flex items-center gap-1">
            <span>
              {products.length === 1
                ? '1 варіант'
                : products.length >= 2 && products.length <= 4
                ? `${products.length} варіанти`
                : `${products.length} варіантів`}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Grid of similar bouquet cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {products.map(item => {
          const qty = getItemQuantity(item.id);

          return (
            <div
              key={item.id}
              onClick={() => onSelectProduct(item)}
              className="group bg-[#280F23] border border-[#431A3B] hover:border-[#F5B2E2]/40 rounded-2xl p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#1E0B1A] mb-2.5">
                <LazyImage
                  src={item.imageUrl || ''}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {!item.isAvailable && (
                  <div className="absolute top-2 left-2 bg-[#1E0B1A]/90 text-[#FFD7F1] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
                    Немає
                  </div>
                )}
                {qty > 0 && (
                  <div className="absolute top-2 right-2 bg-[#F5B2E2] text-[#1E0B1A] text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-sm">
                    {qty}
                  </div>
                )}
              </div>

              {/* Title & Price */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4
                    className="font-serif text-sm font-medium text-white truncate group-hover:text-[#F5B2E2] transition-colors"
                    title={item.name}
                  >
                    {item.name}
                  </h4>
                  <p className="text-xs font-bold text-[#FFD7F1] mt-0.5">
                    {item.currency}{item.price.toLocaleString('uk-UA')}
                  </p>
                </div>

                {/* Quick Add Button */}
                <button
                  type="button"
                  onClick={e => handleAdd(e, item)}
                  disabled={!item.isAvailable}
                  className={`mt-2.5 w-full py-1.5 px-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                    !item.isAvailable
                      ? 'bg-[#3A1832] text-white/30 cursor-not-allowed'
                      : 'bg-[#F5B2E2] hover:bg-[#FDBDE9] text-[#1E0B1A]'
                  }`}
                  aria-label={`Додати ${item.name} у кошик`}
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>{qty > 0 ? `+${qty}` : 'Додати'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
