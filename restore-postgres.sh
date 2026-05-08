#!/bin/bash

# PostgreSQL Restore Script for Docker
# This script restores a database from a backup file

set -e

# Configuration
BACKUP_DIR="/backups/postgres"
CONTAINER_NAME="enquete-postgres"
DB_NAME="enquete_db"
DB_USER="postgres"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/enquete_db_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    print_error "PostgreSQL container is not running"
    exit 1
fi

# Confirm restore operation
echo "⚠️  WARNING: This will replace the current database!"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

echo "🔄 Starting database restore..."

# Create temporary backup of current database
TEMP_BACKUP="$BACKUP_DIR/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
echo "📦 Creating temporary backup of current database..."
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$TEMP_BACKUP"
print_success "Temporary backup created: $TEMP_BACKUP"

# Restore from backup
echo "📥 Restoring database from backup..."
if gunzip < "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" "$DB_NAME"; then
    print_success "Database restored successfully"
else
    print_error "Restore failed"
    echo "Attempting to restore from temporary backup..."
    gunzip < "$TEMP_BACKUP" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" "$DB_NAME"
    print_error "Restore failed - database may be in inconsistent state"
    exit 1
fi

# Verify restore
echo "🔍 Verifying restore..."
if docker exec "$CONTAINER_NAME" psql -U "$DB_USER" "$DB_NAME" -c "SELECT COUNT(*) FROM information_schema.tables;" > /dev/null 2>&1; then
    print_success "Restore verification passed"
else
    print_error "Restore verification failed"
    exit 1
fi

echo ""
print_success "Database restore completed successfully!"
echo "📋 Temporary backup saved: $TEMP_BACKUP"
echo ""
echo "💡 To verify the restore, you can:"
echo "   docker exec -it $CONTAINER_NAME psql -U $DB_USER $DB_NAME -c '\dt'"