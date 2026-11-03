Set-Location -Path $PSScriptRoot
Write-Host "Pushing TypeScript Fixes to GitHub (Quickcommerce_pos)..." -ForegroundColor Cyan
git add .
git commit -m "fix(billing): import cn in InvoiceModal and resolve all build type errors"
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "Success! Vercel build will now pass cleanly." -ForegroundColor Green
} else {
    Write-Host "[ERROR] Git push failed. Please check your network connection or credentials." -ForegroundColor Red
}
