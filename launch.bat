@echo off
setlocal enabledelayedexpansion

:: Navigate to script directory so it can be run from desktop shortcuts or any folder
cd /d "%~dp0"

echo ========================================================
echo   Launching EventPilot AI (Ollama gemma:2b + Docker)
echo ========================================================

:: Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop and run this script again.
    echo.
    pause
    exit /b 1
)

echo [1/3] Ensuring Gemma 2B is pulled in Ollama...
ollama pull gemma:2b

echo [2/3] Building and starting Docker container with latest fixes...
docker compose up -d --build

echo [3/3] Opening application in your default browser...
start http://localhost:3001

echo ========================================================
echo   EventPilot AI is live at http://localhost:3001
echo ========================================================
