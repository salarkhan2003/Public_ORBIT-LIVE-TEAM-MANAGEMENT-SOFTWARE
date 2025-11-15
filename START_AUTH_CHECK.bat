@echo off
REM Authentication Setup Verification Script
REM This script helps verify your authentication is properly configured

echo.
echo ========================================
echo  ORBIT LIVE TEAM - Auth Setup Check
echo ========================================
echo.

REM Check if .env file exists
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo Please create a .env file with your Supabase credentials.
    echo.
    echo Required variables:
    echo   VITE_SUPABASE_URL=your_supabase_url
    echo   VITE_SUPABASE_ANON_KEY=your_anon_key
    echo.
    pause
    exit /b 1
)

echo [OK] .env file found
echo.

REM Check if SQL fix file exists
if not exist "supabase\FIX_AUTH_COMPLETE.sql" (
    echo [WARNING] SQL fix file not found!
    echo The file should be at: supabase\FIX_AUTH_COMPLETE.sql
    echo.
) else (
    echo [OK] SQL fix file found
    echo.
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo [WARNING] node_modules not found!
    echo Installing dependencies...
    echo.
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
    echo.
) else (
    echo [OK] Dependencies installed
    echo.
)

echo ========================================
echo  Setup Checklist
echo ========================================
echo.
echo Please complete these steps:
echo.
echo [ ] 1. Run supabase\FIX_AUTH_COMPLETE.sql in Supabase SQL Editor
echo [ ] 2. Configure Site URL in Supabase Dashboard
echo [ ] 3. Add redirect URLs in Supabase Dashboard
echo [ ] 4. Setup Google OAuth credentials
echo [ ] 5. Configure email settings (SMTP or built-in)
echo.
echo For detailed instructions, read: AUTH_SETUP_GUIDE.md
echo.
echo ========================================
echo  Starting Development Server
echo ========================================
echo.

REM Start the dev server
echo Starting Vite dev server...
echo The app will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

