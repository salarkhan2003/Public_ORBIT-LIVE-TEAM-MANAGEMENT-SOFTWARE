@echo off
echo ========================================
echo RESTARTING ORBIT LIVE TEAM DEV SERVER
echo ========================================
echo.

echo Step 1: Killing old dev server...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo Step 2: Starting fresh dev server...
cd /d "%~dp0"
start cmd /k "npm run dev"

echo.
echo ========================================
echo NEXT STEPS FOR YOU:
echo ========================================
echo 1. Wait 10 seconds for server to start
echo 2. Open browser
echo 3. Press Ctrl+Shift+Delete
echo 4. Clear ALL browsing data
echo 5. Go to localhost:5173/team
echo 6. Team page should show IMMEDIATELY
echo ========================================
echo.
pause

