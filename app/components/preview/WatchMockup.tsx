'use client';

import React from 'react';

interface WatchMockupProps {
  children?: React.ReactNode;
}

export function WatchMockup({ children }: WatchMockupProps) {
  return (
    <div className="relative flex h-[330px] w-[300px] items-center justify-center select-none">
      <div className="absolute bottom-4 h-6 w-[180px] rounded-[100%] bg-black/20 blur-xl" />
      <div className="absolute top-0 h-20 w-[96px] rounded-t-3xl bg-gradient-to-b from-zinc-700 to-zinc-950 shadow-inner" />
      <div className="absolute bottom-0 h-20 w-[96px] rounded-b-3xl bg-gradient-to-t from-zinc-700 to-zinc-950 shadow-inner" />
      <div className="absolute top-[16px] h-12 w-[74px] rounded-2xl bg-stone-800/85" />
      <div className="absolute bottom-[16px] h-12 w-[74px] rounded-2xl bg-stone-800/85" />

      <div className="absolute right-[26px] top-[110px] h-11 w-3.5 rounded-r-lg bg-zinc-700 shadow-inner" />
      <div className="absolute right-[28px] top-[170px] h-8 w-3 rounded-r-md bg-zinc-700 shadow-inner" />

      <div className="relative flex h-[260px] w-[260px] items-center justify-center rounded-full bg-gradient-to-br from-zinc-500 via-zinc-950 to-black p-[12px] shadow-2xl shadow-black/25">
        <div className="pointer-events-none absolute inset-[5px] rounded-full border border-white/10" />
        <div className="relative h-[214px] w-[214px] overflow-hidden rounded-full bg-black">
          <div className="absolute inset-0">{children}</div>
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/16 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}
