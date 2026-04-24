@echo off
echo ===================================================
echo   BharatLCL Auto-Updater
echo ===================================================
echo.
echo Saving all files and pushing to GitHub...
echo.

git add .
git commit -m "Auto update: %date% %time%"
git push origin main

echo.
echo ===================================================
echo   Done! Your project is successfully updated on GitHub!
echo ===================================================
timeout /t 3 >nul
