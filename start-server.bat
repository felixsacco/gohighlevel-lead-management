@echo off
setlocal enableextensions enabledelayedexpansion

set PORT=3000
echo Starting Next.js development server on port %PORT% ...
echo.
echo When the server starts, visit: http://localhost:%PORT%
echo.

REM Install dependencies once if not present
if not exist node_modules (
  echo node_modules not found. Installing dependencies (npm ci)...
  call npm ci
  if errorlevel 1 (
    echo Failed to install dependencies. Please check the error above.
    pause
    exit /b 1
  )
)

echo Launching Next.js (this window will show logs)...
npx next dev -p %PORT%
echo.
echo Next.js process exited with code %errorlevel%.
echo If the window closed unexpectedly, run this script from PowerShell to see full logs.
pause
endlocal
