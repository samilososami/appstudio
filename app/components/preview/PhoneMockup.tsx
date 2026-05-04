'use client';

import React from 'react';

interface PhoneMockupProps {
  children?: React.ReactNode;
}

export function PhoneMockup({ children }: PhoneMockupProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Sombra difusa debajo del telefono */}
      <div className="absolute bottom-0 w-[260px] h-[20px] bg-black/15 rounded-full blur-xl" />

      <svg
        width="300"
        height="600"
        viewBox="0 0 300 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-2xl"
      >
        {/* Definiciones */}
        <defs>
          <clipPath id="phoneScreen">
            <rect x="22" y="22" width="256" height="556" rx="24" />
          </clipPath>
          <linearGradient id="phoneFrameGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="50%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0f0f0f" />
          </linearGradient>
          <linearGradient id="phoneReflection" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id="phoneShadow" x="-10%" y="-5%" width="120%" height="120%">
            <feDropShadow dx="0" dy="20" stdDeviation="20" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Sombra exterior suave */}
        <rect x="5" y="5" width="290" height="590" rx="40" fill="#000" opacity="0.15" filter="url(#phoneShadow)" />

        {/* Marco exterior */}
        <rect
          x="10"
          y="10"
          width="280"
          height="580"
          rx="36"
          fill="url(#phoneFrameGrad)"
          stroke="#333"
          strokeWidth="1"
        />

        {/* Borde brillante */}
        <rect
          x="12"
          y="12"
          width="276"
          height="576"
          rx="34"
          fill="none"
          stroke="#444"
          strokeWidth="0.5"
          opacity="0.6"
        />

        {/* Boton power */}
        <rect x="288" y="130" width="6" height="52" rx="3" fill="#2a2a2a" stroke="#333" strokeWidth="0.5" />

        {/* Boton volumen arriba */}
        <rect x="6" y="110" width="6" height="36" rx="3" fill="#2a2a2a" stroke="#333" strokeWidth="0.5" />

        {/* Boton volumen abajo */}
        <rect x="6" y="155" width="6" height="36" rx="3" fill="#2a2a2a" stroke="#333" strokeWidth="0.5" />

        {/* Marco interior (bisel) */}
        <rect
          x="16"
          y="16"
          width="268"
          height="568"
          rx="32"
          fill="#000"
          stroke="#111"
          strokeWidth="1"
        />

        {/* Notch moderno estilo Dynamic Island */}
        <rect x="100" y="20" width="100" height="30" rx="15" fill="#000" />
        <rect x="102" y="21" width="96" height="28" rx="14" fill="#0a0a0a" stroke="#1a1a1a" strokeWidth="0.5" />

        {/* Pantalla con clipPath */}
        <g clipPath="url(#phoneScreen)">
          <rect x="20" y="20" width="260" height="560" fill="#fff" />
          <foreignObject x="20" y="20" width="260" height="560">
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
          height="200"
          rx="24"
          fill="url(#phoneReflection)"
          pointerEvents="none"
        />

        {/* Barra de estado simulada */}
        <rect x="120" y="22" width="60" height="5" rx="2.5" fill="#000" opacity="0.3" pointerEvents="none" />

        {/* Indicador de home (barra inferior) */}
        <rect x="110" y="578" width="80" height="4" rx="2" fill="#fff" opacity="0.3" pointerEvents="none" />
      </svg>
    </div>
  );
}
