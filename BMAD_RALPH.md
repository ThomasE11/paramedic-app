# BMAD Method + Ralph Implementation

This codebase now uses the **BMAD Method** (Breakthrough Method for Agile AI Driven Development) combined with **Ralph** autonomous agent loops for continuous improvement.

## Quick Start

### Using BMAD Method

```bash
# Install BMAD Method globally
npx bmad-method install

# Or install locally in this project
npx bmad-method@latest install --directory . --modules bmm --yes
```

### Using Ralph Autonomous Loop

```bash
# Run Ralph with Amp (default)
./.ralph/ralph.sh 10

# Run Ralph with Claude Code
./.ralph/ralph.sh 10 --tool claude

# Run specific number of iterations
./.ralph/ralph.sh 5
```

## Project Structure

```
├── .bmad/                    # BMAD Method configuration
│   ├── agents/              # AI agent definitions
│   │   ├── medical-director.md
│   │   └── scenario-architect.md
│   ├── workflows/           # Development workflows
│   │   ├── case-creation.md
│   │   └── vital-simulation.md
│   └── project.json         # Project metadata
│
├── .ralph/                  # Ralph autonomous loop
│   ├── ralph.sh            # Main loop script
│   ├── prompt.md           # Prompt template
│   └── CLAUDE.md           # Claude Code specific
│
├── skills/                  # Reusable skills
│   ├── prd/                # PRD generation skill
│   └── ralph/              # Ralph format skill
│
├── prd.json                # Product Requirements (task list)
├── progress.txt            # Learning log
└── AGENTS.md               # Project context for AI
```

## How It Works

### 1. Product Requirements Document (PRD)

The `prd.json` file contains all user stories with:
- **ID**: Unique identifier
- **Title**: What to implement
- **Description**: Details
- **Acceptance Criteria**: Definition of done
- **Priority**: critical, high, medium, low
- **passes**: Boolean (Ralph updates this)

### 2. Ralph Autonomous Loop

Ralph runs iteratively:

1. **Read State**: Check `prd.json` for incomplete stories
2. **Select Story**: Pick highest priority incomplete story
3. **Spawn AI**: Fresh AI instance with clean context
4. **Implement**: AI implements just that story
5. **Quality Check**: Run build, lint, typecheck
6. **Update**: Mark story as complete in `prd.json`
7. **Learn**: Append learnings to `progress.txt`
8. **Commit**: Save changes to git
9. **Repeat**: Until all stories done

### 3. BMAD Agents

Specialized AI agents for different domains:

- **Medical Director**: Ensures clinical accuracy
- **Scenario Architect**: Designs case scenarios
- **Vital Systems Engineer**: Implements physiological simulation
- **Assessment Designer**: Creates evaluation rubrics
- **UX Pedagogist**: Optimizes learning experience
- **Clinical Reviewer**: Validates against standards

### 4. Context Persistence

Memory between iterations:
- **Git History**: All code changes tracked
- **progress.txt**: Learnings and discoveries
- **prd.json**: Current task status
- **AGENTS.md**: Project conventions

## Workflows

### Creating New Cases

```bash
# Use BMAD case creation workflow
/bmad-run workflow case-creation

# Or manually
1. Define medical scenario
2. Set vital signs trajectory
3. Create assessment checklist
4. Add visual resources
5. Clinical review
6. Add to database
```

### Implementing Features

```bash
# Ralph handles this automatically
./.ralph/ralph.sh 10

# Or manual process
1. Read prd.json
2. Pick highest priority story
3. Implement
4. Run quality checks
5. Update prd.json
6. Document in progress.txt
```

### Code Review

```bash
# BMAD agent review
/medical-review <case-id>
/validate-treatment <treatment-name>

# Or standard review
npm run build
npm run lint
npx tsc --noEmit
```

## Quality Gates

Every iteration must pass:

1. ✅ **Build**: `npm run build` succeeds
2. ✅ **Type Check**: `npx tsc --noEmit` passes
3. ✅ **Lint**: `npm run lint` passes
4. ✅ **Functionality**: Feature works as described
5. ✅ **Documentation**: AGENTS.md updated if needed

## Current Status

### Completed ✅
- [x] Assessment mode (show/hide vitals)
- [x] Treatment system (43 treatments)
- [x] Alarm system (audio + visual)
- [x] Management pathways (37 cases)
- [x] Student checklists (8-12 items)
- [x] Visual resources (images + videos)

### In Progress 🔄
- [ ] Time-based deterioration
- [ ] Equipment management
- [ ] Procedure time tracking
- [ ] Environmental factors

### Planned 📋
- [ ] Mass casualty mode
- [ ] Complication scenarios
- [ ] Cultural dynamics
- [ ] Transport decisions

## Commands

### BMAD Commands
```bash
/bmad-help                    # Get help
/bmad-status                  # Check project status
/bmad-run workflow <name>    # Run specific workflow
/bmad-agent <name>           # Use specific agent
```

### Ralph Commands
```bash
./.ralph/ralph.sh [iterations] [--tool amp|claude]
```

### Development
```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # ESLint check
npx tsc --noEmit  # Type check
```

## Contributing

1. **Pick a Story**: Check `prd.json` for incomplete items
2. **Implement**: Follow acceptance criteria
3. **Test**: Run all quality gates
4. **Document**: Update `progress.txt` with learnings
5. **Commit**: Clear, descriptive messages

## Documentation

- **AGENTS.md**: Project context and conventions
- **progress.txt**: Learning log
- **prd.json**: Task list
- **.bmad/**: Agent and workflow definitions
- **.ralph/**: Autonomous loop configuration

## References

- [BMAD Method Docs](http://docs.bmad-method.org)
- [Ralph Pattern](https://ghuntley.com/ralph/)
- [Original Ralph Repo](https://github.com/snarktank/ralph)

## License

MIT - See LICENSE file

---

**Status**: BMAD Method v6 + Ralph v1 implemented
**Last Updated**: 2026-02-24
**Iterations**: 0
**Stories Complete**: 0/12
