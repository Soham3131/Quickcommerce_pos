@echo off
cd /d C:\Users\soham\Desktop\avanimart
echo ========================================================
echo   [1/2] Verifying Build Locally (npm run build)...
echo ========================================================
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed! Aborting git push.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo   [2/2] Build Succeeded! Pushing Fixes to GitHub...
echo ========================================================
git add .
git commit -m "fix: resolve customer address type mismatch and invoice modal for clean build"
git push origin main

echo.
echo ========================================================
echo   Done! Vercel will automatically redeploy with success!
echo ========================================================
pause
