'use client';

import React from 'react';

interface PhoneMockupProps {
  children?: React.ReactNode;
}

export function PhoneMockup({ children }: PhoneMockupProps) {
  return (
    <div className="relative flex items-center justify-center select-none">
      <div className="absolute -bottom-2 w-[240px] h-[24px] bg-black/20 rounded-[100%] blur-xl" />
      <div className="absolute -bottom-1 w-[200px] h-[16px] bg-black/10 rounded-[100%] blur-lg" />

      <svg
        width="320"
        height="640"
        viewBox="0 0 320 640"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-2xl"
      >
        <defs>
          <clipPath id="phoneScreen">
            <rect x="24" y="24" width="272" height="592" rx="28" />
          </clipPath>
          <linearGradient id="phoneFrameGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3a3a3c" />
            <stop offset="30%" stopColor="#2c2c2e" />
            <stop offset="70%" stopColor="#1c1c1e" />
            <stop offset="100%" stopColor="#0a0a0c" />
          </linearGradient>
          <linearGradient id="phoneReflection" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.15" />
            <stop offset="40%" stopColor="#fff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="phoneEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.06" />
          </linearGradient>
          <filter id="phoneShadow" x="-10%" y="-5%" width="120%" height="120%">
            <feDropShadow dx="0" dy="20" stdDeviation="20" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Botones fisicos */}
        <rect x="310" y="140" width="7" height="56" rx="3.5" fill="#2a2a2c" stroke="#3a3a3c" strokeWidth="0.5" />
        <rect x="312" y="142" width="5" height="52" rx="2.5" fill="#1c1c1e" />

        <rect x="3" y="118" width="7" height="40" rx="3.5" fill="#2a2a2c" stroke="#3a3a3c" strokeWidth="0.5" />
        <rect x="3" y="168" width="7" height="40" rx="3.5" fill="#2a2a2c" stroke="#3a3a3c" strokeWidth="0.5" />
        <rect x="3" y="218" width="7" height="40" rx="3.5" fill="#2a2a2c" stroke="#3a3a3c" strokeWidth="0.5" />

        {/* Sombra exterior */}
        <rect x="8" y="8" width="304" height="624" rx="42" fill="#000" opacity="0.12" filter="url(#phoneShadow)" />

        {/* Marco exterior */}
        <rect
          x="10"
          y="10"
          width="300"
          height="620"
          rx="40"
          fill="url(#phoneFrameGrad)"
          stroke="#4a4a4c"
          strokeWidth="0.5"
        />

        {/* Borde brillante */}
        <rect
          x="12"
          y="12"
          width="296"
          height="616"
          rx="38"
          fill="none"
          stroke="#5a5a5c"
          strokeWidth="0.5"
          opacity="0.4"
        />

        {/* Reflejo de borde */}
        <rect
          x="13"
          y="13"
          width="294"
          height="614"
          rx="37"
          fill="none"
          stroke="url(#phoneEdge)"
          strokeWidth="1"
        />

        {/* Marco interior */}
        <rect
          x="18"
          y="18"
          width="284"
          height="604"
          rx="34"
          fill="#0a0a0c"
          stroke="#1c1c1e"
          strokeWidth="1"
        />

        {/* Notch estilo Dynamic Island */}
        <rect x="100" y="22" width="120" height="34" rx="17" fill="#0a0a0c" />
        <rect x="102" y="24" width="116" height="30" rx="15" fill="#0a0a0c" stroke="#1c1c1e" strokeWidth="0.5" />
        <circle cx="125" cy="40" r="3" fill="#1a1a1c" />
        <circle cx="195" cy="40" r="3" fill="#1a1a1c" />

        {/* Pantalla */}
        <g clipPath="url(#phoneScreen)">
          <rect x="24" y="24" width="272" height="592" fill="#fff" />
          <foreignObject x="24" y="24" width="272" height="592">
            <div className="w-full h-full flex items-center justify-center">
              {children}
            </div>
          </foreignObject>
        </g>

        {/* Reflejo superior de cristal */}
        <rect
          x="24"
          y="24"
          width="272"
          height="220"
          rx="28"
          fill="url(#phoneReflection)"
          pointerEvents="none"
        />

        {/* Barra de estado */}
        <rect x="130" y="24" width="60" height="5" rx="2.5" fill="#000" opacity="0.25" pointerEvents="none" />

        {/* Indicador de home */}
        <rect x="120" y="610" width="80" height="5" rx="2.5" fill="#fff" opacity="0.25" pointerEvents="none" />
      </svg>
    </div>
  );
}
