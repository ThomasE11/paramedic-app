
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkillProgressBarProps {
  value: number;
  total: number;
  className?: string;
}

export function SkillProgressBar({ value, total, className }: SkillProgressBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
        <span>Progress</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-orange-400 to-orange-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{value} of {total} steps completed</span>
        <span>{total - value} remaining</span>
      </div>
    </div>
  );
}
