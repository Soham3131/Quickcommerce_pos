Set-Location -Path $PSScriptRoot
Write-Host "Pushing Avani Grocers Fixes to GitHub..." -ForegroundColor Cyan
git add .
git commit -m "fix: resolve InvoiceModal prop types and STORE_CATEGORIES export for clean Vercel build"
git push origin main
Write-Host "Done! Vercel will automatically redeploy." -ForegroundColor Green
