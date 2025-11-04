#!/bin/bash

echo "========================================"
echo "  Starting Memoir - AI Wellness Platform"
echo "========================================"
echo ""

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "Docker found! Starting with Docker Compose..."
    echo ""
    docker compose up --build
else
    echo "Docker not found. Starting local development..."
    echo ""
    
    # Start MongoDB (if installed)
    if command -v mongod &> /dev/null; then
        echo "Starting MongoDB..."
        mongod &
        sleep 3
    fi
    
    # Start Backend
    echo "Starting Backend..."
    cd backend
    npm install
    npm run seed
    npm start &
    cd ..
    sleep 5
    
    # Start Frontend
    echo "Starting Frontend..."
    cd frontend
    npm install
    npm run dev &
    cd ..
    
    echo ""
    echo "========================================"
    echo "  Services starting..."
    echo "  Frontend: http://localhost:5173"
    echo "  Backend:  http://localhost:4000"
    echo "========================================"
    echo ""
    echo "Press Ctrl+C to stop all services"
    wait
fi

