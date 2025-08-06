
'use client';

import * as React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CircularCheckbox } from './circular-checkbox';

interface SkillStepCardProps {
  step: {
    id: number;
    stepNumber: number;
    title: string;
    description: string;
    keyPoints: string[];
    isCritical: boolean;
    timeEstimate: number;
  };
  isCompleted: boolean;
  onToggleComplete: (stepNumber: number) => void;
  isTimerRunning?: boolean;
  className?: string;
}

export function SkillStepCard({ 
  step, 
  isCompleted, 
  onToggleComplete, 
  isTimerRunning = true,
  className 
}: SkillStepCardProps) {
  const isDisabled = !isTimerRunning;
  
  return (
    <div
      className={cn(
        'border rounded-xl p-5 transition-all duration-300',
        isCompleted
          ? 'bg-orange-50 border-orange-200 shadow-sm'
          : isDisabled
          ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
          : 'bg-white border-gray-200 hover:border-orange-200 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start space-x-5">
        <CircularCheckbox
          checked={isCompleted}
          onCheckedChange={() => {
            if (!isDisabled) {
              onToggleComplete(step.stepNumber);
            }
          }}
          size="lg"
          className={cn(
            "mt-1 flex-shrink-0",
            isDisabled && "cursor-not-allowed opacity-50"
          )}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-1.5 rounded-full">
                Step {step.stepNumber}
              </span>
              {step.isCritical && (
                <div className="flex items-center space-x-1 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">Critical</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1 text-gray-500 flex-shrink-0">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{step.timeEstimate}m</span>
            </div>
          </div>
          
          <h3 className={cn(
            'font-semibold text-gray-900 mb-3 leading-tight text-base',
            isCompleted && 'text-orange-800',
            isDisabled && 'text-gray-500'
          )}>
            {step.title}
          </h3>
          
          <p className={cn(
            'text-gray-700 text-sm mb-4 leading-relaxed',
            isCompleted && 'text-orange-700',
            isDisabled && 'text-gray-500'
          )}>
            {step.description}
          </p>
          
          {step.keyPoints && step.keyPoints.length > 0 && (
            <div className="border-t border-gray-100 pt-4 mt-4">
              <p className={cn(
                "text-sm font-medium text-gray-600 mb-3",
                isDisabled && "text-gray-400"
              )}>Key Points:</p>
              <ul className="space-y-2">
                {step.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <div className={cn(
                      "w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0",
                      isDisabled && "bg-gray-300"
                    )} />
                    <span className={cn(
                      'text-gray-600 leading-relaxed flex-1',
                      isCompleted && 'text-orange-600',
                      isDisabled && 'text-gray-400'
                    )}>
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
