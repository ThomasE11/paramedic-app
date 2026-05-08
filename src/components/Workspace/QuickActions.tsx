/**
 * Quick Actions Panel
 * 
 * Common interventions that can be applied quickly
 */

import { Zap, Pill, Phone, Syringe, Wind, HeartPulse, Ambulance } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  onClick?: () => void;
}

interface QuickActionsProps {
  onAction?: (actionId: string) => void;
}

const actions: QuickAction[] = [
  {
    id: 'defibrillate',
    label: 'Defibrillate',
    description: '200J biphasic',
    icon: <Zap className="w-4 h-4 text-red-500" />,
    color: 'bg-red-50',
    hoverColor: 'hover:bg-red-100',
  },
  {
    id: 'drug',
    label: 'Medication',
    description: 'Give protocol drug',
    icon: <Pill className="w-4 h-4 text-sky-500" />,
    color: 'bg-sky-50',
    hoverColor: 'hover:bg-sky-100',
  },
  {
    id: 'airway',
    label: 'Airway',
    description: 'O2, suction, adjuncts',
    icon: <Wind className="w-4 h-4 text-emerald-500" />,
    color: 'bg-emerald-50',
    hoverColor: 'hover:bg-emerald-100',
  },
  {
    id: 'iv',
    label: 'IV Access',
    description: 'Cannulation, fluids',
    icon: <Syringe className="w-4 h-4 text-amber-500" />,
    color: 'bg-amber-50',
    hoverColor: 'hover:bg-amber-100',
  },
  {
    id: 'cardiac',
    label: 'Monitor',
    description: '12-lead, pacing',
    icon: <HeartPulse className="w-4 h-4 text-rose-500" />,
    color: 'bg-rose-50',
    hoverColor: 'hover:bg-rose-100',
  },
  {
    id: 'transport',
    label: 'Transport',
    description: 'Load and go',
    icon: <Ambulance className="w-4 h-4 text-violet-500" />,
    color: 'bg-violet-50',
    hoverColor: 'hover:bg-violet-100',
  },
  {
    id: 'backup',
    label: 'Backup',
    description: 'ALS team, cath lab',
    icon: <Phone className="w-4 h-4 text-emerald-500" />,
    color: 'bg-emerald-50',
    hoverColor: 'hover:bg-emerald-100',
  },
];

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider">Quick Actions</h4>
        <span className="text-[10px] text-surface-400">Logged to timeline</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction?.(action.id)}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/80 border border-surface-200 hover:border-brand-300 hover:bg-brand-50/70 transition-all text-left group"
          >
            <div className={`w-7 h-7 rounded-lg ${action.color} flex items-center justify-center ${action.hoverColor} transition-colors flex-shrink-0`}>
              {action.icon}
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-surface-800">{action.label}</div>
              <div className="text-[10px] text-surface-400">{action.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;
