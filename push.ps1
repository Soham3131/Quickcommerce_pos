Set-Location -Path $PSScriptRoot
Write-Host "Pushing Fix to GitHub..." -ForegroundColor Cyan
git add .
git commit -m "fix: remove invalid page export STORE_CATEGORIES for Next.js build"
git push origin main
Write-Host "Done! Vercel will automatically redeploy." -ForegroundColor Green
