#!/bin/bash

# Ralph - Autonomous AI Agent Loop
# Runs until all PRD items are complete

set -e

MAX_ITERATIONS=${1:-10}
ITERATION=0
TOOL="${2:-amp}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Ralph - Autonomous AI Agent Loop${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Project: UAE Paramedic Case Generator"
echo "Tool: $TOOL"
echo "Max Iterations: $MAX_ITERATIONS"
echo ""

# Check prerequisites
if [ ! -f "prd.json" ]; then
    echo -e "${RED}Error: prd.json not found${NC}"
    echo "Please create a PRD first using the /prd skill"
    exit 1
fi

# Initialize progress tracking
if [ ! -f "progress.txt" ]; then
    echo "# Ralph Progress Log" > progress.txt
    echo "# Started: $(date)" >> progress.txt
    echo "" >> progress.txt
fi

# Check git status
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}Warning: Uncommitted changes detected${NC}"
    echo "Ralph will create a feature branch..."
    git checkout -b "feature/ralph-$(date +%Y%m%d-%H%M%S)"
    git add .
    git commit -m "WIP: Pre-ralph checkpoint"
fi

# Main loop
while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Iteration $ITERATION / $MAX_ITERATIONS${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    # Find highest priority incomplete story
    NEXT_STORY=$(jq -r '.userStories[] | select(.passes == false) | "\(.priority)|\(.id)|\(.title)"' prd.json | sort | head -1)
    
    if [ -z "$NEXT_STORY" ]; then
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}  ALL STORIES COMPLETE!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo "<promise>COMPLETE</promise>"
        exit 0
    fi
    
    PRIORITY=$(echo "$NEXT_STORY" | cut -d'|' -f1)
    STORY_ID=$(echo "$NEXT_STORY" | cut -d'|' -f2)
    STORY_TITLE=$(echo "$NEXT_STORY" | cut -d'|' -f3)
    
    echo -e "${YELLOW}Next Story: $STORY_ID${NC}"
    echo "Title: $STORY_TITLE"
    echo "Priority: $PRIORITY"
    echo ""
    
    # Get full story details
    STORY_JSON=$(jq ".userStories[] | select(.id == \"$STORY_ID\")" prd.json)
    
    # Create prompt for AI
    PROMPT="Implement user story: $STORY_TITLE (ID: $STORY_ID)

Story Details:
$(echo "$STORY_JSON" | jq -r '.description')

Acceptance Criteria:
$(echo "$STORY_JSON" | jq -r '.acceptanceCriteria | .[]' | sed 's/^/- /')

Context:
- Read AGENTS.md for project context
- Check progress.txt for previous learnings
- Review prd.json for full requirements
- Run quality checks after implementation
- Update prd.json to mark story as passes: true when complete
- Append learnings to progress.txt

Quality Checks Required:
- npm run build
- npm run lint  
- npx tsc --noEmit

DO NOT:
- Work on multiple stories at once
- Skip quality checks
- Leave the codebase broken

DO:
- Write clean, typed TypeScript code
- Follow existing patterns
- Add appropriate error handling
- Update documentation"

    # Run AI tool
    echo "Invoking $TOOL..."
    
    if [ "$TOOL" == "amp" ]; then
        # Amp CLI command
        echo "$PROMPT" | amp code
    elif [ "$TOOL" == "claude" ]; then
        # Claude Code command
        echo "$PROMPT" | claude
    else
        echo -e "${RED}Unknown tool: $TOOL${NC}"
        echo "Use: ./ralph.sh [iterations] [--tool amp|claude]"
        exit 1
    fi
    
    # Check if story was completed
    if jq -e ".userStories[] | select(.id == \"$STORY_ID\" and .passes == true)" prd.json > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Story $STORY_ID completed${NC}"
        echo "$(date): Completed $STORY_ID - $STORY_TITLE" >> progress.txt
    else
        echo -e "${YELLOW}⚠ Story $STORY_ID not marked complete${NC}"
        echo "$(date): Attempted $STORY_ID - needs retry" >> progress.txt
    fi
    
    echo ""
    
done

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Max iterations reached${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "Incomplete stories:"
jq -r '.userStories[] | select(.passes == false) | "\(.id): \(.title)"' prd.json
echo ""
echo "Run again with more iterations or review remaining stories."
exit 1
