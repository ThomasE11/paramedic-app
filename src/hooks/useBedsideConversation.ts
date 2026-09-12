import { useCallback, useSyncExternalStore } from 'react';

// One shared interview is portalled into the scene; it is never duplicated,
// so changing care tabs cannot lose the transcript or double-count SAMPLE.
type Dock = { target: HTMLElement | null; active: boolean };
const empty: Dock = { target: null, active: false };
const docks = new Map<string, Dock>();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
function update(id: string, patch: Partial<Dock>) {
  const old = docks.get(id) ?? empty;
  const next = { ...old, ...patch };
  if (next.target === old.target && next.active === old.active) return;
  if (!next.target && !next.active) docks.delete(id);
  else docks.set(id, next);
  listeners.forEach(listener => listener());
}

export function useBedsideConversation(caseId: string) {
  // Pilot one scenario before extending this layout to other patient types.
  const enabled = caseId === 'resp-001';
  const snapshot = useCallback(() => enabled ? docks.get(caseId) ?? empty : empty, [caseId, enabled]);
  const dock = useSyncExternalStore(subscribe, snapshot, () => empty);
  const register = useCallback((target: HTMLElement | null) => {
    if (enabled) update(caseId, target ? { target } : { target: null, active: false });
  }, [caseId, enabled]);
  const setActive = useCallback((active: boolean) => {
    if (enabled) update(caseId, { active });
  }, [caseId, enabled]);
  return { ...dock, enabled, register, setActive };
}
