#!/bin/bash

# PostgreSQL Backup Script for Docker
# This script creates automated backups of the database

set -e

# Configuration
BACKUP_DIR="/backups/postgres"
CONTAINER_NAME="enquete-postgres"
DB_NAME="enquete_db"
DB_USER="postgres"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/enquete_db_$TIMESTAMP.sql.gz"

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

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting PostgreSQL backup..."

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    print_error "PostgreSQL container is not running"
    exit 1
fi

# Create backup
echo "📦 Creating backup: $BACKUP_FILE"
if docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"; then
    print_success "Backup created successfully"

    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "📊 Backup size: $BACKUP_SIZE"
else
    print_error "Backup failed"
    exit 1
fi

# Remove old backups
echo "🧹 Cleaning up old backups (older than $RETENTION_DAYS days)..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "enquete_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ "$DELETED_COUNT" -gt 0 ]; then
    print_success "Deleted $DELETED_COUNT old backup(s)"
else
    echo "ℹ️  No old backups to delete"
fi

# List current backups
echo ""
echo "📋 Current backups:"
ls -lh "$BACKUP_DIR"/enquete_db_*.sql.gz 2>/dev/null || echo "No backups found"

echo ""
print_success "Backup completed successfully: $BACKUP_FILE"

# Optional: Verify backup integrity
echo "🔍 Verifying backup integrity..."
if gzip -t "$BACKUP_FILE" 2>/dev/null; then
    print_success "Backup integrity verified"
else
    print_error "Backup integrity check failed"
    exit 1
fi

echo ""
echo "💡 To restore this backup, use:"
echo "   gunzip < $BACKUP_FILE | docker exec -i $CONTAINER_NAME psql -U $DB_USER $DB_NAME"