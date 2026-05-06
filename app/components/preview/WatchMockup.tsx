'use client';

import React from 'react';
import type { WatchShape } from '@/app/types';

interface WatchMockupProps {
  children?: React.ReactNode;
  shape?: WatchShape;
}

export function WatchMockup({ children, shape = 'round' }: WatchMockupProps) {
  const isRound = shape === 'round';

  return (
    <div className="relative flex h-[330px] w-[300px] items-center justify-center select-none">
      <div className="absolute bottom-4 h-6 w-[180px] rounded-[100%] bg-black/20 blur-xl" />
      <div className="absolute top-0 h-20 w-[96px] rounded-t-3xl bg-gradient-to-b from-zinc-700 to-zinc-950 shadow-inner" />
      <div className="absolute bottom-0 h-20 w-[96px] rounded-b-3xl bg-gradient-to-t from-zinc-700 to-zinc-950 shadow-inner" />
      <div className="absolute top-[16px] h-12 w-[74px] rounded-2xl bg-stone-800/85" />
      <div className="absolute bottom-[16px] h-12 w-[74px] rounded-2xl bg-stone-800/85" />

      <div className="absolute right-[26px] top-[110px] h-11 w-3.5 rounded-r-lg bg-zinc-700 shadow-inner" />
      <div className="absolute right-[28px] top-[170px] h-8 w-3 rounded-r-md bg-zinc-700 shadow-inner" />

      <div
        className={`relative flex items-center justify-center bg-gradient-to-br from-zinc-500 via-zinc-950 to-black p-[12px] shadow-2xl shadow-black/25 ${
          isRound ? 'h-[260px] w-[260px] rounded-full' : 'h-[250px] w-[250px] rounded-[54px]'
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-[5px] border border-white/10 ${
            isRound ? 'rounded-full' : 'rounded-[48px]'
          }`}
        />
        <div
          className={`relative overflow-hidden bg-black ${
            isRound ? 'h-[210px] w-[210px] rounded-full' : 'h-[202px] w-[202px] rounded-[38px]'
          }`}
        >
          <div className="absolute inset-0">{children}</div>
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br from-white/16 via-transparent to-transparent ${
              isRound ? 'rounded-full' : 'rounded-[38px]'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
