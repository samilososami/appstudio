'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Settings, Wand2 } from 'lucide-react';

interface SidebarProps {
  activeItem: 'chat' | 'settings';
  onNavigate: (item: 'chat' | 'settings') => void;
}

export function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  const items = [
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare, desc: 'Habla con la IA' },
    { id: 'settings' as const, label: 'Ajustes', icon: Settings, desc: 'Configura todo' },
  ];

  return (
    <nav className="flex flex-col gap-2">
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;
        return (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all text-left group ${
              isActive
                ? 'bg-water-50 shadow-md border border-water-200'
                : 'hover:bg-bone-50 border border-transparent'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-water-500 text-white shadow-lg shadow-water-500/30'
                  : 'bg-bone-100 text-gray-500 group-hover:bg-white group-hover:shadow-sm'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span
                className={`block font-semibold ${
                  isActive ? 'text-water-900' : 'text-gray-700'
                }`}
              >
                {item.label}
              </span>
              <span className="text-xs text-gray-400">{item.desc}</span>
            </div>
          </motion.button>
        );
      })}
    </nav>
  );
}
