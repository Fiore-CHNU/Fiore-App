import React, { useState, useEffect, useCallback } from 'react';
import { X, ShoppingBag, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchProductDetails, fetchSimilarProducts } from '../../services/api';
import type { ProductDetailsResponse, CatalogProductItem } from '../../types/catalog';
import { ProductDescription } from './ProductDescription';
import { SimilarProducts } from './SimilarProducts';
import { LazyImage } from '../common/LazyImage';
import { useCart } from '../../hooks/useCart';

interface ProductDetailsModalProps {
  productId: string;
  onClose: () => void;
  onSelectProduct: (product: CatalogProductItem) => void;
  onAddToCart?: (product: CatalogProductItem) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  productId,
  onClose,
  onSelectProduct,
  onAddToCart,
}) => {
  const [details, setDetails] = useState<ProductDetailsResponse | null>(null);
  const [similar, setSimilar] = useState<CatalogProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  const { addToCart, getItemQuantity } = useCart();
  const currentQuantityInCart = getItemQuantity(productId);

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [productData, similarData] = await Promise.all([
        fetchProductDetails(productId),
        fetchSimilarProducts(productId),
      ]);

      if (!productData) {
        throw new Error('Дані про букет не знайдено');
      }

      setDetails(productData);
      setSimilar(similarData);
      setActiveImageIndex(0);
    } catch (err) {
      console.error(err);
      setError('Не вдалося завантажити інформацію про букет. Перевірте з’єднання та спробуйте знову.');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleAdd = () => {
    if (!details || !details.isAvailable) return;

    const catalogItem: CatalogProductItem = {
      id: details.id,
      sku: details.sku,
      name: details.name,
      price: details.price,
      currency: details.currency,
      imageUrl: details.images[0]?.imageUrl || null,
      isAvailable: details.isAvailable,
    };

    if (onAddToCart) {
      onAddToCart(catalogItem);
    } else {
      addToCart(catalogItem);
    }

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-fade-in"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-[#220B1D] border border-[#4E1E45] rounded-3xl shadow-2xl z-10 my-auto text-white max-h-[92vh] flex flex-col overflow-hidden animate-scale-in">
        {/* Top Action Bar */}
        <div className="p-4 sm:px-6 border-b border-[#3B1534] flex items-center justify-between shrink-0 bg-[#1E0B1A]/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#F5B2E2] font-semibold">
              Деталі букета
            </span>
            {details && (
              <span className="text-xs text-white/40 font-mono">
                {details.sku}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Закрити модальне вікно"
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-8 flex-1 custom-scrollbar">
          {isLoading ? (
            /* Loading Shimmer Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
              <div className="aspect-[4/5] bg-[#2E1228] rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 bg-[#2E1228] rounded-lg w-3/4" />
                <div className="h-6 bg-[#2E1228] rounded-lg w-1/3" />
                <div className="h-24 bg-[#2E1228] rounded-2xl" />
                <div className="h-40 bg-[#2E1228] rounded-2xl" />
              </div>
            </div>
          ) : error ? (
            /* Error State (US-2.2 Scenario 3) */
            <div className="py-16 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-medium text-white">
                Помилка завантаження
              </h3>
              <p className="text-sm text-white/70">
                {error}
              </p>
              <button
                onClick={loadProduct}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F5B2E2] hover:bg-[#FDBDE9] text-[#1E0B1A] font-semibold text-sm transition-all shadow-md active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Спробувати ще раз</span>
              </button>
            </div>
          ) : details ? (
            /* Main Content: Gallery + Description Block */
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 items-start">
                {/* Left: Gallery (US-2.1) */}
                <div className="space-y-3">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#2D1227] border border-[#431A3B] shadow-xl">
                    <LazyImage
                      src={details.images[activeImageIndex]?.imageUrl || ''}
                      alt={details.images[activeImageIndex]?.altText || details.name}
                      className="w-full h-full object-cover transition-all duration-300"
                    />

                    {!details.isAvailable && (
                      <div className="absolute top-4 left-4 bg-[#1E0B1A]/90 backdrop-blur-md text-[#FFD7F1] text-xs font-semibold px-3 py-1 rounded-full border border-[#F5B2E2]/30">
                        Немає в наявності
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {details.images.length > 1 && (
                    <div className="flex gap-2.5 overflow-x-auto pb-1">
                      {details.images.map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                            activeImageIndex === idx
                              ? 'border-[#F5B2E2] scale-105 shadow-md'
                              : 'border-[#431A3B] opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={img.imageUrl}
                            alt={img.altText || details.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Info & Description Block (US-2.2) */}
                <div className="space-y-5">
                  <div>
                    {/* Facets / Categories */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {details.facets.map(f => (
                        <span
                          key={f.id}
                          className="text-[11px] font-sans font-medium bg-[#36142E] text-[#FFD7F1]/80 px-2.5 py-0.5 rounded-full border border-[#4E1E45]"
                        >
                          {f.name}
                        </span>
                      ))}
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl text-white font-medium">
                      {details.name}
                    </h2>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="text-2xl sm:text-3xl font-bold font-sans text-[#FFD7F1]">
                        {details.currency}{details.price.toLocaleString('uk-UA')}
                      </span>
                      <span className="text-xs text-white/50">грн з ПДВ</span>
                    </div>
                  </div>

                  {/* Add to Cart Button (or Out of Stock Banner) */}
                  <div className="pt-2">
                    {details.isAvailable ? (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleAdd}
                          className={`flex-1 py-3 px-6 rounded-full font-semibold text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                            isAdded
                              ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                              : 'bg-[#F5B2E2] hover:bg-[#FDBDE9] text-[#1E0B1A] hover:shadow-[#F5B2E2]/30'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Додано в кошик!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              <span>
                                {currentQuantityInCart > 0
                                  ? `Додати ще (у кошику ${currentQuantityInCart})`
                                  : 'Додати в кошик'}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-[#3E1634] border border-[#F5B2E2]/30 text-sm text-[#FFD7F1]">
                        <span className="font-semibold block mb-0.5">Цей букет тимчасово відсутній</span>
                        <span className="text-xs text-white/70">
                          Зверніть увагу на рекомендовані альтернативи нижче.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* US-2.2: Description, Dimensions & Composition Block */}
                  <ProductDescription
                    description={details.description}
                    heightCm={details.heightCm}
                    widthCm={details.widthCm}
                    composition={details.composition}
                    packaging={details.packaging}
                  />
                </div>
              </div>

              {/* US-2.2: Similar Bouquets Block */}
              <SimilarProducts
                products={similar}
                isCurrentAvailable={details.isAvailable}
                onSelectProduct={item => {
                  onSelectProduct(item);
                  // Scroll top inside modal
                  const container = document.querySelector('.custom-scrollbar');
                  if (container) container.scrollTop = 0;
                }}
                onAddToCart={onAddToCart}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
