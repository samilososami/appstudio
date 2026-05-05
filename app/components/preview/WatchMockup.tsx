'use client';

import React from 'react';

interface WatchMockupProps {
  children?: React.ReactNode;
}

export function WatchMockup({ children }: WatchMockupProps) {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.47;
  const rInner = size * 0.42;
  const rScreen = size * 0.38;

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Sombra difusa */}
      <div className="absolute bottom-2 w-[200px] h-[24px] bg-black/20 rounded-[100%] blur-xl" />
      <div className="absolute bottom-4 w-[160px] h-[16px] bg-black/10 rounded-[100%] blur-lg" />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-2xl"
      >
        <defs>
          <clipPath id="watchScreen">
            <circle cx={cx} cy={cy} r={rScreen} />
          </clipPath>
          {/* Marco con gradiente metalico */}
          <linearGradient id="watchFrameGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4a4a4c" />
            <stop offset="30%" stopColor="#2c2c2e" />
            <stop offset="70%" stopColor="#1c1c1e" />
            <stop offset="100%" stopColor="#0a0a0c" />
          </linearGradient>
          {/* Cristal */}
          <linearGradient id="watchGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.2" />
            <stop offset="30%" stopColor="#fff" stopOpacity="0.08" />
            <stop offset="60%" stopColor="#fff" stopOpacity="0.02" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          {/* Correa */}
          <linearGradient id="watchStrapGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a3a3c" />
            <stop offset="40%" stopColor="#2c2c2e" />
            <stop offset="100%" stopColor="#1c1c1e" />
          </linearGradient>
          {/* Correa interior */}
          <linearGradient id="watchStrapInner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5c3d2e" />
            <stop offset="100%" stopColor="#3d2a1f" />
          </linearGradient>
          <filter id="watchShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="15" stdDeviation="15" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Correa superior */}
        <rect
          x={size * 0.30}
          y="2"
          width={size * 0.40}
          height={size * 0.10}
          rx="12"
          fill="url(#watchStrapGrad)"
          stroke="#3a3a3c"
          strokeWidth="0.5"
        />
        {/* Interior correa superior */}
        <rect
          x={size * 0.32}
          y="6"
          width={size * 0.36}
          height={size * 0.05}
          rx="6"
          fill="url(#watchStrapInner)"
          opacity="0.6"
        />

        {/* Correa inferior */}
        <rect
          x={size * 0.30}
          y={size * 0.90}
          width={size * 0.40}
          height={size * 0.10}
          rx="12"
          fill="url(#watchStrapGrad)"
          stroke="#3a3a3c"
          strokeWidth="0.5"
        />
        {/* Interior correa inferior */}
        <rect
          x={size * 0.32}
          y={size * 0.92}
          width={size * 0.36}
          height={size * 0.05}
          rx="6"
          fill="url(#watchStrapInner)"
          opacity="0.6"
        />

        {/* Corona Digital Crown */}
        <rect
          x={size - 5}
          y={size * 0.28}
          width="10"
          height="46"
          rx="5"
          fill="#3a3a3c"
          stroke="#4a4a4c"
          strokeWidth="0.5"
        />
        <rect
          x={size - 3}
          y={size * 0.30}
          width="6"
          height="42"
          rx="3"
          fill="#2c2c2e"
        />
        {/* Lineas de la corona */}
        {[...Array(7)].map((_, i) => (
          <rect
            key={i}
            x={size - 1}
            y={size * 0.30 + 4 + i * 5.5}
            width="2"
            height="2.5"
            rx="1"
            fill="#1c1c1e"
          />
        ))}

        {/* Boton lateral */}
        <rect
          x={size - 4}
          y={size * 0.54}
          width="8"
          height="34"
          rx="4"
          fill="#3a3a3c"
          stroke="#4a4a4c"
          strokeWidth="0.5"
        />
        <rect
          x={size - 2}
          y={size * 0.55}
          width="4"
          height="32"
          rx="2"
          fill="#2c2c2e"
        />

        {/* Sombra exterior */}
        <circle
          cx={cx}
          cy={cy}
          r={rOuter + 3}
          fill="#000"
          opacity="0.12"
          filter="url(#watchShadow)"
        />

        {/* Marco exterior */}
        <circle
          cx={cx}
          cy={cy}
          r={rOuter}
          fill="url(#watchFrameGrad)"
          stroke="#5a5a5c"
          strokeWidth="0.5"
        />

        {/* Bisel interior */}
        <circle
          cx={cx}
          cy={cy}
          r={rInner}
          fill="none"
          stroke="#6a6a6c"
          strokeWidth="1.5"
        />
        <circle
          cx={cx}
          cy={cy}
          r={rInner - 1}
          fill="none"
          stroke="#1c1c1e"
          strokeWidth="0.5"
        />

        {/* Anillo decorativo */}
        <circle
          cx={cx}
          cy={cy}
          r={rOuter - 3}
          fill="none"
          stroke="#4a4a4c"
          strokeWidth="0.5"
          opacity="0.4"
        />

        {/* Pantalla */}
        <g clipPath="url(#watchScreen)">
          <rect
            x={cx - rScreen}
            y={cy - rScreen}
            width={rScreen * 2}
            height={rScreen * 2}
            fill="#000"
          />
          <foreignObject
            x={cx - rScreen}
            y={cy - rScreen}
            width={rScreen * 2}
            height={rScreen * 2}
          >
            <div className="w-full h-full flex items-center justify-center bg-black">
              {children}
            </div>
          </foreignObject>
        </g>

        {/* Cristal con reflejo */}
        <circle
          cx={cx}
          cy={cy}
          r={rScreen}
          fill="url(#watchGlass)"
          pointerEvents="none"
        />

        {/* Brillo superior */}
        <ellipse
          cx={cx - rScreen * 0.25}
          cy={cy - rScreen * 0.35}
          rx={rScreen * 0.3}
          ry={rScreen * 0.18}
          fill="#fff"
          opacity="0.04"
          pointerEvents="none"
        />
      </svg>
    </div>
  );
}
