@echo off
echo ========================================
echo   Starting Memoir (Local Mode - No Docker)
echo ========================================
echo.

echo Starting Backend...
start "Backend" cmd /k "cd backend && npm install && npm run seed && npm start"
timeout /t 5 /nobreak >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ========================================
echo   Services Starting...
echo   Backend:  http://localhost:4000
echo   Frontend: http://localhost:5173
echo ========================================
echo.
echo Demo Account:
echo   Email: demo@memoir.app
echo   Password: demo1234
echo.
echo Press any key to close this window
pause >nul

