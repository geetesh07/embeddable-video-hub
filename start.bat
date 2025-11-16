@echo off
echo Starting VideoHub LMS...
echo.
echo Starting Frontend and Backend servers...
start "Frontend" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul
start "Backend" cmd /k "cd server && npm start"
echo.
echo Both servers are starting in separate windows...
echo Frontend: http://localhost:5000
echo Backend: http://localhost:3001
pause