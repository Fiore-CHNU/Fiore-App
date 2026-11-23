import React, { useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

export const CartDrawer: React.FC = () => {
  const {
    items,
    totalCount,
    totalAmount,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };
    if (isCartOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#260E21] border-l border-[#431A3B] text-white flex flex-col h-full shadow-2xl z-10 transition-transform">
        {/* Header */}
        <div className="p-5 border-b border-[#431A3B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#F5B2E2]" />
            <h2 className="font-serif text-xl font-medium tracking-wide">
              Кошик
            </h2>
            {totalCount > 0 && (
              <span className="bg-[#F5B2E2] text-[#1E0B1A] text-xs font-bold px-2 py-0.5 rounded-full">
                {totalCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Закрити кошик"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#391633] flex items-center justify-center text-[#F5B2E2]/60 mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-lg font-medium text-white mb-2">
              Ваш кошик порожній
            </h3>
            <p className="text-sm text-white/60 mb-6 max-w-xs">
              Оберіть букет у нашому каталозі, щоб додати його до замовлення.
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="px-6 py-2.5 rounded-full bg-[#F5B2E2] hover:bg-[#FDBDE9] text-[#1E0B1A] font-semibold text-sm transition-all shadow-md active:scale-95"
            >
              До каталогу
            </button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#3A1734]">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="py-4 flex gap-3.5 first:pt-0 last:pb-0">
                  {/* Thumbnail */}
                  <img
                    src={product.imageUrl || ''}
                    alt={product.name}
                    className="w-18 h-20 rounded-xl object-cover bg-[#1E0B1A] border border-[#431A3B] shrink-0"
                  />

                  {/* Info & Controls */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif text-[15px] font-medium text-white truncate" title={product.name}>
                          {product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-white/40 hover:text-red-400 transition-colors p-1"
                          aria-label={`Видалити ${product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#FFD7F1]/60 font-sans mt-0.5">
                        {product.sku}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-[#522149] rounded-full bg-[#1E0B1A] px-2 py-0.5">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 hover:text-[#F5B2E2] transition-colors"
                          aria-label="Зменшити кількість"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-white">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1 hover:text-[#F5B2E2] transition-colors"
                          aria-label="Збільшити кількість"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total for item */}
                      <span className="font-sans font-bold text-sm text-[#FFD7F1]">
                        {product.currency}{(product.price * quantity).toLocaleString('uk-UA')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer / Summary */}
            <div className="p-5 border-t border-[#431A3B] bg-[#1E0B1A]/80 backdrop-blur-md">
              <div className="flex items-center justify-between text-sm text-white/70 mb-1">
                <span>Кількість товарів:</span>
                <span className="font-medium text-white">{totalCount} шт.</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-white mb-4">
                <span>Разом до сплати:</span>
                <span className="text-lg font-bold text-[#F5B2E2]">
                  ₴{totalAmount.toLocaleString('uk-UA')}
                </span>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={clearCart}
                  className="px-3 py-2.5 rounded-full border border-[#522149] hover:border-red-400 text-white/60 hover:text-red-400 text-xs font-medium transition-colors"
                >
                  Очистити
                </button>
                <button
                  onClick={() => alert(`Перехід до оформлення замовлення на суму ₴${totalAmount.toLocaleString('uk-UA')}`)}
                  className="flex-1 py-3 px-4 rounded-full bg-[#F5B2E2] hover:bg-[#FDBDE9] text-[#1E0B1A] font-semibold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Оформити замовлення</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
