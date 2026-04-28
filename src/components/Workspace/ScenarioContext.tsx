/**
 * Scenario Context with Information Hierarchy
 * 
 * Premium design with glassmorphism, gradient accents,
 * and clear information hierarchy.
 */

import { AlertTriangle, MapPin, Clock, Thermometer, Activity } from 'lucide-react';

interface ScenarioContextProps {
  title: string;
  category: string;
  difficulty: string;
  patientAge: number;
  patientGender: string;
  location: string;
  description: string;
  criticalFindings: string[];
  tags: string[];
}

export function ScenarioContext({
  title,
  category,
  difficulty,
  patientAge,
  patientGender,
  location,
  description,
  criticalFindings,
  tags,
}: ScenarioContextProps) {
  return (
    <div className="glass-strong rounded-xl p-5 border border-white/60">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 border border-red-100">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Live Case</span>
            <span className="text-surface-300">·</span>
            <span className="text-xs text-surface-500">{category}</span>
            <span className="text-surface-300">·</span>
            <span className="text-xs text-surface-500">{difficulty}</span>
          </div>
          
          <h3 className="text-lg font-bold text-surface-900 mb-1">{title}</h3>
          <p className="text-xs text-surface-400 mb-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location} · {patientAge}-year-old {patientGender}
          </p>
          
          <p className="text-sm text-surface-600 leading-relaxed">{description}</p>
          
          <div className="flex gap-2 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-surface-100 text-surface-600 border border-surface-200"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Critical Findings */}
          {criticalFindings.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-red-50/50 border border-red-200/50">
              <div className="flex items-center gap-1.5 mb-2">
                <Activity className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-semibold text-red-700">Critical Findings</span>
              </div>
              <ul className="space-y-1">
                {criticalFindings.map((finding, i) => (
                  <li key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-red-400 mt-1 flex-shrink-0"></span>
                    {finding}
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

export default ScenarioContext;
