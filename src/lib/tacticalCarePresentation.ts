export function tacticalCareHeadline({
  pendingCount,
  completedCount,
  activeCount,
}: {
  pendingCount: number;
  completedCount: number;
  activeCount: number;
}): string {
  if (pendingCount > 0) return `${pendingCount} reassessment pending`;
  if (completedCount > 0) return `${completedCount} response confirmed`;
  if (activeCount > 0) return `${activeCount} active ${activeCount === 1 ? 'intervention' : 'interventions'}`;
  return 'No interventions applied yet';
}
