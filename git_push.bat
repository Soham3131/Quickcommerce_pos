@echo off
cd /d C:\Users\soham\Desktop\avanimart
echo ========================================================
echo   Pushing Avani Grocers Fixes to GitHub
echo ========================================================
echo.

git add .
git commit -m "fix: resolve InvoiceModal prop types and STORE_CATEGORIES export for clean Vercel build"
echo.
echo Pushing to origin main...
git push origin main

echo.
echo ========================================================
echo   Done! Vercel will automatically redeploy.
echo ========================================================
pause
