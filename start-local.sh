#!/bin/bash

echo "========================================"
echo "  Starting Memoir (Local Mode - No Docker)"
echo "========================================"
echo ""

# Start Backend
echo "Starting Backend..."
cd backend
npm install
npm run seed
npm start &
BACKEND_PID=$!
cd ..
sleep 5

# Start Frontend
echo "Starting Frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "  Services Starting..."
echo "  Backend:  http://localhost:4000"
echo "  Frontend: http://localhost:5173"
echo "========================================"
echo ""
echo "Demo Account:"
echo "  Email: demo@memoir.app"
echo "  Password: demo1234"
echo ""
echo "Press Ctrl+C to stop all services"
wait

