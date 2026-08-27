@echo off
title Upload Papua Barat Monitoring ke GitHub
echo =======================================================
echo   Upload Papua Barat Monitoring System ke GitHub
echo =======================================================
echo.

cd /d "C:\Users\Melis\.gemini\antigravity\scratch\papua-barat-monitoring"

git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo Masukkan URL Repositori GitHub Anda:
    echo Contoh: https://github.com/username/papua-barat-monitoring.git
    set /p REPO_URL="URL GitHub: "
    git remote add origin %REPO_URL%
)

echo.
echo Mengirim kode ke GitHub (branch main)...
git push -u origin main

echo.
echo =======================================================
echo Selesai! Silakan refresh halaman Vercel Anda dan klik Deploy.
echo =======================================================
pause
