@echo off
echo ========================================
echo ORBIT LIVE - Git Push to GitHub
echo ========================================
echo.

cd /d "D:\DUVOX LABS\SOFTWARES\TEAM MANAGEMENT SOFTWARE\TRACK BOSS AI\ORBIT LIVE AI TEAM MANAGEMENT (PUBLIC)\project"

echo [1/7] Setting Git configuration...
git config user.email "orbit@example.com"
git config user.name "Orbit Live Team"
echo Done!
echo.

echo [2/7] Checking current status...
git status
echo.

echo [3/7] Adding all changes...
git add .
echo Done!
echo.

echo [4/7] Committing changes...
git commit -m "Clean UI Update: ElevenLabs-inspired minimalist Dashboard, removed Watch Demo button, all errors fixed"
echo Done!
echo.

echo [5/7] Setting branch to main...
git branch -M main
echo Done!
echo.

echo [6/7] Adding remote (if needed)...
git remote remove origin 2>nul
git remote add origin https://github.com/salarkhan2003/Public_ORBIT-LIVE-TEAM-MANAGEMENT-SOFTWARE.git
echo Done!
echo.

echo [7/7] Pushing to GitHub...
git push -u origin main --force
echo.

echo ========================================
echo Push Complete!
echo ========================================
git remote -v
echo.
pause

