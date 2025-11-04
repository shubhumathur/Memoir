@echo off
echo ========================================
echo   Starting Memoir - AI Wellness Platform
echo ========================================
echo.

echo Checking if Docker is available...
docker --version >nul 2>&1
if %errorlevel% == 0 (
    echo Docker found! Starting with Docker Compose...
    echo.
    docker compose up --build
) else (
    echo Docker not found. Starting local development...
    echo.
    echo Starting MongoDB (if installed locally)...
    start "MongoDB" cmd /k "mongod"
    timeout /t 3 /nobreak >nul
    
    echo Starting Backend...
    start "Backend" cmd /k "cd backend && npm install && npm run seed && npm start"
    timeout /t 5 /nobreak >nul
    
    echo Starting Frontend...
    start "Frontend" cmd /k "cd frontend && npm install && npm run dev"
    
    echo.
    echo ========================================
    echo   Services starting...
    echo   Frontend: http://localhost:5173
    echo   Backend:  http://localhost:4000
    echo ========================================
    echo.
    echo Press any key to close this window (services will keep running)
    pause >nul
)

