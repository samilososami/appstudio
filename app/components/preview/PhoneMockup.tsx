'use client';

import React from 'react';

interface PhoneMockupProps {
  children?: React.ReactNode;
}

export function PhoneMockup({ children }: PhoneMockupProps) {
  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="300"
        height="600"
        viewBox="0 0 300 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_25px_50px_rgba(0,0,0,0.25)]"
      >
        {/* Sombra exterior suave */}
        <rect x="8" y="8" width="284" height="584" rx="38" fill="#0a0a0a" />
        {/* Marco exterior */}
        <rect
          x="10"
          y="10"
          width="280"
          height="580"
          rx="36"
          fill="#1a1a1a"
        />
        {/* Boton power */}
        <rect x="290" y="130" width="4" height="48" rx="2" fill="#2a2a2a" />
        {/* Boton volumen arriba */}
        <rect x="6" y="110" width="4" height="32" rx="2" fill="#2a2a2a" />
        {/* Boton volumen abajo */}
        <rect x="6" y="150" width="4" height="32" rx="2" fill="#2a2a2a" />
        {/* Marco interior */}
        <rect
          x="18"
          y="18"
          width="264"
          height="564"
          rx="28"
          fill="#000"
        />
        {/* Notch moderno */}
        <rect x="100" y="18" width="100" height="28" rx="14" fill="#000" />
        {/* Pantalla con clipPath */}
        <defs>
          <clipPath id="phoneScreen">
            <rect x="22" y="22" width="256" height="556" rx="24" />
          </clipPath>
        </defs>
        <g clipPath="url(#phoneScreen)">
          <rect x="22" y="22" width="256" height="556" fill="#fff" />
          <foreignObject x="22" y="22" width="256" height="556">
            <div className="w-full h-full flex items-center justify-center bg-white">
              {children}
            </div>
          </foreignObject>
        </g>
        {/* Reflejo superior */}
        <rect
          x="22"
          y="22"
          width="256"
          height="120"
          rx="24"
          fill="url(#phoneReflection)"
          opacity="0.08"
          pointerEvents="none"
        />
        <defs>
          <linearGradient id="phoneReflection" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
