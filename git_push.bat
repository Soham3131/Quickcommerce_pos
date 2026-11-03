@echo off
cd /d C:\Users\soham\Desktop\avanimart
echo ========================================================
echo   Pushing Avani Grocers to GitHub (Quickcommerce_pos)
echo ========================================================
echo.

git init
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/Soham3131/Quickcommerce_pos.git
git add .
git commit -m "first commit - Avani Grocers Vercel Demo Mode"
echo.
echo Pushing to origin main...
git push -u origin main

echo.
echo ========================================================
echo   Done!
echo ========================================================
pause
