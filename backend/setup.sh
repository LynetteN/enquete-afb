#!/bin/bash

echo "🚀 Setting up Enquete Backend API..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL v12 or higher."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database credentials"
else
    echo "✅ .env file already exists"
fi

# Prompt for database setup
echo ""
echo "📊 Database Setup"
read -p "Enter database name (default: enquete_db): " db_name
db_name=${db_name:-enquete_db}

read -p "Enter database user (default: postgres): " db_user
db_user=${db_user:-postgres}

read -sp "Enter database password: " db_password
echo ""

# Update .env file
sed -i "s/DB_NAME=.*/DB_NAME=$db_name/" .env
sed -i "s/DB_USER=.*/DB_USER=$db_user/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$db_password/" .env

# Create database
echo "🔧 Creating database..."
createdb $db_name 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database created"
else
    echo "⚠️  Database might already exist or there was an error"
fi

# Run migrations
echo "🔄 Running database migrations..."
npm run migrate

if [ $? -ne 0 ]; then
    echo "❌ Migration failed"
    exit 1
fi

echo "✅ Migrations completed"

# Seed database
echo "🌱 Seeding database..."
npm run seed

if [ $? -ne 0 ]; then
    echo "❌ Seeding failed"
    exit 1
fi

echo "✅ Database seeded"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Review and update .env file if needed"
echo "2. Start the server: npm run dev"
echo "3. API will be available at http://localhost:3001"
echo ""
echo "Default admin credentials:"
echo "Username: admin"
echo "Password: afriland2026"
echo ""
echo "⚠️  IMPORTANT: Change the default password in production!"
