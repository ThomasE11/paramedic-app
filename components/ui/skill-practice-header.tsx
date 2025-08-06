
'use client';

import * as React from 'react';
import { ChevronLeft, Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { SkillProgressBar } from './skill-progress-bar';
import { cn } from '@/lib/utils';

interface SkillPracticeHeaderProps {
  skill: {
    id: number;
    name: string;
    description: string;
    category?: {
      name: string;
      colorCode: string;
    };
    difficultyLevel: string;
    isCritical: boolean;
    estimatedTimeMinutes: number;
    steps?: any[];
  };
  completedSteps: number[];
  timeSpent: number;
  isTimerRunning: boolean;
  onBack: () => void;
  onStartPractice: () => void;
  onPausePractice: () => void;
  onResetPractice: () => void;
}

export function SkillPracticeHeader({
  skill,
  completedSteps,
  timeSpent,
  isTimerRunning,
  onBack,
  onStartPractice,
  onPausePractice,
  onResetPractice
}: SkillPracticeHeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Skills
        </Button>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{formatTime(timeSpent)}</span>
          </div>
          
          {isTimerRunning ? (
            <Button onClick={onPausePractice} variant="outline" className="border-orange-200 hover:bg-orange-50">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button onClick={onStartPractice} className="bg-orange-500 hover:bg-orange-600">
              <Play className="h-4 w-4 mr-2" />
              {completedSteps.length === 0 ? 'Start Practice' : 'Resume Practice'}
            </Button>
          )}
          
          <Button onClick={onResetPractice} variant="outline" className="hover:bg-gray-50">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Skill Information */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: skill.category?.colorCode }}
              />
              <span className="text-sm text-gray-600">{skill.category?.name}</span>
              <Badge className={getDifficultyColor(skill.difficultyLevel)}>
                {skill.difficultyLevel}
              </Badge>
              {skill.isCritical && (
                <Badge variant="destructive">Critical</Badge>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{skill.name}</h1>
            <p className="text-gray-700 leading-relaxed">{skill.description}</p>
          </div>
          
          <div className="text-right ml-6">
            <div className="text-sm text-gray-500 mb-1">Est. Time</div>
            <div className="text-lg font-semibold text-orange-600">
              {skill.estimatedTimeMinutes}m
            </div>
          </div>
        </div>
        
        <SkillProgressBar
          value={completedSteps.length}
          total={skill.steps?.length || 0}
          className="mt-4"
        />
      </div>
    </div>
  );
}
