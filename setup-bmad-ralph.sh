#!/bin/bash

# Setup script for BMAD + Ralph

echo "Setting up UAE Paramedic Case Generator with BMAD + Ralph..."

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ git not found. Please install git"
    exit 1
fi

echo "✅ Prerequisites met"

# Install dependencies
echo "Installing dependencies..."
npm install

# Make scripts executable
echo "Setting up scripts..."
chmod +x .ralph/ralph.sh

# Check git
echo "Checking git repository..."
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: BMAD + Ralph setup"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Review prd.json for user stories"
echo "2. Run Ralph: ./.ralph/ralph.sh 10"
echo "3. Or start dev server: npm run dev"
echo ""
echo "Documentation:"
echo "- BMAD_RALPH.md - Overview and usage"
echo "- AGENTS.md - Project conventions"
echo "- progress.txt - Learning log"
echo "- prd.json - Task list"
