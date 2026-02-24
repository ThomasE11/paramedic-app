# AGENTS.md - UAE Paramedic Case Generator

## Project Overview

Medical training application for paramedic students with realistic case simulation, vital sign monitoring, and interactive treatments.

## Architecture Decisions

### Component Structure
- **VitalSignsMonitor**: Sidebar monitor with assessment mode
- **CaseDisplay**: Main case view with tabs
- **AssessmentPanel**: Student checklist tracking
- **ManagementView**: Clinical management pathways

### State Management
- React hooks (useState, useEffect, useCallback)
- Local component state for UI
- URL params for case selection
- No global state manager needed (keep it simple)

### TypeScript Patterns
- All vitals use the `VitalSigns` type from `@/types`
- BP stored as string "systolic/diastolic" 
- Parse using: `const [sys, dia] = bp.split('/').map(Number)`
- Always handle undefined gracefully: `vital ?? defaultValue`

## Code Patterns

### Assessment Mode Pattern
```typescript
const [visibleVitals, setVisibleVitals] = useState<Set<string>>(new Set());
// Vitals only show after explicit assessment
// Assessment takes realistic time based on method
```

### Treatment Effect Pattern
```typescript
// Gradual change over time, not instant
const progress = calculateTreatmentProgress(app, now);
const result = applyTreatmentEffectGradual(treatment, vitals, progress);
```

### Alarm Pattern
```typescript
// Check thresholds
const pulseAlarm = checkAlarm(pulse, ALARM_THRESHOLDS.pulse);
if (pulseAlarm.isCritical) {
  // Trigger critical alarm UI + sound
}
```

## Gotchas

### Type Issues
- `pulse` comes as string from backend, parse with `parseInt()`
- `bp` is string "120/80", not object
- `gcs` and `temperature` can be undefined
- Always convert before math operations

### Audio Context
- Must initialize on user interaction (click)
- Browser blocks auto-play otherwise
- Use `audioContext.resume()` after user gesture

### Build Warnings
- Chunk size warning is acceptable (1MB+)
- Not worth splitting for this app size
- Focus on functionality over optimization

### Treatment System
- 43 treatments defined in `enhancedTreatmentEffects.ts`
- Each has onset time (immediate to delayed)
- Effects are cumulative (multiple treatments stack)
- Progress shown as percentage

### Equipment System
- 30+ equipment items in `equipmentSystem.ts`
- Not yet integrated into UI (orphaned but ready)
- Each equipment can malfunction (random chance)
- Battery drains during use

## File Organization

### Active Systems (Integrated)
- `treatmentEffects.ts` - Treatment logic
- `enhancedTreatmentEffects.ts` - 43 treatments
- `cases.ts` - Case database
- `VitalSignsMonitor.tsx` - Sidebar with assessment

### Orphaned Systems (Ready to Integrate)
- `deteriorationSystem.ts` - Time-based vital decay
- `procedureSystem.ts` - Realistic procedure durations
- `equipmentSystem.ts` - Equipment management
- `massCasualtySystem.ts` - Multi-patient scenarios
- `environmentalSystem.ts` - Weather/altitude effects
- `complicationSystem.ts` - Random complications
- `familyTransportSystem.ts` - Cultural protocols

## Testing Strategy

- Build must pass: `npm run build`
- Type check: `npx tsc --noEmit`
- Lint: `npm run lint`
- Manual test: Generate case, apply treatments, check vitals change

## Common Tasks

### Adding a New Treatment
1. Add to `TREATMENTS` array in `enhancedTreatmentEffects.ts`
2. Define effects with onset time
3. It automatically appears in UI

### Adding a New Case
1. Create case object with all fields
2. Add to `allCases` array in `cases.ts`
3. Include managementPathway for Management tab

### Modifying Vital Display
1. Edit `VITAL_CONFIGS` in `VitalSignsMonitor.tsx`
2. Update assessment methods if needed
3. Adjust thresholds in `ALARM_THRESHOLDS`

## Performance Notes

- 1832 modules in production build
- ~2 second build time
- Main bundle 1MB (acceptable for this app)
- Lazy loading already implemented for heavy components

## Dependencies

- React 18+
- TypeScript 5+
- Vite (build tool)
- Tailwind CSS (styling)
- shadcn/ui (components)
- Lucide React (icons)
- Sonner (toasts)

## Environment

- Node.js 20+
- npm/pnpm
- Works on macOS, Linux, Windows (WSL)

## Deployment

- Static site (Vite builds to `dist/`)
- Can deploy to Vercel, Netlify, GitHub Pages
- No server required (all data in JSON files)

## References

- ILCOR Guidelines: https://www.ilcor.org
- AHA ACLS: https://cpr.heart.org
- Dubai Health Authority EMS protocols

## Contributors

BMAD Method + Ralph implementation in progress.
