#!/bin/sh
set -e

# Navigate to script directory
cd "$(dirname "$0")"

echo "========================================================"
echo "  Launching EventPilot AI (Ollama gemma:2b + Docker)"
echo "========================================================"

if ! docker info > /dev/null 2>&1; then
  echo "[ERROR] Docker is not running. Please start Docker and run this script again."
  exit 1
fi

echo "[1/3] Ensuring Gemma 2B is pulled in Ollama..."
ollama pull gemma:2b

echo "[2/3] Building and starting Docker container with latest fixes..."
docker compose up -d --build

echo "[3/3] Opening application in your default browser..."
if which xdg-open > /dev/null 2>&1; then
  xdg-open http://localhost:3001
elif which open > /dev/null 2>&1; then
  open http://localhost:3001
else
  echo "Open http://localhost:3001 in your browser"
fi

echo "========================================================"
echo "  EventPilot AI is live at http://localhost:3001"
echo "========================================================"
