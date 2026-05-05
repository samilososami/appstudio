'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-bone-300/50 ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-5 py-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
          <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
          <div className="flex flex-col gap-2 max-w-[70%]">
            <Skeleton className="h-10 w-full rounded-2xl" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PreviewSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      <Skeleton className="w-[120px] h-8 rounded-full" />
      <div className="relative">
        <Skeleton className="w-[280px] h-[560px] rounded-[40px]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}
