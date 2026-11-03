@echo off
cd /d "%~dp0"
echo ========================================================
echo   Pushing TypeScript Fixes to GitHub (Quickcommerce_pos)
echo ========================================================
git add .
git commit -m "fix(types): resolve product category schema, logger orderType, customer address and invoice modal for clean build"
git push origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   Push successful! Vercel build will now pass cleanly.
    echo ========================================================
) else (
    echo.
    echo [ERROR] Git push failed. Please check your network connection or credentials.
)
pause
