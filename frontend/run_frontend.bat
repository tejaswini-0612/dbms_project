@echo off
cd /d %~dp0
if not exist node_modules (
    echo node_modules not found, running npm install first...
    call npm install
)
call npm run dev
