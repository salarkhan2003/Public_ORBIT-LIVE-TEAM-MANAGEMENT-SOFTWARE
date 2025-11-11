$ErrorActionPreference = "Continue"
$projectPath = "D:\DUVOX LABS\SOFTWARES\TEAM MANAGEMENT SOFTWARE\TRACK BOSS AI\ORBIT LIVE AI TEAM MANAGEMENT (PUBLIC)\project"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PUSHING TO GITHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project
Set-Location $projectPath
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Initialize Git
Write-Host "Step 1: Initializing Git repository..." -ForegroundColor Green
git init
Write-Host ""

# Configure Git (if not configured)
Write-Host "Step 2: Configuring Git..." -ForegroundColor Green
$gitUser = git config user.name
if ([string]::IsNullOrWhiteSpace($gitUser)) {
    git config user.name "Salar Khan"
    Write-Host "Set user.name to: Salar Khan" -ForegroundColor Yellow
}
$gitEmail = git config user.email
if ([string]::IsNullOrWhiteSpace($gitEmail)) {
    git config user.email "salarkhan2003@example.com"
    Write-Host "Set user.email to: salarkhan2003@example.com" -ForegroundColor Yellow
}
Write-Host ""

# Add all files
Write-Host "Step 3: Adding all files..." -ForegroundColor Green
git add .
Write-Host "Files added successfully!" -ForegroundColor Yellow
Write-Host ""

# Create commit
Write-Host "Step 4: Creating commit..." -ForegroundColor Green
git commit -m "Initial commit: ORBIT LIVE AI Team Management Software with Documents feature fixes"
Write-Host ""

# Check if remote exists and remove it
Write-Host "Step 5: Setting up remote repository..." -ForegroundColor Green
$remoteExists = git remote get-url origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Removing existing remote..." -ForegroundColor Yellow
    git remote remove origin
}
git remote add origin https://github.com/salarkhan2003/Public_ORBIT-LIVE-TEAM-MANAGEMENT-SOFTWARE.git
Write-Host "Remote added successfully!" -ForegroundColor Yellow
Write-Host ""

# Set branch to main
Write-Host "Step 6: Setting branch to main..." -ForegroundColor Green
git branch -M main
Write-Host ""

# Push to GitHub
Write-Host "Step 7: Pushing to GitHub..." -ForegroundColor Green
Write-Host "You may be prompted for GitHub credentials..." -ForegroundColor Yellow
Write-Host ""
git push -u origin main --force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Show remote
Write-Host "Remote repository:" -ForegroundColor Green
git remote -v
Write-Host ""

# Show last commit
Write-Host "Last commit:" -ForegroundColor Green
git log --oneline -1
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DONE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check your repository at:" -ForegroundColor Yellow
Write-Host "https://github.com/salarkhan2003/Public_ORBIT-LIVE-TEAM-MANAGEMENT-SOFTWARE" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to close"

