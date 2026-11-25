import React from 'react';
import { Logo } from '../common/Logo';

export const Footer: React.FC = () => {
  return (
    <footer id="footer" className="w-full bg-[#421838] text-white border-t border-[#542148] mt-24">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start justify-between">
          {/* Left Column: Brand & Contacts */}
          <div className="space-y-6">
            <Logo size="lg" />

            <div className="space-y-2 text-[13px] sm:text-[14px] text-[#FFD7F1]/80 tracking-wider font-sans">
              <p className="font-semibold uppercase text-white/90">
                м. Чернівці, вул. Головна, 15
              </p>
              <p>+380 50 123 45 67</p>
              <p className="lowercase">contact@fiore-boutique.ua</p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white hover:text-[#F5B2E2] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white hover:text-[#F5B2E2] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>

              <a
                href="#"
                aria-label="TikTok"
                className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white hover:text-[#F5B2E2] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.24c-.03 2.05-.72 4.1-2.03 5.67-1.48 1.77-3.72 2.87-6.04 2.98-2.32.1-4.66-.75-6.28-2.4-1.61-1.65-2.43-3.99-2.33-6.31.1-2.3 1.2-4.48 2.97-5.96 1.77-1.48 4.13-2.14 6.42-1.89v4.13c-1.15-.22-2.37-.02-3.38.57-.99.58-1.66 1.6-1.84 2.73-.18 1.12.18 2.29.95 3.12.78.84 1.94 1.29 3.08 1.23 1.14-.06 2.23-.62 2.89-1.57.65-.96.93-2.16.9-3.32V.02z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Column: Business Hours */}
          <div className="md:text-right space-y-4">
            <h3 className="font-serif text-2xl tracking-widest uppercase font-normal text-[#FFD7F1]">
              Графік роботи
            </h3>
            <div className="space-y-3 text-[13px] sm:text-[14px] text-white/80 font-sans tracking-wider">
              <div>
                <p className="text-white/60">Понеділок — П'ятниця</p>
                <p className="font-semibold text-white">09:00 — 20:00</p>
              </div>
              <div>
                <p className="text-white/60">Субота — Неділя</p>
                <p className="font-semibold text-white">10:00 — 18:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
