Set-Location -Path $PSScriptRoot
Write-Host "[1/2] Verifying Build Locally (npm run build)..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed! Aborting push." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "[2/2] Build Succeeded! Pushing to GitHub..." -ForegroundColor Green
git add .
git commit -m "fix: resolve customer address type mismatch and invoice modal for clean build"
git push origin main
Write-Host "Done! Vercel will automatically redeploy with success!" -ForegroundColor Green
