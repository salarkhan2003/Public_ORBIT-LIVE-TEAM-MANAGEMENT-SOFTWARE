# PowerShell script to push to GitHub
Set-Location "D:\DUVOX LABS\SOFTWARES\TEAM MANAGEMENT SOFTWARE\TRACK BOSS AI\ORBIT LIVE AI TEAM MANAGEMENT (PUBLIC)\project"

Write-Host "Setting up Git configuration..." -ForegroundColor Cyan
git config --global user.email "orbit@example.com"
git config --global user.name "Orbit Live Team"

Write-Host "Checking Git status..." -ForegroundColor Cyan
git status

Write-Host "Adding all changes..." -ForegroundColor Cyan
git add .

Write-Host "Committing changes..." -ForegroundColor Cyan
git commit -m "Clean UI Update: Simplified Dashboard with ElevenLabs-inspired minimalist design, removed Watch Demo button"

Write-Host "Checking remotes..." -ForegroundColor Cyan
$remotes = git remote -v

if ($remotes -match "origin") {
    Write-Host "Remote 'origin' already exists" -ForegroundColor Yellow
} else {
    Write-Host "Adding remote repository..." -ForegroundColor Cyan
    git remote add origin https://github.com/salarkhan2003/Public_ORBIT-LIVE-TEAM-MANAGEMENT-SOFTWARE.git
}

Write-Host "Setting branch to main..." -ForegroundColor Cyan
git branch -M main

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main --force

Write-Host "Done! Repository pushed successfully." -ForegroundColor Green
git remote -v

