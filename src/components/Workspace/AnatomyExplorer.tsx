/**
 * Interactive 3D Anatomy Explorer
 * 
 * Features:
 * - Hoverable body regions
 * - Auscultation sounds (heart, lung, bowel)
 * - Visual feedback for active pathology
 * - Mobile responsive
 */

import { useState, useCallback } from 'react';
import { RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react';

interface BodyRegion {
  id: string;
  name: string;
  path: string;
  labelX: number;
  labelY: number;
  sound?: string;
  soundDescription?: string;
  isActive?: boolean;
  isPathology?: boolean;
}

const BODY_REGIONS: BodyRegion[] = [
  {
    id: 'head',
    name: 'Head',
    path: 'M100,35 m-28,0 a28,32 0 1,0 56,0 a28,32 0 1,0 -56,0',
    labelX: 140,
    labelY: 30,
    soundDescription: 'Normal - No sounds',
  },
  {
    id: 'chest',
    name: 'Chest',
    path: 'M60,85 Q100,75 140,85 L145,140 Q100,155 55,140 Z',
    labelX: 150,
    labelY: 110,
    sound: 'https://www.youtube.com/embed/8sRlMp8y5w8', // Heart sounds placeholder
    soundDescription: 'S1, S2 - Normal heart sounds',
    isPathology: true,
  },
  {
    id: 'lungs',
    name: 'Lungs',
    path: 'M55,88 Q75,82 95,88 L95,138 Q75,142 55,138 Z M105,88 Q125,82 145,88 L145,138 Q125,142 105,138 Z',
    labelX: 155,
    labelY: 100,
    soundDescription: 'Clear bilateral air entry',
  },
  {
    id: 'abdomen',
    name: 'Abdomen',
    path: 'M55,145 Q100,140 145,145 L140,200 Q100,210 60,200 Z',
    labelX: 150,
    labelY: 170,
    soundDescription: 'Normal bowel sounds',
  },
  {
    id: 'left-arm',
    name: 'Left Arm',
    path: 'M55,90 L25,130 L20,180',
    labelX: 10,
    labelY: 140,
    soundDescription: 'Peripheral pulses present',
  },
  {
    id: 'right-arm',
    name: 'Right Arm',
    path: 'M145,90 L175,130 L185,170',
    labelX: 190,
    labelY: 140,
    isPathology: true,
    soundDescription: 'Pain radiation - check pulse',
  },
  {
    id: 'left-leg',
    name: 'Left Leg',
    path: 'M75,205 L70,260 L68,310',
    labelX: 40,
    labelY: 250,
    soundDescription: 'Peripheral pulses present',
  },
  {
    id: 'right-leg',
    name: 'Right Leg',
    path: 'M125,205 L130,260 L132,310',
    labelX: 160,
    labelY: 250,
    soundDescription: 'Peripheral pulses present',
  },
];

interface AnatomyExplorerProps {
  activeRegions?: string[];
  onRegionSelect?: (region: string) => void;
}

export function AnatomyExplorer({ activeRegions = [], onRegionSelect }: AnatomyExplorerProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [muted, setMuted] = useState(true);

  const handleRegionClick = useCallback((regionId: string) => {
    setSelectedRegion(regionId);
    onRegionSelect?.(regionId);
  }, [onRegionSelect]);

  const region = BODY_REGIONS.find(r => r.id === selectedRegion);

  return (
    <div className="glass-strong rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
        <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Anatomy Explorer</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRotation(r => r - 15)}
            className="p-1 rounded hover:bg-black/5 text-surface-400 hover:text-surface-600 transition-colors"
            title="Rotate left"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <button
            onClick={() => setRotation(0)}
            className="p-1 rounded hover:bg-black/5 text-surface-400 hover:text-surface-600 transition-colors text-[9px]"
            title="Reset"
          >
            Reset
          </button>
          <button
            onClick={() => setRotation(r => r + 15)}
            className="p-1 rounded hover:bg-black/5 text-surface-400 hover:text-surface-600 transition-colors"
            title="Rotate right"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-b from-surface-50 to-white">
        <div className="anatomy-container">
          <div 
            className="anatomy-body"
            style={{ transform: `rotateY(${rotation}deg)` }}
          >
            <svg viewBox="0 0 200 320" className="w-full h-auto drop-shadow-xl">
              <defs>
                <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e5e7eb"/>
                  <stop offset="100%" stopColor="#d1d5db"/>
                </linearGradient>
                <linearGradient id="highlightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c4b5fd"/>
                  <stop offset="100%" stopColor="#a78bfa"/>
                </linearGradient>
                <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f87171"/>
                  <stop offset="100%" stopColor="#ef4444"/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {BODY_REGIONS.map((r) => {
                const isHovered = hoveredRegion === r.id;
                const isSelected = selectedRegion === r.id;
                const isActive = activeRegions.includes(r.id) || r.isPathology;
                const fill = isActive ? 'url(#activeGrad)' : isHovered ? 'url(#highlightGrad)' : 'url(#bodyGrad)';
                const stroke = isActive ? '#dc2626' : isHovered ? '#8b5cf6' : '#9ca3af';
                const strokeWidth = isActive || isHovered ? 2 : 1;

                return (
                  <g key={r.id}>
                    <path
                      d={r.path}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      filter={isActive ? 'url(#glow)' : undefined}
                      className="body-part cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredRegion(r.id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      onClick={() => handleRegionClick(r.id)}
                    />
                    {(isHovered || isSelected) && (
                      <g>
                        <rect
                          x={r.labelX - 5}
                          y={r.labelY - 12}
                          width={r.name.length * 7 + 10}
                          height={20}
                          rx={4}
                          fill="rgba(23,23,23,0.9)"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <text
                          x={r.labelX + r.name.length * 3.5}
                          y={r.labelY}
                          textAnchor="middle"
                          fill="white"
                          fontSize="9"
                          fontWeight="600"
                        >
                          {r.name}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Heart icon for cardiac cases */}
              <g transform="translate(88, 105)">
                <path
                  d="M12,21.35l-1.45-1.32C5.4,15.36 2,12.28 2,8.5 2,5.42 4.42,3 7.5,3c1.74,0 3.41,0.81 4.5,2.09C13.09,3.81 14.76,3 16.5,3 19.58,3 22,5.42 22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z"
                  fill="#ef4444"
                  stroke="#dc2626"
                  strokeWidth="1"
                  transform="scale(0.8)"
                >
                  <animate
                    attributeName="transform"
                    type="scale"
                    values="0.8;0.85;0.8"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            </svg>
          </div>
        </div>

        {/* Region Details */}
        {region && (
          <div className="mt-4 p-3 rounded-lg bg-surface-50 border border-surface-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-surface-800">{region.name}</span>
              <button
                onClick={() => setMuted(!muted)}
                className="p-1 rounded hover:bg-black/5 text-surface-400 hover:text-surface-600"
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-surface-600">{region.soundDescription}</p>
            {region.isPathology && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span className="text-[10px] font-medium text-red-600">Pathology detected</span>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-50 border border-red-200">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <span className="text-[10px] font-medium text-red-700">Active Pathology</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-50 border border-surface-200">
            <div className="w-2 h-2 rounded-full bg-surface-300"></div>
            <span className="text-[10px] font-medium text-surface-600">Normal</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-violet-50 border border-violet-200">
            <div className="w-2 h-2 rounded-full bg-violet-400"></div>
            <span className="text-[10px] font-medium text-violet-700">Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnatomyExplorer;
