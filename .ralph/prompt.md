# Ralph Prompt - Amp/Claude Code Template

## Project: UAE Paramedic Case Generator

You are working on a medical training application for paramedic students. This is a React + TypeScript application that generates realistic case scenarios with vital sign simulation.

## Critical Rules

1. **Single Story Focus**: Only implement ONE user story at a time. Do not start multiple stories.

2. **Quality Gates**: After EVERY change, you MUST run:
   ```bash
   npm run build
   npm run lint
   npx tsc --noEmit
   ```
   If any fail, fix them before continuing.

3. **TypeScript Strict**: No `any` types. All functions must have return types. All props must be typed.

4. **Test Changes**: If you're working on UI, verify it renders correctly.

5. **Update prd.json**: When a story is complete, change `"passes": false` to `"passes": true`.

6. **Document Learnings**: Append to `progress.txt`:
   - Patterns discovered
   - Gotchas encountered
   - Decisions made

## Project Structure

```
src/
├── components/          # React components
│   ├── VitalSignsMonitor.tsx
│   ├── CaseDisplay.tsx
│   └── ...
├── data/               # Data files
│   ├── cases.ts        # Case database
│   ├── deteriorationSystem.ts
│   ├── procedureSystem.ts
│   ├── equipmentSystem.ts
│   └── ...
├── types/              # TypeScript types
└── App.tsx            # Main app
```

## Code Style

- Use functional components with hooks
- Prefer `const` over `let`
- Use destructuring for props
- Async/await over callbacks
- Descriptive variable names

## Medical Domain Context

- UAE/Dubai EMS protocols
- ILCOR/AHA guidelines for CPR
- Standard paramedic scope of practice
- Vital signs: BP, HR, RR, SpO2, GCS, Temp
- Common medications: Adrenaline, Atropine, Morphine, etc.

## Before Starting

1. Read `progress.txt` to understand previous work
2. Read the specific story in `prd.json`
3. Check if there are existing patterns to follow
4. Identify which files need modification

## Implementation Steps

1. Read relevant files
2. Make minimal changes to implement the story
3. Run quality checks
4. Test functionality
5. Update prd.json
6. Document learnings
7. Commit changes

## Common Gotchas

- VitalSigns type has many optional fields - handle undefined gracefully
- BP is stored as string "120/80" - use parseBP utility
- Treatment effects use gradual progression - don't change instantly
- Assessment mode hides vitals until explicitly checked
- Audio context requires user interaction first

## Git Workflow

```bash
# Make changes
# Test
# Update prd.json
# Update progress.txt
git add .
git commit -m "Implement US-XXX: Brief description"
```

## Success Criteria

A story is complete when:
- All acceptance criteria met
- Quality checks pass
- Code is clean and typed
- prd.json updated
- Changes committed

<promise> When you finish, output this tag so Ralph knows to continue. </promise>
