
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Skill, SkillStep } from '@/lib/types';

interface TargetArea {
  id: string;
  name: string;
  type: 'circle' | 'rectangle' | 'polygon';
  coordinates: number[];
  tolerance: number;
  stepNumber: number;
  isActive: boolean;
  color: string;
  description: string;
}

interface SkillTargetAreasProps {
  skill: Skill;
  currentStep: number;
  onTargetHit?: (targetId: string, accuracy: number) => void;
  onStepComplete?: (stepNumber: number) => void;
  handPositions?: Array<{x: number, y: number}>;
  posePositions?: Array<{x: number, y: number}>;
  canvasWidth?: number;
  canvasHeight?: number;
  className?: string;
}

export function SkillTargetAreas({
  skill,
  currentStep,
  onTargetHit,
  onStepComplete,
  handPositions = [],
  posePositions = [],
  canvasWidth = 1280,
  canvasHeight = 720,
  className = ''
}: SkillTargetAreasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [targetAreas, setTargetAreas] = useState<TargetArea[]>([]);
  const [hitTargets, setHitTargets] = useState<Set<string>>(new Set());
  const [stepProgress, setStepProgress] = useState<Map<number, number>>(new Map());

  // Define skill-specific target areas based on skill type
  const generateSkillTargetAreas = useCallback((skill: Skill): TargetArea[] => {
    const areas: TargetArea[] = [];
    
    if (!skill.steps) return areas;

    skill.steps.forEach((step, index) => {
      const stepNum = step.stepNumber;
      
      // Define target areas based on skill name and step content
      if (skill.name.toLowerCase().includes('cpr')) {
        areas.push(...generateCPRTargetAreas(step, stepNum));
      } else if (skill.name.toLowerCase().includes('intubation')) {
        areas.push(...generateIntubationTargetAreas(step, stepNum));
      } else if (skill.name.toLowerCase().includes('bandage')) {
        areas.push(...generateBandageTargetAreas(step, stepNum));
      } else if (skill.name.toLowerCase().includes('injection')) {
        areas.push(...generateInjectionTargetAreas(step, stepNum));
      } else if (skill.name.toLowerCase().includes('vital signs')) {
        areas.push(...generateVitalSignsTargetAreas(step, stepNum));
      } else {
        // Generic target areas for other skills
        areas.push(...generateGenericTargetAreas(step, stepNum));
      }
    });

    return areas;
  }, []);

  const generateCPRTargetAreas = (step: SkillStep, stepNum: number): TargetArea[] => {
    const areas: TargetArea[] = [];
    
    if (step.title.toLowerCase().includes('position') || step.title.toLowerCase().includes('placement')) {
      areas.push({
        id: `cpr-chest-${stepNum}`,
        name: 'Chest Compression Point',
        type: 'circle',
        coordinates: [640, 400, 60], // x, y, radius
        tolerance: 20,
        stepNumber: stepNum,
        isActive: false,
        color: '#ff4444',
        description: 'Place hands on lower half of breastbone'
      });
    }
    
    if (step.title.toLowerCase().includes('compression')) {
      areas.push({
        id: `cpr-compression-${stepNum}`,
        name: 'Compression Area',
        type: 'rectangle',
        coordinates: [590, 350, 100, 100], // x, y, width, height
        tolerance: 15,
        stepNumber: stepNum,
        isActive: false,
        color: '#ff6666',
        description: 'Maintain hand position during compressions'
      });
    }
    
    return areas;
  };

  const generateIntubationTargetAreas = (step: SkillStep, stepNum: number): TargetArea[] => {
    const areas: TargetArea[] = [];
    
    if (step.title.toLowerCase().includes('laryngoscope')) {
      areas.push({
        id: `intubation-mouth-${stepNum}`,
        name: 'Mouth Opening',
        type: 'circle',
        coordinates: [640, 300, 40],
        tolerance: 15,
        stepNumber: stepNum,
        isActive: false,
        color: '#44ff44',
        description: 'Insert laryngoscope blade'
      });
    }
    
    if (step.title.toLowerCase().includes('tube')) {
      areas.push({
        id: `intubation-tube-${stepNum}`,
        name: 'Tube Insertion Point',
        type: 'circle',
        coordinates: [640, 320, 25],
        tolerance: 10,
        stepNumber: stepNum,
        isActive: false,
        color: '#4444ff',
        description: 'Insert endotracheal tube'
      });
    }
    
    return areas;
  };

  const generateBandageTargetAreas = (step: SkillStep, stepNum: number): TargetArea[] => {
    const areas: TargetArea[] = [];
    
    if (step.title.toLowerCase().includes('wound') || step.title.toLowerCase().includes('injury')) {
      areas.push({
        id: `bandage-wound-${stepNum}`,
        name: 'Wound Area',
        type: 'circle',
        coordinates: [500, 450, 50],
        tolerance: 20,
        stepNumber: stepNum,
        isActive: false,
        color: '#ffaa44',
        description: 'Apply bandage to wound area'
      });
    }
    
    return areas;
  };

  const generateInjectionTargetAreas = (step: SkillStep, stepNum: number): TargetArea[] => {
    const areas: TargetArea[] = [];
    
    if (step.title.toLowerCase().includes('injection') || step.title.toLowerCase().includes('needle')) {
      areas.push({
        id: `injection-site-${stepNum}`,
        name: 'Injection Site',
        type: 'circle',
        coordinates: [600, 400, 30],
        tolerance: 15,
        stepNumber: stepNum,
        isActive: false,
        color: '#aa44ff',
        description: 'Insert needle at injection site'
      });
    }
    
    return areas;
  };

  const generateVitalSignsTargetAreas = (step: SkillStep, stepNum: number): TargetArea[] => {
    const areas: TargetArea[] = [];
    
    if (step.title.toLowerCase().includes('pulse')) {
      areas.push({
        id: `pulse-wrist-${stepNum}`,
        name: 'Radial Pulse Point',
        type: 'circle',
        coordinates: [450, 500, 25],
        tolerance: 10,
        stepNumber: stepNum,
        isActive: false,
        color: '#44aaff',
        description: 'Locate radial pulse'
      });
    }
    
    if (step.title.toLowerCase().includes('blood pressure')) {
      areas.push({
        id: `bp-cuff-${stepNum}`,
        name: 'Blood Pressure Cuff Area',
        type: 'rectangle',
        coordinates: [400, 350, 80, 120],
        tolerance: 15,
        stepNumber: stepNum,
        isActive: false,
        color: '#ff44aa',
        description: 'Apply blood pressure cuff'
      });
    }
    
    return areas;
  };

  const generateGenericTargetAreas = (step: SkillStep, stepNum: number): TargetArea[] => {
    const areas: TargetArea[] = [];
    
    // Generic target area for each step
    const baseX = 500 + (stepNum % 3) * 150;
    const baseY = 350 + Math.floor(stepNum / 3) * 100;
    
    areas.push({
      id: `generic-${stepNum}`,
      name: `Step ${stepNum} Target`,
      type: 'circle',
      coordinates: [baseX, baseY, 40],
      tolerance: 20,
      stepNumber: stepNum,
      isActive: false,
      color: '#666666',
      description: step.title
    });
    
    return areas;
  };

  // Calculate distance between two points
  const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // Check if position hits target area
  const checkTargetHit = useCallback((
    position: {x: number, y: number},
    target: TargetArea,
    canvasWidth: number,
    canvasHeight: number
  ): { hit: boolean; accuracy: number } => {
    const scaledX = position.x * canvasWidth;
    const scaledY = position.y * canvasHeight;
    
    if (target.type === 'circle') {
      const [cx, cy, radius] = target.coordinates;
      const distance = calculateDistance(scaledX, scaledY, cx, cy);
      const hit = distance <= radius + target.tolerance;
      const accuracy = hit ? Math.max(0, 1 - distance / (radius + target.tolerance)) : 0;
      return { hit, accuracy };
    } else if (target.type === 'rectangle') {
      const [x, y, width, height] = target.coordinates;
      const hit = scaledX >= x - target.tolerance && 
                  scaledX <= x + width + target.tolerance &&
                  scaledY >= y - target.tolerance && 
                  scaledY <= y + height + target.tolerance;
      
      if (hit) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const distance = calculateDistance(scaledX, scaledY, centerX, centerY);
        const maxDistance = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
        const accuracy = Math.max(0, 1 - distance / maxDistance);
        return { hit, accuracy };
      }
      return { hit: false, accuracy: 0 };
    }
    
    return { hit: false, accuracy: 0 };
  }, []);

  // Draw target areas on canvas
  const drawTargetAreas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw target areas
    targetAreas.forEach(target => {
      if (target.stepNumber === currentStep || target.isActive) {
        ctx.strokeStyle = target.color;
        ctx.fillStyle = target.color + '20'; // Semi-transparent fill
        ctx.lineWidth = 3;
        
        if (target.type === 'circle') {
          const [cx, cy, radius] = target.coordinates;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.fill();
          
          // Draw center point
          ctx.fillStyle = target.color;
          ctx.beginPath();
          ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw label
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(target.name, cx, cy - radius - 10);
        } else if (target.type === 'rectangle') {
          const [x, y, width, height] = target.coordinates;
          ctx.strokeRect(x, y, width, height);
          ctx.fillRect(x, y, width, height);
          
          // Draw label
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(target.name, x + width / 2, y - 10);
        }
      }
    });
    
    // Draw hand positions
    handPositions.forEach((pos, index) => {
      const x = pos.x * canvasWidth;
      const y = pos.y * canvasHeight;
      
      ctx.fillStyle = index === 0 ? '#ff6b6b' : '#4ecdc4';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    
    // Draw pose key points
    posePositions.forEach((pos, index) => {
      const x = pos.x * canvasWidth;
      const y = pos.y * canvasHeight;
      
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [targetAreas, currentStep, handPositions, posePositions, canvasWidth, canvasHeight]);

  // Check for target hits
  useEffect(() => {
    const activeTargets = targetAreas.filter(target => 
      target.stepNumber === currentStep || target.isActive
    );
    
    handPositions.forEach(handPos => {
      activeTargets.forEach(target => {
        const { hit, accuracy } = checkTargetHit(handPos, target, canvasWidth, canvasHeight);
        
        if (hit && !hitTargets.has(target.id)) {
          setHitTargets(prev => new Set([...prev, target.id]));
          onTargetHit?.(target.id, accuracy);
          
          // Update step progress
          setStepProgress(prev => {
            const newProgress = new Map(prev);
            const currentProgress = newProgress.get(target.stepNumber) || 0;
            newProgress.set(target.stepNumber, Math.max(currentProgress, accuracy));
            return newProgress;
          });
          
          // Check if step is complete
          const stepTargets = activeTargets.filter(t => t.stepNumber === target.stepNumber);
          const stepHits = stepTargets.filter(t => hitTargets.has(t.id) || t.id === target.id);
          
          if (stepHits.length === stepTargets.length) {
            onStepComplete?.(target.stepNumber);
          }
        }
      });
    });
  }, [handPositions, targetAreas, currentStep, hitTargets, onTargetHit, onStepComplete, checkTargetHit, canvasWidth, canvasHeight]);

  // Initialize target areas when skill changes
  useEffect(() => {
    const areas = generateSkillTargetAreas(skill);
    setTargetAreas(areas);
    setHitTargets(new Set());
    setStepProgress(new Map());
  }, [skill, generateSkillTargetAreas]);

  // Update active targets when current step changes
  useEffect(() => {
    setTargetAreas(prev => prev.map(target => ({
      ...target,
      isActive: target.stepNumber === currentStep
    })));
  }, [currentStep]);

  // Redraw canvas when dependencies change
  useEffect(() => {
    drawTargetAreas();
  }, [drawTargetAreas]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ mixBlendMode: 'multiply' }}
      />
      
      {/* Progress indicator */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-2 rounded-lg">
        <div className="text-sm">
          Step {currentStep}: {stepProgress.get(currentStep) ? 
            `${Math.round((stepProgress.get(currentStep) || 0) * 100)}% Complete` : 
            'Waiting for target hit'
          }
        </div>
        <div className="text-xs mt-1">
          Targets Hit: {hitTargets.size} / {targetAreas.filter(t => t.stepNumber === currentStep).length}
        </div>
      </div>
    </div>
  );
}

export default SkillTargetAreas;
