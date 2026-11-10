@echo off
rem Starts the DJ Run 2027 site locally and opens it in your browser.
rem Close this window (or press Ctrl+C) to stop it.

cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Get it from https://nodejs.org and try again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies, this only happens the first time...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo Starting DJ Run 2027 at http://localhost:5173/
call npm run dev -- --open
pause
