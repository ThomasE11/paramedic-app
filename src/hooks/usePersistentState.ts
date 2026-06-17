import { useState, useEffect, useRef, useCallback } from 'react';

const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB limit
const DEBOUNCE_MS = 300;

/**
 * Like useState, but persisted to localStorage with debounced writes.
 * Handles JSON parse errors, storage quota errors, and size limits.
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return defaultValue;
      return JSON.parse(stored) as T;
    } catch (e) {
      console.warn(`[usePersistentState] Failed to parse "${key}" from localStorage:`, e);
      return defaultValue;
    }
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValueRef = useRef(value);
  latestValueRef.current = value;

  // Debounced write to localStorage
  const writeToStorage = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      try {
        const serialized = JSON.stringify(latestValueRef.current);
        if (serialized.length > MAX_STORAGE_SIZE) {
          console.warn(
            `[usePersistentState] Value for "${key}" is ${serialized.length} bytes, ` +
            `exceeds ${MAX_STORAGE_SIZE} byte limit. Skipping persistence.`
          );
          return;
        }
        localStorage.setItem(key, serialized);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          console.warn(`[usePersistentState] Storage quota exceeded for "${key}".`);
        } else {
          console.error(`[usePersistentState] Failed to write "${key}":`, e);
        }
      }
    }, DEBOUNCE_MS);
  }, [key]);

  useEffect(() => {
    writeToStorage();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, writeToStorage]);

  /** Immediate write (flush) for critical data */
  const flush = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    try {
      localStorage.setItem(key, JSON.stringify(latestValueRef.current));
    } catch (e) {
      console.error(`[usePersistentState] Flush failed for "${key}":`, e);
    }
  }, [key]);

  // Expose flush via ref for imperative access
  (setValue as any)._flush = flush;

  return [value, setValue];
}

/** Remove a key from localStorage (for cleanup) */
export function removePersistedState(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`[usePersistentState] Failed to remove "${key}":`, e);
  }
}
