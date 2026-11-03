@echo off
cd /d C:\Users\soham\Desktop\avanimart
echo ========================================================
echo   Pushing Fix to GitHub (Quickcommerce_pos)
echo ========================================================
echo.

git add .
git commit -m "fix: remove invalid page export STORE_CATEGORIES for Next.js build"
echo.
echo Pushing to origin main...
git push origin main

echo.
echo ========================================================
echo   Done! Vercel will automatically redeploy.
echo ========================================================
pause
