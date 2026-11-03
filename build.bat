@echo off
cd /d C:\Users\soham\Desktop\avanimart
call npm run build > build_output.log 2>&1
echo DONE %ERRORLEVEL% >> build_output.log
