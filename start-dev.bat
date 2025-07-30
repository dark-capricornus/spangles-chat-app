@echo off
echo 🚀 Starting Spangles Chat App (Development Mode)...

:: Start server in background
echo 📡 Starting backend server...
start "Backend Server" cmd /k "cd server && npm start"

:: Wait a moment for server to start
timeout /t 3 /nobreak > nul

:: Start client
echo 🌐 Starting frontend client...
start "Frontend Client" cmd /k "cd client && npm start"

echo ✅ Both servers are starting...
echo 📡 Backend: http://localhost:5000
echo 🌐 Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
