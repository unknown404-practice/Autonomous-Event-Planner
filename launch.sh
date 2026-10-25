#!/bin/sh
set -e

echo "========================================================"
echo "  Launching EventPilot AI (Ollama gemma:2b + Docker)"
echo "========================================================"

echo "[1/3] Ensuring Gemma 2B is pulled in Ollama..."
ollama pull gemma:2b

echo "[2/3] Starting Docker container..."
docker compose up -d

echo "[3/3] Opening application in your default browser..."
if which xdg-open > /dev/null; then
  xdg-open http://localhost:3001
elif which open > /dev/null; then
  open http://localhost:3001
else
  echo "Open http://localhost:3001 in your browser"
fi

echo "========================================================"
echo "  EventPilot AI is live at http://localhost:3001"
echo "========================================================"
