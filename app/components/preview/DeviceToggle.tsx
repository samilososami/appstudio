'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Watch } from 'lucide-react';
import { DeviceType } from '@/app/types';

interface DeviceToggleProps {
  value: DeviceType;
  onChange: (value: DeviceType) => void;
}

export function DeviceToggle({ value, onChange }: DeviceToggleProps) {
  return (
    <div className="flex items-center bg-white rounded-2xl p-1.5 border border-bone-200 shadow-sm">
      <button
        onClick={() => onChange('phone')}
        className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          value === 'phone'
            ? 'text-white'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {value === 'phone' && (
          <motion.div
            layoutId="deviceToggle"
            className="absolute inset-0 bg-water-500 rounded-xl shadow-lg shadow-water-500/25"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Smartphone className="w-4 h-4 relative z-10" />
        <span className="relative z-10">Telefono</span>
      </button>
      <button
        onClick={() => onChange('watch')}
        className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          value === 'watch'
            ? 'text-white'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {value === 'watch' && (
          <motion.div
            layoutId="deviceToggle"
            className="absolute inset-0 bg-water-500 rounded-xl shadow-lg shadow-water-500/25"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Watch className="w-4 h-4 relative z-10" />
        <span className="relative z-10">Reloj</span>
      </button>
    </div>
  );
}
