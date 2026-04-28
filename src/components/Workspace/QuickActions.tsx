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
    label: 'Administer Drug',
    description: 'Aspirin, GTN, Morphine',
    icon: <Pill className="w-4 h-4 text-sky-500" />,
    color: 'bg-sky-50',
    hoverColor: 'hover:bg-sky-100',
  },
  {
    id: 'airway',
    label: 'Manage Airway',
    description: 'OPA, NPA, Suction',
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
    label: 'Cardiac Monitor',
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
    label: 'Call for Backup',
    description: 'ALS team, cath lab',
    icon: <Phone className="w-4 h-4 text-emerald-500" />,
    color: 'bg-emerald-50',
    hoverColor: 'hover:bg-emerald-100',
  },
];

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="glass rounded-xl p-4">
      <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Quick Actions</h4>
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction?.(action.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/60 border border-surface-200/60 hover:border-brand-300 hover:bg-brand-50/50 transition-all text-left group"
          >
            <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center ${action.hoverColor} transition-colors`}>
              {action.icon}
            </div>
            <div>
              <div className="text-sm font-medium text-surface-800">{action.label}</div>
              <div className="text-[10px] text-surface-400">{action.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;
