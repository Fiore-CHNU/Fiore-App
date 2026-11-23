import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const isLarge = size === 'lg';

  return (
    <div className={`inline-flex items-center gap-3 cursor-pointer select-none group ${className}`}>
      {/* Stylized Butterfly matching Figma */}
      <svg
        className={isLarge ? 'w-12 h-12' : 'w-9 h-9'}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="butterflyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD7F1" />
            <stop offset="50%" stopColor="#F5B2E2" />
            <stop offset="100%" stopColor="#C46098" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Left Wing Top */}
        <path
          d="M 48 46 C 42 22 18 16 10 32 C 4 44 22 58 48 50 Z"
          fill="url(#butterflyGrad)"
          opacity="0.95"
        />
        {/* Left Wing Bottom */}
        <path
          d="M 47 52 C 40 60 22 66 18 78 C 14 90 32 94 48 64 Z"
          fill="url(#butterflyGrad)"
          opacity="0.8"
        />
        {/* Right Wing Top */}
        <path
          d="M 52 46 C 58 22 82 16 90 32 C 96 44 78 58 52 50 Z"
          fill="url(#butterflyGrad)"
          opacity="0.95"
        />
        {/* Right Wing Bottom */}
        <path
          d="M 53 52 C 60 60 78 66 82 78 C 86 90 68 94 52 64 Z"
          fill="url(#butterflyGrad)"
          opacity="0.8"
        />
        {/* Body & Antennae */}
        <path
          d="M 50 38 Q 46 26 42 22 M 50 38 Q 54 26 58 22"
          stroke="#FFD7F1"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <ellipse cx="50" cy="52" rx="2.5" ry="12" fill="#FFFFFF" />
      </svg>

      {/* Typography: Fiore */}
      <span
        className={`font-serif tracking-wide text-white transition-colors group-hover:text-[#F5B2E2] ${
          isLarge ? 'text-4xl md:text-5xl font-normal' : 'text-2xl md:text-3xl font-medium'
        }`}
        style={{ letterSpacing: '0.05em' }}
      >
        Fiore
      </span>
    </div>
  );
};
