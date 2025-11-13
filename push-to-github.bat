@echo off
cd /d "D:\DUVOX LABS\SOFTWARES\TEAM MANAGEMENT SOFTWARE\TRACK BOSS AI\ORBIT LIVE AI TEAM MANAGEMENT (PUBLIC)\project"

echo Initializing Git repository...
git init

echo Adding all files...
git add .

echo Creating initial commit...
git commit -m "Clean UI Update: Simplified Dashboard with ElevenLabs-inspired minimalist design, removed Watch Demo button, fixed all errors"

echo Adding remote repository...
git remote add origin https://github.com/salarkhan2003/Public_ORBIT-LIVE-TEAM-MANAGEMENT-SOFTWARE.git

echo Setting branch to main...
git branch -M main

echo Pushing to GitHub...
git push -u origin main --force

echo.
echo Done! Check status:
git remote -v
git status

pause

