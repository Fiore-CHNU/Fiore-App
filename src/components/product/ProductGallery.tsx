import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Sparkles } from 'lucide-react';
import type { ProductImage } from '../../types/catalog';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  isAvailable?: boolean;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  isAvailable = true,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Touch swipe state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = images.length;

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex(prev => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex(prev => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation (ArrowLeft / ArrowRight / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFullscreen]);

  // Touch Swipe Handlers (US-2.1.2)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next image
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev image
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentImage = images[activeIndex];
  const isCurrentFailed = currentImage ? failedImages[currentImage.id] : true;

  const handleImageError = (imageId: string) => {
    setFailedImages(prev => ({ ...prev, [imageId]: true }));
  };

  return (
    <div className="space-y-3 select-none">
      {/* Main Image Container */}
      <div
        className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#2D1227] border border-[#431A3B] shadow-xl group cursor-pointer"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => setIsFullscreen(true)}
      >
        {/* Fallback branded placeholder if image failed (US-2.1 Scenario 3) */}
        {isCurrentFailed || !currentImage?.imageUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#250E20]">
            <div className="w-16 h-16 rounded-full bg-[#3B1533] border border-[#5A2251] flex items-center justify-center text-[#F5B2E2] mb-3">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="font-serif text-xl tracking-wider text-[#F5B2E2] font-semibold">
              FIORE
            </span>
            <span className="text-xs text-white/50 mt-1 font-sans">
              Фото ракурсу тимчасово недоступне
            </span>
          </div>
        ) : (
          <img
            key={currentImage.id}
            src={currentImage.imageUrl}
            alt={currentImage.altText || productName}
            onError={() => handleImageError(currentImage.id)}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-102"
          />
        )}

        {/* Stock status badge if unavailable */}
        {!isAvailable && (
          <div className="absolute top-4 left-4 bg-[#1E0B1A]/90 backdrop-blur-md text-[#FFD7F1] text-xs font-semibold px-3 py-1 rounded-full border border-[#F5B2E2]/30 pointer-events-none">
            Немає в наявності
          </div>
        )}

        {/* Fullscreen Expand Button (US-2.1 Scenario 2) */}
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setIsFullscreen(true);
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#1E0B1A]/70 hover:bg-[#1E0B1A] text-white/80 hover:text-[#F5B2E2] backdrop-blur-sm transition-all border border-white/10 opacity-80 group-hover:opacity-100 shadow-md"
          title="Відкрити на весь екран"
          aria-label="Збільшити фото на весь екран"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Navigation Arrows for PC (US-2.1 Scenario 1) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#1E0B1A]/70 hover:bg-[#1E0B1A] text-white/80 hover:text-[#F5B2E2] backdrop-blur-sm transition-all border border-white/10 flex items-center justify-center opacity-70 group-hover:opacity-100 shadow-lg"
              aria-label="Попереднє фото"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#1E0B1A]/70 hover:bg-[#1E0B1A] text-white/80 hover:text-[#F5B2E2] backdrop-blur-sm transition-all border border-white/10 flex items-center justify-center opacity-70 group-hover:opacity-100 shadow-lg"
              aria-label="Наступне фото"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Photo Counter Pill & Dots on Mobile */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E0B1A]/80 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white/90">
              <span>{activeIndex + 1}</span>
              <span className="text-white/40">/</span>
              <span className="text-white/60">{total}</span>
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Row */}
      {total > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
          {images.map((img, idx) => {
            const isFailed = failedImages[img.id];

            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-[#250E20] ${
                  activeIndex === idx
                    ? 'border-[#F5B2E2] scale-105 shadow-md ring-2 ring-[#F5B2E2]/20'
                    : 'border-[#431A3B] opacity-60 hover:opacity-100'
                }`}
                aria-label={`Фото ${idx + 1}`}
              >
                {isFailed || !img.imageUrl ? (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-[#F5B2E2] font-serif font-bold">
                    FIORE
                  </div>
                ) : (
                  <img
                    src={img.imageUrl}
                    alt={img.altText || `${productName} ракурс ${idx + 1}`}
                    onError={() => handleImageError(img.id)}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ================= FULLSCREEN LIGHTBOX (US-2.1 Scenario 2) ================= */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-fade-in"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Top Bar in Fullscreen */}
          <div
            className="flex items-center justify-between z-10 max-w-7xl mx-auto w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-left">
              <span className="font-serif text-lg font-medium text-white block">
                {productName}
              </span>
              <span className="text-xs text-white/50">
                Фотографія {activeIndex + 1} з {total}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Закрити повноекранний режим"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Central Fullscreen View */}
          <div
            className="flex-1 flex items-center justify-center relative my-4 overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={e => e.stopPropagation()}
          >
            {/* Arrows */}
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-6 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-[#F5B2E2] border border-white/20 flex items-center justify-center transition-all shadow-2xl"
                  aria-label="Попереднє фото"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-6 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-[#F5B2E2] border border-white/20 flex items-center justify-center transition-all shadow-2xl"
                  aria-label="Наступне фото"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Large Image */}
            <div className="max-h-[80vh] max-w-full flex items-center justify-center">
              {isCurrentFailed || !currentImage?.imageUrl ? (
                <div className="p-12 text-center bg-[#250E20] rounded-3xl border border-[#431A3B]">
                  <Sparkles className="w-16 h-16 text-[#F5B2E2] mx-auto mb-4" />
                  <span className="font-serif text-2xl text-[#F5B2E2] font-semibold block">
                    FIORE
                  </span>
                  <p className="text-sm text-white/60 mt-2">
                    Зображення тимчасово недоступне
                  </p>
                </div>
              ) : (
                <img
                  src={currentImage.imageUrl}
                  alt={currentImage.altText || productName}
                  className="max-h-[80vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl animate-scale-in"
                />
              )}
            </div>
          </div>

          {/* Bottom Thumbnails Strip in Fullscreen */}
          {total > 1 && (
            <div
              className="flex justify-center gap-3 overflow-x-auto py-2 z-10"
              onClick={e => e.stopPropagation()}
            >
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`relative w-14 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeIndex === idx
                      ? 'border-[#F5B2E2] scale-110 shadow-lg'
                      : 'border-white/20 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
