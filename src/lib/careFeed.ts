export interface CareFeedIdentity {
  id: string;
  label: string;
  detail: string;
}

function normaliseCareFeedText(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-GB');
}

/**
 * Keep the first clinical message when different visual/assessment sources
 * describe the same finding. IDs identify producers, not what the student
 * actually sees, so they cannot prevent repeated cards on their own.
 */
export function deduplicateCareFeedItems<T extends CareFeedIdentity>(items: T[]): T[] {
  const seenContent = new Set<string>();

  return items.filter(item => {
    const fingerprint = `${normaliseCareFeedText(item.label)}\u0000${normaliseCareFeedText(item.detail)}`;
    if (seenContent.has(fingerprint)) return false;
    seenContent.add(fingerprint);
    return true;
  });
}
