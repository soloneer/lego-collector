#!/bin/bash

# LEGO Collector Database Restore Script
# Restores a database backup

set -e

# Configuration
DB_NAME="${DB_NAME:-lego_collector}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

# Function to show usage
show_usage() {
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Examples:"
    echo "  $0 ./backups/lego_collector_backup_20240120_143022.sql.gz"
    echo "  $0 ./backups/lego_collector_backup_20240120_143022.sql.custom"
    echo ""
    echo "Available backups:"
    ls -1t "$BACKUP_DIR"/lego_collector_backup_*.sql* 2>/dev/null | head -10 || echo "  No backups found"
    exit 1
}

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "❌ Error: No backup file specified"
    show_usage
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    show_usage
fi

echo "🔄 Starting database restore..."
echo "📁 Backup file: $BACKUP_FILE"
echo "🗄️  Target database: $DB_NAME"

# Ask for confirmation
echo ""
echo "⚠️  WARNING: This will completely replace the current database!"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled"
    exit 1
fi

# Determine file type and restore accordingly
if [[ "$BACKUP_FILE" == *.custom ]]; then
    echo "📦 Restoring from custom format backup..."
    
    # Drop and recreate database
    dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" --if-exists
    createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
    
    # Restore from custom format
    pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose \
        --clean \
        --create \
        --exit-on-error \
        "$BACKUP_FILE"

elif [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "🗜️  Restoring from compressed SQL backup..."
    
    # Drop and recreate database
    dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" --if-exists
    createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
    
    # Restore from compressed SQL
    gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"

elif [[ "$BACKUP_FILE" == *.sql ]]; then
    echo "📄 Restoring from plain SQL backup..."
    
    # Drop and recreate database
    dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" --if-exists
    createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
    
    # Restore from plain SQL
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_FILE"

else
    echo "❌ Error: Unsupported backup file format"
    echo "Supported formats: .sql, .sql.gz, .custom"
    exit 1
fi

echo "✅ Database restore completed successfully!"
echo ""
echo "🔍 Verifying restore..."

# Basic verification
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
SET_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM sets;" | tr -d ' ' 2>/dev/null || echo "0")

echo "📊 Verification results:"
echo "   Tables: $TABLE_COUNT"
echo "   Sets: $SET_COUNT"

if [ "$TABLE_COUNT" -gt 0 ] && [ "$SET_COUNT" -gt 0 ]; then
    echo "✨ Restore verification passed!"
else
    echo "⚠️  Warning: Database may not have been restored correctly"
fi