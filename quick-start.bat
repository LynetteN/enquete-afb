@echo off
echo ========================================
echo Enquete Survey - Quick Start Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18 or higher.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not installed. Please install PostgreSQL v12 or higher.
    echo Download from: https://www.postgresql.org/download/
    pause
    exit /b 1
)

echo ✅ PostgreSQL is installed
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ❌ Backend directory not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
echo.

REM Check if .env exists in backend
if not exist ".env" (
    echo 📝 Creating backend .env file...
    copy .env.example .env
    echo ⚠️  Please edit backend\.env with your database credentials
    echo    Default settings: DB_NAME=enquete_db, DB_USER=postgres
    echo.
)

REM Ask user if they want to setup database
echo 🔧 Database Setup
set /p setup_db="Do you want to setup the database now? (y/n): "
if /i "%setup_db%"=="y" (
    echo.
    echo 📊 Creating database and running migrations...
    call npm run migrate
    if %errorlevel% neq 0 (
        echo ❌ Migration failed. Please check your database credentials in .env
        pause
        exit /b 1
    )
    echo ✅ Database migrations completed

    echo 🌱 Seeding database with default data...
    call npm run seed
    if %errorlevel% neq 0 (
        echo ❌ Seeding failed
        pause
        exit /b 1
    )
    echo ✅ Database seeded successfully
    echo.
)

REM Go back to project root
cd ..

echo 📦 Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed
echo.

REM Check if .env exists in frontend
if not exist ".env" (
    echo 📝 Creating frontend .env file...
    echo VITE_API_URL=http://localhost:3001/api > .env
    echo ✅ Frontend .env file created
)

echo.
echo ========================================
echo 🎉 Setup Completed Successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure PostgreSQL is running
echo 2. Start the backend server:
echo    cd backend
echo    npm run dev
echo.
echo 3. In a new terminal, start the frontend:
echo    npm run dev
echo.
echo 4. Open your browser to:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3001/health
echo.
echo Default admin credentials:
echo Username: admin
echo Password: afriland2026
echo.
echo ⚠️  IMPORTANT: Change the default password after first login!
echo.
pause