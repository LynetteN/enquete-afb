@echo off
echo 🚀 Setting up Enquete Backend API...

REM Check if Node.js is installed
where node >/dev/null 2>/dev/null
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18 or higher.
    exit /b 1
)

REM Check if PostgreSQL is installed
where psql >/dev/null 2>/dev/null
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not installed. Please install PostgreSQL v12 or higher.
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo ✅ Dependencies installed

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your database credentials
) else (
    echo ✅ .env file already exists
)

echo.
echo 📊 Database Setup
set /p db_name="Enter database name (default: enquete_db): "
if "%db_name%"=="" set db_name=enquete_db

set /p db_user="Enter database user (default: postgres): "
if "%db_user%"=="" set db_user=postgres

set /p db_password="Enter database password: "

REM Update .env file (simple replacement)
powershell -Command "(Get-Content .env) -replace 'DB_NAME=.*', 'DB_NAME=%db_name%' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'DB_USER=.*', 'DB_USER=%db_user%' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=%db_password%' | Set-Content .env"

REM Create database
echo 🔧 Creating database...
createdb %db_name% 2>/dev/null
if %errorlevel% equ 0 (
    echo ✅ Database created
) else (
    echo ⚠️  Database might already exist or there was an error
)

REM Run migrations
echo 🔄 Running database migrations...
call npm run migrate

if %errorlevel% neq 0 (
    echo ❌ Migration failed
    exit /b 1
)

echo ✅ Migrations completed

REM Seed database
echo 🌱 Seeding database...
call npm run seed

if %errorlevel% neq 0 (
    echo ❌ Seeding failed
    exit /b 1
)

echo ✅ Database seeded

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Review and update .env file if needed
echo 2. Start the server: npm run dev
echo 3. API will be available at http://localhost:3001
echo.
echo Default admin credentials:
echo Username: admin
echo Password: afriland2026
echo.
echo ⚠️  IMPORTANT: Change the default password in production!

pause
