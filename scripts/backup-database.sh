#!/bin/bash

# LEGO Collector Database Backup Script
# Creates timestamped backups of the PostgreSQL database

set -e

# Configuration
DB_NAME="${DB_NAME:-lego_collector}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/lego_collector_backup_$TIMESTAMP.sql"

echo "🗄️  Starting database backup..."
echo "📅 Timestamp: $TIMESTAMP"
echo "📁 Backup file: $BACKUP_FILE"

# Create the backup
if command -v pg_dump >/dev/null 2>&1; then
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose \
        --format=custom \
        --compress=9 \
        --file="$BACKUP_FILE.custom"
    
    # Also create a plain SQL backup for easier inspection
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose \
        --format=plain \
        --file="$BACKUP_FILE"
    
    echo "✅ Backup completed successfully!"
    echo "📄 Plain SQL: $BACKUP_FILE"
    echo "🗜️  Custom format: $BACKUP_FILE.custom"
else
    echo "❌ pg_dump not found. Please install PostgreSQL client tools."
    exit 1
fi

# Compress the plain SQL backup
gzip "$BACKUP_FILE"
echo "🗜️  Compressed backup: $BACKUP_FILE.gz"

# Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
echo "📏 Backup size: $BACKUP_SIZE"

# Clean up old backups (older than retention period)
echo "🧹 Cleaning up backups older than $BACKUP_RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "lego_collector_backup_*.sql*" -type f -mtime +$BACKUP_RETENTION_DAYS -delete

# List remaining backups
echo "📋 Current backups:"
ls -lh "$BACKUP_DIR"/lego_collector_backup_*.sql* 2>/dev/null || echo "No backups found"

echo "✨ Backup process completed!"