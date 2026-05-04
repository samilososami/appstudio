'use client';

import React from 'react';

interface WatchMockupProps {
  children?: React.ReactNode;
}

export function WatchMockup({ children }: WatchMockupProps) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.46;
  const rInner = size * 0.40;
  const rScreen = size * 0.36;

  return (
    <div className="relative flex items-center justify-center">
      {/* Sombra difusa */}
      <div className="absolute bottom-4 w-[180px] h-[20px] bg-black/15 rounded-full blur-xl" />

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
          <linearGradient id="watchFrameGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3a3a3a" />
            <stop offset="50%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          <linearGradient id="watchGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.15" />
            <stop offset="40%" stopColor="#fff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="watchStrapGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="50%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          <filter id="watchShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="15" stdDeviation="15" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Correa superior */}
        <rect
          x={size * 0.32}
          y="2"
          width={size * 0.36}
          height={size * 0.08}
          rx="10"
          fill="url(#watchStrapGrad)"
          stroke="#2a2a2a"
          strokeWidth="0.5"
        />

        {/* Correa inferior */}
        <rect
          x={size * 0.32}
          y={size * 0.92}
          width={size * 0.36}
          height={size * 0.08}
          rx="10"
          fill="url(#watchStrapGrad)"
          stroke="#2a2a2a"
          strokeWidth="0.5"
        />

        {/* Corona giratoria */}
        <rect
          x={size - 4}
          y={size * 0.30}
          width="8"
          height="42"
          rx="4"
          fill="#2a2a2a"
          stroke="#333"
          strokeWidth="0.5"
        />
        <rect
          x={size - 2}
          y={size * 0.32}
          width="4"
          height="38"
          rx="2"
          fill="#1a1a1a"
        />

        {/* Boton lateral */}
        <rect
          x={size - 3}
          y={size * 0.52}
          width="6"
          height="32"
          rx="3"
          fill="#2a2a2a"
          stroke="#333"
          strokeWidth="0.5"
        />

        {/* Sombra exterior */}
        <circle
          cx={cx}
          cy={cy}
          r={rOuter + 2}
          fill="#000"
          opacity="0.15"
          filter="url(#watchShadow)"
        />

        {/* Marco exterior (carcasa) */}
        <circle
          cx={cx}
          cy={cy}
          r={rOuter}
          fill="url(#watchFrameGrad)"
          stroke="#444"
          strokeWidth="1"
        />

        {/* Bisel interior metálico */}
        <circle
          cx={cx}
          cy={cy}
          r={rInner}
          fill="none"
          stroke="#555"
          strokeWidth="2"
        />
        <circle
          cx={cx}
          cy={cy}
          r={rInner - 1}
          fill="none"
          stroke="#222"
          strokeWidth="0.5"
        />

        {/* Anillo metálico decorativo */}
        <circle
          cx={cx}
          cy={cy}
          r={rOuter - 2}
          fill="none"
          stroke="#3a3a3a"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Clip circular para pantalla */}
        <defs>
          <clipPath id="watchScreen">
            <circle cx={cx} cy={cy} r={rScreen} />
          </clipPath>
        </defs>

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

        {/* Reflejo del cristal */}
        <circle
          cx={cx}
          cy={cy}
          r={rScreen}
          fill="url(#watchGlass)"
          pointerEvents="none"
        />

        {/* Brillo superior */}
        <ellipse
          cx={cx - rScreen * 0.2}
          cy={cy - rScreen * 0.3}
          rx={rScreen * 0.3}
          ry={rScreen * 0.2}
          fill="#fff"
          opacity="0.03"
          pointerEvents="none"
        />
      </svg>
    </div>
  );
}
