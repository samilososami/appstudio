'use client';

import React from 'react';

interface WatchMockupProps {
  children?: React.ReactNode;
}

export function WatchMockup({ children }: WatchMockupProps) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.48;
  const rInner = size * 0.42;
  const rScreen = size * 0.37;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
      >
        {/* Correa superior */}
        <rect
          x={size * 0.3}
          y="2"
          width={size * 0.4}
          height={size * 0.08}
          rx="6"
          fill="#1a1a1a"
        />
        {/* Correa inferior */}
        <rect
          x={size * 0.3}
          y={size * 0.92}
          width={size * 0.4}
          height={size * 0.08}
          rx="6"
          fill="#1a1a1a"
        />
        {/* Corona giratoria */}
        <rect
          x={size - 6}
          y={size * 0.32}
          width="6"
          height="36"
          rx="3"
          fill="#2a2a2a"
        />
        {/* Boton lateral */}
        <rect
          x={size - 4}
          y={size * 0.52}
          width="4"
          height="28"
          rx="2"
          fill="#2a2a2a"
        />
        {/* Marco exterior */}
        <circle cx={cx} cy={cy} r={rOuter} fill="#1a1a1a" />
        {/* Bisel interior */}
        <circle
          cx={cx}
          cy={cy}
          r={rInner}
          fill="none"
          stroke="#333"
          strokeWidth={size * 0.012}
        />
        {/* Anillo metálico */}
        <circle
          cx={cx}
          cy={cy}
          r={rOuter - 2}
          fill="none"
          stroke="#3a3a3a"
          strokeWidth="1"
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
          opacity={0.12}
          pointerEvents="none"
        />
        <defs>
          <linearGradient id="watchGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="50%" stopColor="transparent" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
