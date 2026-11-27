const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char] ?? char);

/** Picks a comfortable font size so both short notes and 250-char wishes fit inside 15×10 cm. */
const pickMessageFontSizePt = (text: string): number => {
  const len = text.trim().length;
  if (len <= 60) return 15;
  if (len <= 130) return 13;
  if (len <= 200) return 11.5;
  return 10.5;
};

/**
 * Builds standalone HTML for a 15×10 cm (150mm × 100mm) Fiore greeting card.
 * Intentionally omits order numbers, prices, and customer contacts so the card is gift-ready.
 */
export const buildGreetingCardHtml = (orderNumber: string, rawMessage: string): string => {
  const message = rawMessage.trim();
  const fontSizePt = pickMessageFontSizePt(message);

  return `<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8" />
  <title>Листівка Fiore · ${escapeHtml(orderNumber)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet" />
  <style>
    @page {
      size: 150mm 100mm;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #f3ecf0;
      color: #260e21;
      font-family: 'Playfair Display', Georgia, serif;
    }

    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 16px;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      color: #4e1e45;
    }

    .toolbar button {
      border: 1px solid #4e1e45;
      background: #4e1e45;
      color: #ffffff;
      padding: 7px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .toolbar button.secondary {
      background: transparent;
      color: #4e1e45;
    }

    .card {
      position: relative;
      width: 150mm;
      height: 100mm;
      max-width: 150mm;
      max-height: 100mm;
      padding: 7mm;
      background: linear-gradient(145deg, #fffdfb 0%, #fdf6fa 100%);
      border: 0.35mm dashed #d5b4c8;
      box-shadow: 0 12px 32px rgba(38, 14, 33, 0.12);
      overflow: hidden;
      display: flex;
    }

    .frame-outer {
      position: relative;
      flex: 1;
      border: 0.45mm solid #6c335e;
      padding: 2mm;
      display: flex;
    }

    .frame-inner {
      position: relative;
      flex: 1;
      border: 0.2mm solid #d8a9c7;
      padding: 5mm 9mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      text-align: center;
    }

    .corner {
      position: absolute;
      width: 16px;
      height: 16px;
      color: #9e5c8a;
      pointer-events: none;
    }
    .corner.tl { top: 4px; left: 4px; }
    .corner.tr { top: 4px; right: 4px; transform: scaleX(-1); }
    .corner.bl { bottom: 4px; left: 4px; transform: scaleY(-1); }
    .corner.br { bottom: 4px; right: 4px; transform: scale(-1); }

    .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
    }

    .brand-tag {
      font-size: 7.5pt;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: #7d3e6d;
      font-weight: 500;
    }

    .divider {
      width: 24mm;
      height: 0.25mm;
      background: linear-gradient(90deg, transparent, #b87ca4, transparent);
      margin-top: 2px;
    }

    .message-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 2mm 0;
      overflow: hidden;
    }

    .message {
      margin: 0;
      font-size: ${fontSizePt}pt;
      font-style: italic;
      line-height: 1.5;
      color: #2b1025;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      max-width: 112mm;
    }

    .footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .signature {
      font-family: 'Great Vibes', Georgia, cursive;
      font-size: 16pt;
      line-height: 1.1;
      color: #4e1e45;
    }

    .sub {
      font-size: 6.5pt;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #9e5c8a;
    }

    @media print {
      html, body {
        width: 150mm;
        height: 100mm;
        background: #ffffff;
        padding: 0;
        display: block;
      }

      .toolbar {
        display: none !important;
      }

      .card {
        box-shadow: none;
        border: none;
        margin: 0;
        page-break-after: avoid;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span>Формат листівки: <strong>15 × 10 см</strong> (конверт A6)</span>
    <button type="button" onclick="window.print()">Друкувати</button>
    <button type="button" class="secondary" onclick="window.close()">Закрити</button>
  </div>

  <article class="card" aria-label="Друкована листівка Fiore">
    <div class="frame-outer">
      <div class="frame-inner">
        <svg class="corner tl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <path d="M2 14V4a2 2 0 0 1 2-2h10" />
          <circle cx="5.5" cy="5.5" r="1.2" fill="currentColor" />
        </svg>
        <svg class="corner tr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <path d="M2 14V4a2 2 0 0 1 2-2h10" />
          <circle cx="5.5" cy="5.5" r="1.2" fill="currentColor" />
        </svg>
        <svg class="corner bl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <path d="M2 14V4a2 2 0 0 1 2-2h10" />
          <circle cx="5.5" cy="5.5" r="1.2" fill="currentColor" />
        </svg>
        <svg class="corner br" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <path d="M2 14V4a2 2 0 0 1 2-2h10" />
          <circle cx="5.5" cy="5.5" r="1.2" fill="currentColor" />
        </svg>

        <header class="header">
          <svg width="24" height="24" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <path d="M 48 46 C 42 22 18 16 10 32 C 4 44 22 58 48 50 Z" fill="#8b4277" opacity="0.9"/>
            <path d="M 47 52 C 40 60 22 66 18 78 C 14 90 32 94 48 64 Z" fill="#c478ac" opacity="0.85"/>
            <path d="M 52 46 C 58 22 82 16 90 32 C 96 44 78 58 52 50 Z" fill="#8b4277" opacity="0.9"/>
            <path d="M 53 52 C 60 60 78 66 82 78 C 86 90 68 94 52 64 Z" fill="#c478ac" opacity="0.85"/>
            <path d="M 50 38 Q 46 26 42 22 M 50 38 Q 54 26 58 22" stroke="#6c335e" stroke-width="2.5" stroke-linecap="round"/>
            <ellipse cx="50" cy="52" rx="2.5" ry="12" fill="#4e1e45"/>
          </svg>
          <span class="brand-tag">Fiore Atelier</span>
          <div class="divider"></div>
        </header>

        <div class="message-wrap">
          <p class="message">${escapeHtml(message)}</p>
        </div>

        <footer class="footer">
          <span class="signature">Fiore</span>
          <span class="sub">З теплом та ніжністю</span>
        </footer>
      </div>
    </div>
  </article>

  <script>
    (function () {
      var printed = false;
      function triggerPrint() {
        if (printed) return;
        printed = true;
        window.focus();
        window.print();
      }
      if (document.fonts && document.fonts.ready) {
        Promise.race([
          document.fonts.ready,
          new Promise(function (resolve) { setTimeout(resolve, 700); })
        ]).then(triggerPrint);
      } else {
        setTimeout(triggerPrint, 300);
      }
    })();
  </script>
</body>
</html>`;
};

/** Opens a styled 15×10 cm greeting card print window for florists. */
export const printGreetingCard = (orderNumber: string, cardMessage: string): boolean => {
  const popup = window.open('', '_blank', 'width=720,height=520');
  if (!popup) return false;
  popup.document.open();
  popup.document.write(buildGreetingCardHtml(orderNumber, cardMessage));
  popup.document.close();
  return true;
};
