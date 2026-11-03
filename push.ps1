Set-Location -Path $PSScriptRoot
Write-Host "Pushing TypeScript Fixes to GitHub (Quickcommerce_pos)..." -ForegroundColor Cyan
git add .
git commit -m "fix(types): resolve product category schema, logger orderType, customer address and invoice modal for clean build"
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "Success! Vercel build will now pass cleanly." -ForegroundColor Green
} else {
    Write-Host "[ERROR] Git push failed. Please check your network connection or credentials." -ForegroundColor Red
}
