export function pickRandomFromPool<T extends { id: string }>(
  pool: readonly T[],
  options?: { excludeId?: string | null },
): T | null {
  if (pool.length === 0) return null;
  const excludeId = options?.excludeId;
  const choices = excludeId && pool.length > 1
    ? pool.filter(item => item.id !== excludeId)
    : pool;
  return choices[Math.floor(Math.random() * choices.length)] ?? null;
}

/** When a presentation chip is chosen, align the skill-focus "goals" with it. */
export const skillFocusForCategory: Record<string, 'assessment' | 'airway' | 'breathing' | 'circulation' | 'medication' | 'trauma'> = {
  trauma: 'trauma',
  burns: 'trauma',
  'elderly-fall': 'trauma',
  cardiac: 'circulation',
  'cardiac-ecg': 'circulation',
  respiratory: 'breathing',
  toxicology: 'medication',
  metabolic: 'medication',
  neurological: 'assessment',
};
