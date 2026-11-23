import React from 'react';
import { Ruler, Package, Sparkles } from 'lucide-react';
import type { ProductComposition } from '../../types/catalog';

interface ProductDescriptionProps {
  description: string | null;
  heightCm: number | null;
  widthCm: number | null;
  composition: ProductComposition[];
  packaging?: string | null;
}

export const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
  heightCm,
  widthCm,
  composition,
  packaging,
}) => {
  const totalStems = composition.reduce((sum, item) => sum + item.stemCount, 0);

  return (
    <div className="space-y-6 text-[#FFD7F1]/90">
      {/* Description */}
      {description && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5B2E2] mb-2">
            Про букет
          </h4>
          <p className="text-sm leading-relaxed text-white/80 font-sans">
            {description}
          </p>
        </div>
      )}

      {/* Dimensions (US-2.2) */}
      {(heightCm || widthCm) && (
        <div className="bg-[#2D1227] border border-[#431A3B] rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F5B2E2] mb-3">
            <Ruler className="w-4 h-4 text-[#F5B2E2]" />
            <span>Орієнтовні розміри</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {heightCm && (
              <div className="bg-[#1E0B1A]/60 rounded-xl p-3 border border-[#3E1736]">
                <span className="text-xs text-white/60 block">Висота композиції</span>
                <span className="text-base font-bold text-white font-serif mt-0.5 block">
                  ~ {heightCm} см
                </span>
              </div>
            )}
            {widthCm && (
              <div className="bg-[#1E0B1A]/60 rounded-xl p-3 border border-[#3E1736]">
                <span className="text-xs text-white/60 block">Діаметр букета</span>
                <span className="text-base font-bold text-white font-serif mt-0.5 block">
                  ~ {widthCm} см
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floral Composition (US-2.2) */}
      {composition && composition.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5B2E2] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F5B2E2]" />
              <span>Склад букета</span>
            </h4>
            {totalStems > 0 && (
              <span className="text-xs text-[#F5B2E2]/80 bg-[#3B1736] px-2.5 py-0.5 rounded-full border border-[#522149]">
                Всього стебел: {totalStems} шт.
              </span>
            )}
          </div>

          <div className="bg-[#2D1227] border border-[#431A3B] rounded-2xl overflow-hidden divide-y divide-[#3A1734]">
            {composition.map((item, idx) => (
              <div
                key={idx}
                className="p-3 sm:px-4 flex items-center justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <span className="font-medium text-white block truncate">
                    {item.flowerName}
                  </span>
                  {item.note && (
                    <span className="text-xs text-white/50 block">
                      {item.note}
                    </span>
                  )}
                </div>
                <span className="font-serif font-bold text-[#FFD7F1] text-sm shrink-0">
                  {item.stemCount} шт.
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Packaging & Care (US-2.2) */}
      <div className="bg-[#2D1227]/70 border border-[#431A3B]/80 rounded-2xl p-4 flex items-start gap-3">
        <Package className="w-5 h-5 text-[#F5B2E2] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-semibold text-white block">Пакування та доставка</span>
          <p className="text-white/70 leading-relaxed font-sans">
            {packaging ||
              'Фірмовий матовий папір, дизайнерська атласна стрічка, підживлення для квітів Chrysal та захисний аквабокс для безпечного транспортування.'}
          </p>
        </div>
      </div>
    </div>
  );
};
