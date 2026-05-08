#!/bin/bash

# Docker PostgreSQL Production Setup Script
# This script sets up and starts the secure PostgreSQL database

set -e  # Exit on error

echo "🚀 Starting Docker PostgreSQL Production Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.docker exists
if [ ! -f .env.docker ]; then
    print_error ".env.docker file not found. Creating from template..."
    cp .env.docker.example .env.docker 2>/dev/null || {
        print_error "Could not create .env.docker file"
        exit 1
    }
    print_warning "Please edit .env.docker with your configuration"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p init-scripts
mkdir -p postgresql-certs
mkdir -p backups/postgres
print_success "Directories created"

# Check if init script exists
if [ ! -f init-scripts/01-init-security.sql ]; then
    print_error "Security initialization script not found"
    exit 1
fi

# Start PostgreSQL container
echo "🐘 Starting PostgreSQL container..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker exec enquete-postgres pg_isready -U postgres -d enquete_db > /dev/null 2>&1; then
        print_success "PostgreSQL is ready!"
        break
    fi
    attempt=$((attempt + 1))
    echo "Attempt $attempt of $max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    print_error "PostgreSQL failed to start within expected time"
    docker-compose logs postgres
    exit 1
fi

# Verify database connection
echo "🔍 Verifying database connection..."
if docker exec enquete-postgres psql -U postgres -d enquete_db -c "SELECT version();" > /dev/null 2>&1; then
    print_success "Database connection verified"
else
    print_error "Database connection failed"
    exit 1
fi

# Check if security users were created
echo "👥 Checking security users..."
USERS=$(docker exec enquete-postgres psql -U postgres -d enquete_db -t -c "
    SELECT rolname FROM pg_roles WHERE rolname IN ('enquete_app', 'enquete_admin');
")

if echo "$USERS" | grep -q "enquete_app"; then
    print_success "Application user (enquete_app) created"
else
    print_warning "Application user not found - check initialization logs"
fi

if echo "$USERS" | grep -q "enquete_admin"; then
    print_success "Admin user (enquete_admin) created"
else
    print_warning "Admin user not found - check initialization logs"
fi

# Check security tables
echo "🔒 Checking security tables..."
TABLES=$(docker exec enquete-postgres psql -U postgres -d enquete_db -t -c "
    SELECT tablename FROM pg_tables WHERE tablename IN ('audit_log', 'security_events');
")

if echo "$TABLES" | grep -q "audit_log"; then
    print_success "Audit log table created"
else
    print_warning "Audit log table not found"
fi

if echo "$TABLES" | grep -q "security_events"; then
    print_success "Security events table created"
else
    print_warning "Security events table not found"
fi

# Display container information
echo ""
echo "📊 Container Information:"
docker-compose ps postgres

echo ""
echo "🔧 Connection Information:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: enquete_db"
echo "  Root User: postgres"
echo "  App User: enquete_app"
echo "  Admin User: enquete_admin"

echo ""
print_success "Docker PostgreSQL setup completed successfully!"

echo ""
echo "📝 Next Steps:"
echo "  1. Update backend .env with Docker database credentials"
echo "  2. Run database migration: cd backend && npm run migrate"
echo "  3. Seed database: cd backend && npm run seed"
echo "  4. Start backend: npm start"
echo ""
echo "🔒 Security Reminder:"
echo "  ⚠️  CHANGE ALL DEFAULT PASSWORDS IMMEDIATELY!"
echo "  ⚠️  Review security settings in DOCKER_POSTGRES_SECURITY.md"
echo "  ⚠️  Enable SSL/TLS for production deployment"
echo ""

# Display security warning
print_warning "IMPORTANT SECURITY NOTES:"
echo "  - Default passwords are set for initial setup only"
echo "  - Change passwords before production deployment"
echo "  - Review firewall and network security settings"
echo "  - Enable SSL/TLS for production use"
echo "  - Set up automated backups"
echo "  - Configure monitoring and alerting"
echo ""

# Ask if user wants to see logs
read -p "Do you want to see the PostgreSQL logs? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📋 PostgreSQL Logs:"
    docker-compose logs --tail=50 postgres
fi

echo ""
print_success "Setup complete! Your secure PostgreSQL database is ready."