@echo off
setlocal
echo ========================================================
echo   Launching EventPilot AI (Ollama gemma:2b + Docker)
echo ========================================================

echo [1/3] Ensuring Gemma 2B is pulled in Ollama...
ollama pull gemma:2b

echo [2/3] Starting Docker container...
docker compose up -d

echo [3/3] Opening application in your default browser...
start http://localhost:3001

echo ========================================================
echo   EventPilot AI is live at http://localhost:3001
echo ========================================================
