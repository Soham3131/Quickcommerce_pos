Write-Host "========================================================" -ForegroundColor Green
Write-Host "  Avani Grocers - Premium Grocery POS System" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

Set-Location -Path $PSScriptRoot

Write-Host "[1/2] Installing npm dependencies..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "[2/2] Starting Next.js Dev Server on http://localhost:3000..." -ForegroundColor Cyan
Write-Host "Open http://localhost:3000 in your browser when ready." -ForegroundColor Yellow
Write-Host ""

npm run dev
