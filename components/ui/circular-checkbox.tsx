
'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CircularCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CircularCheckbox({ 
  checked, 
  onCheckedChange, 
  className,
  size = 'md'
}: CircularCheckboxProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'rounded-full border-2 flex items-center justify-center transition-all duration-200',
        sizeClasses[size],
        checked 
          ? 'bg-orange-500 border-orange-500 text-white shadow-sm' 
          : 'border-gray-300 hover:border-orange-300 bg-white',
        'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-200',
        className
      )}
    >
      {checked && (
        <Check className={cn(iconSizes[size], 'stroke-[3]')} />
      )}
    </button>
  );
}
