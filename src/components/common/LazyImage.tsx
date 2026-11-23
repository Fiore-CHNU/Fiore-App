import React, { useState, useEffect, useRef } from 'react';
import { ImageOff } from 'lucide-react';

interface LazyImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  aspectRatio?: string;
  rootMargin?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'aspect-[4/5]',
  rootMargin = '200px',
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If browser doesn't support IntersectionObserver, load immediately
    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin, // Preload 200px before scrolling into viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={imgRef}
      className={`relative w-full ${aspectRatio} overflow-hidden bg-[#2D1227] select-none ${className}`}
    >
      {/* 1. Shimmer Skeleton Placeholder (while loading or before in view) */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#280F23] via-[#3E1838] to-[#280F23] bg-[length:200%_100%] animate-[shimmer_2s_infinite] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#F5B2E2]/20 border-t-[#F5B2E2] animate-spin" />
        </div>
      )}

      {/* 2. Error Fallback */}
      {hasError || !src ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2B1127] text-[#FFD7F1]/40 gap-2 p-4 text-center">
          <ImageOff className="w-8 h-8 text-[#FFD7F1]/30" />
          <span className="text-[11px] font-sans">Зображення недоступне</span>
        </div>
      ) : null}

      {/* 3. Actual Image loaded lazily with smooth transition */}
      {isInView && src && !hasError && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
            isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-95'
          }`}
        />
      )}
    </div>
  );
};
