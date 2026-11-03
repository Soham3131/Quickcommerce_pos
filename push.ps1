Set-Location -Path $PSScriptRoot
Write-Host "Pushing Avani Grocers to GitHub..." -ForegroundColor Cyan
git init
git branch -M main
try { git remote remove origin 2>$null } catch {}
git remote add origin https://github.com/Soham3131/Quickcommerce_pos.git
git add .
git commit -m "first commit - Avani Grocers Vercel Demo Mode"
git push -u origin main
Write-Host "Done!" -ForegroundColor Green
