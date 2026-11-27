import React, { useId, useState } from 'react';
import { AlertCircle, Eye, EyeOff, Heart, Mail, Sparkles } from 'lucide-react';
import { inputClassName } from './formStyles';

export const CARD_LIMIT = 250;

export interface GreetingCardSectionProps {
  withCard: boolean;
  onWithCardChange: (checked: boolean) => void;
  cardMessage: string;
  onCardMessageChange: (message: string) => void;
  error?: string;
}

const TEMPLATES: { label: string; text: string }[] = [
  {
    label: '🎂 З днем народження',
    text: 'З днем народження! Бажаю безмежного щастя, тепла, усмішок та здійснення найзаповітніших мрій! ✨',
  },
  {
    label: '❤️ З любов’ю',
    text: 'З любов’ю та ніжністю! Дякую за те, що робиш кожен мій день особливим та світлим ❤️',
  },
  {
    label: '🌸 Просто так',
    text: 'Нехай цей букет подарує тобі чудовий настрій і нагадає, наскільки ти неймовірна людина! 🌸',
  },
  {
    label: '🥂 Зі святом',
    text: 'Щиро вітаю зі святом! Нехай життя буде наповнене яскравими моментами, натхненням та затишком! 🎉',
  },
];

export const GreetingCardSection: React.FC<GreetingCardSectionProps> = ({
  withCard,
  onWithCardChange,
  cardMessage,
  onCardMessageChange,
  error,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const textareaId = useId();
  const charCount = cardMessage.length;
  const remaining = CARD_LIMIT - charCount;
  const isNearLimit = remaining <= 30 && remaining > 0;
  const isAtLimit = remaining === 0;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, CARD_LIMIT);
    onCardMessageChange(value);
  };

  const handleApplyTemplate = (templateText: string) => {
    // If the card is not yet checked, enable it
    if (!withCard) {
      onWithCardChange(true);
    }
    onCardMessageChange(templateText.slice(0, CARD_LIMIT));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle Box */}
      <div
        onClick={() => onWithCardChange(!withCard)}
        role="checkbox"
        aria-checked={withCard}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onWithCardChange(!withCard);
          }
        }}
        className={`group relative flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all ${
          withCard
            ? 'border-[#F5B2E2] bg-[#F5B2E2]/10 ring-1 ring-[#F5B2E2]'
            : 'border-[#522149] bg-[#1E0B1A]/80 hover:border-[#F5B2E2]/60 hover:bg-[#2B1127]/60'
        }`}
      >
        <div className="flex pt-0.5">
          <input
            type="checkbox"
            id="withCardToggle"
            checked={withCard}
            onChange={e => onWithCardChange(e.target.checked)}
            onClick={e => e.stopPropagation()}
            className="h-4 w-4 cursor-pointer accent-[#F5B2E2]"
            aria-label="Додати безкоштовну листівку"
          />
        </div>

        <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
          <div>
            <div className="flex items-center gap-2">
              <Mail className={`h-4 w-4 ${withCard ? 'text-[#F5B2E2]' : 'text-white/60'}`} />
              <span className="text-sm font-semibold text-white">
                Додати безкоштовну листівку з привітанням
              </span>
            </div>
            <p className="mt-0.5 text-xs text-white/55">
              Флорист надрукує ваші слова на вишуканій фірмовій листівці та вкладе в крафтовий конверт
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-1 rounded-full border border-[#F5B2E2]/30 bg-[#F5B2E2]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#F5B2E2]">
            <Sparkles className="h-3 w-3" /> Безкоштовно
          </span>
        </div>
      </div>

      {/* Expandable message composer */}
      {withCard && (
        <div className="flex flex-col gap-4 rounded-xl border border-[#431A3B] bg-[#1E0B1A]/50 p-4 transition-all">
          {/* Quick template suggestions */}
          <div>
            <span className="mb-2 block text-xs font-medium text-white/70">
              Швидкі шаблони побажань:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map(tmpl => (
                <button
                  key={tmpl.label}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl.text)}
                  className="rounded-lg border border-[#522149] bg-[#2B1127]/70 px-2.5 py-1 text-xs text-white/80 transition-colors hover:border-[#F5B2E2]/70 hover:bg-[#F5B2E2]/15 hover:text-white"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea Field with Character Counter */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor={textareaId} className="text-xs font-medium text-[#FFD7F1]/85">
                Текст листівки
              </label>

              {/* Dynamic Counter */}
              <div
                className={`text-xs font-mono font-medium transition-colors ${
                  isAtLimit
                    ? 'text-red-400 font-bold'
                    : isNearLimit
                    ? 'text-amber-300'
                    : 'text-white/50'
                }`}
                aria-live="polite"
              >
                {charCount}/{CARD_LIMIT}
                {isNearLimit && !isAtLimit && (
                  <span className="ml-1.5 font-sans text-[11px] text-amber-300">
                    (залишилось {remaining})
                  </span>
                )}
                {isAtLimit && (
                  <span className="ml-1.5 font-sans text-[11px] text-red-400">
                    (ліміт)
                  </span>
                )}
              </div>
            </div>

            <textarea
              id={textareaId}
              rows={4}
              maxLength={CARD_LIMIT}
              value={cardMessage}
              onChange={handleTextChange}
              placeholder="Напишіть ваші щирі побажання для одержувача…"
              className={`${inputClassName(Boolean(error))} min-h-[96px] resize-y`}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${textareaId}-error` : undefined}
            />

            {error && (
              <p id={`${textareaId}-error`} className="flex items-center gap-1.5 text-xs text-red-300" role="alert">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          {/* Preview toggle & Card Preview UI */}
          <div className="flex flex-col gap-2 pt-1 border-t border-[#431A3B]/60">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F5B2E2] hover:text-[#FDBDE9] transition-colors"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" /> Сховати попередній перегляд
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" /> Як це виглядатиме в листівці?
                  </>
                )}
              </button>

              <span className="text-[11px] text-white/40">
                Крафтовий конверт 10×15 см
              </span>
            </div>

            {/* Visual card mockup */}
            {showPreview && (
              <div className="relative overflow-hidden rounded-xl border border-[#F5B2E2]/30 bg-gradient-to-br from-[#2B1127] via-[#1E0B1A] to-[#120510] p-6 shadow-xl transition-all">
                <div className="absolute right-3 top-3 opacity-15 text-[#F5B2E2]">
                  <Heart className="h-16 w-16 stroke-1" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <span className="font-serif text-sm tracking-widest uppercase text-[#F5B2E2]/80">
                    Fiore Atelier
                  </span>
                  <div className="my-2 h-[1px] w-12 bg-[#F5B2E2]/40" />

                  <p className="my-4 max-w-md font-serif text-base italic leading-relaxed text-[#FFD7F1] sm:text-lg">
                    {cardMessage.trim() ? (
                      `«${cardMessage.trim()}»`
                    ) : (
                      <span className="text-white/30 italic">
                        (Тут буде надруковано ваш текст привітання)
                      </span>
                    )}
                  </p>

                  <span className="text-[10px] tracking-wider uppercase text-white/40 font-mono">
                    ✦ Ручна робота • З любов’ю ✦
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
