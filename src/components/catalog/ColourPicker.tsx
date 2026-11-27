import React from 'react';
import { Check, RotateCcw } from 'lucide-react';
import type { CatalogFacetItem } from '../../types/catalog';

interface SwatchStyle {
  background: string;
  isLight?: boolean;
  border?: boolean;
}

const COLOR_SWATCH_MAP: Record<string, SwatchStyle> = {
  white: { background: '#FFFFFF', isLight: true, border: true },
  cream: { background: '#FFF5E1', isLight: true, border: true },
  pastel: {
    background: 'linear-gradient(135deg, #FAD2E1 0%, #FFF1E6 50%, #E2ECE9 100%)',
    isLight: true,
    border: true,
  },
  pink: { background: '#F472B6' },
  red: { background: '#DC2626' },
  burgundy: { background: '#7F1D1D' },
  peach: { background: '#FDBA74', isLight: true },
  orange: { background: '#F97316' },
  yellow: { background: '#FACC15', isLight: true },
  green: { background: '#22C55E' },
  blue: { background: '#3B82F6' },
  lavender: { background: '#C084FC' },
  purple: { background: '#9333EA' },
  mix: {
    background: 'conic-gradient(from 0deg, #F472B6, #FACC15, #22C55E, #3B82F6, #A855F7, #F472B6)',
  },
  multicolor: {
    background: 'conic-gradient(from 0deg, #F472B6, #FACC15, #22C55E, #3B82F6, #A855F7, #F472B6)',
  },
};

export interface ColourPickerProps {
  colors: CatalogFacetItem[];
  selectedColors: string[];
  onToggleColor: (slug: string) => void;
  onClearColors?: () => void;
}

export const ColourPicker: React.FC<ColourPickerProps> = ({
  colors,
  selectedColors,
  onToggleColor,
  onClearColors,
}) => {
  if (colors.length === 0) {
    return (
      <p className="text-xs text-[#1E0B1A]/60 italic">
        Кольорові фільтри наразі недоступні
      </p>
    );
  }

  return (
    <div className="space-y-3" role="group" aria-label="Вибір кольорової гами">
      {/* Swatches Grid */}
      <div className="grid grid-cols-2 gap-2">
        {colors.map(col => {
          const slugKey = col.slug.toLowerCase();
          const isSelected = selectedColors.includes(col.slug);
          const swatch = COLOR_SWATCH_MAP[slugKey] ?? { background: '#D1D5DB', isLight: true };

          return (
            <button
              key={col.id}
              type="button"
              onClick={() => onToggleColor(col.slug)}
              aria-pressed={isSelected}
              aria-label={col.name}
              title={col.name}
              className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E0B1A] ${
                isSelected
                  ? 'bg-[#1E0B1A] text-[#F5B2E2] shadow-sm'
                  : 'bg-white/40 text-[#1E0B1A] hover:bg-white/70'
              }`}
            >
              <span
                style={{ background: swatch.background }}
                className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-transform ${
                  swatch.border ? 'border border-[#1E0B1A]/25' : ''
                } ${isSelected ? 'scale-105 ring-1 ring-[#F5B2E2]/80' : 'group-hover:scale-105'}`}
              >
                {isSelected && (
                  <Check
                    className={`h-3 w-3 stroke-[3] ${
                      swatch.isLight ? 'text-[#1E0B1A]' : 'text-white drop-shadow-sm'
                    }`}
                  />
                )}
              </span>

              <span className="truncate text-[12px] font-semibold leading-tight">
                {col.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected count & quick clear */}
      {selectedColors.length > 0 && onClearColors && (
        <div className="flex items-center justify-between pt-1 border-t border-[#1E0B1A]/15 text-[11px]">
          <span className="font-medium text-[#1E0B1A]/75">
            Обрано: {selectedColors.length}
          </span>
          <button
            type="button"
            onClick={onClearColors}
            className="inline-flex items-center gap-1 font-bold text-[#1E0B1A] hover:opacity-75 transition-opacity"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Очистити</span>
          </button>
        </div>
      )}
    </div>
  );
};
