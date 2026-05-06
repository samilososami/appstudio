'use client';

import React from 'react';

interface PhoneMockupProps {
  children?: React.ReactNode;
}

export function PhoneMockup({ children }: PhoneMockupProps) {
  return (
    <div className="relative flex items-center justify-center select-none">
      <div className="absolute -bottom-4 h-7 w-[210px] rounded-[100%] bg-black/20 blur-xl" />
      <div className="relative h-[560px] w-[276px] rounded-[40px] bg-gradient-to-br from-zinc-600 via-zinc-950 to-black p-[8px] shadow-2xl shadow-black/25">
        <div className="absolute -left-[4px] top-24 h-10 w-[4px] rounded-l-md bg-zinc-700 shadow-inner" />
        <div className="absolute -left-[4px] top-38 h-14 w-[4px] rounded-l-md bg-zinc-700 shadow-inner" />
        <div className="absolute -right-[4px] top-32 h-16 w-[4px] rounded-r-md bg-zinc-800 shadow-inner" />
        <div className="pointer-events-none absolute inset-[3px] rounded-[37px] border border-white/10" />

        <div className="relative h-full w-full overflow-hidden rounded-[34px] bg-black p-[5px]">
          <div className="pointer-events-none absolute left-1/2 top-[8px] z-30 h-6 w-24 -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
          <div className="relative h-full w-full overflow-hidden rounded-[29px] bg-white">
            <div className="absolute inset-0">{children}</div>
          </div>
          <div className="pointer-events-none absolute bottom-[9px] left-1/2 z-30 h-1.5 w-20 -translate-x-1/2 rounded-full bg-white/55" />
          <div className="pointer-events-none absolute inset-[5px] rounded-[29px] bg-gradient-to-br from-white/14 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}
