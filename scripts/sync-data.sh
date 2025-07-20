#!/bin/bash

# LEGO Collector Data Sync Script
# Downloads latest data from Rebrickable and imports to database

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🧱 LEGO Collector Data Sync"
echo "=========================="

# Function to run with error handling
run_step() {
    local step_name="$1"
    local command="$2"
    
    echo ""
    echo "🔄 $step_name..."
    
    if eval "$command"; then
        echo "✅ $step_name completed successfully"
    else
        echo "❌ $step_name failed"
        exit 1
    fi
}

# Step 1: Backup current database
if [ "$SKIP_BACKUP" != "true" ]; then
    run_step "Creating database backup" "$SCRIPT_DIR/backup-database.sh"
fi

# Step 2: Download latest CSV data
run_step "Downloading latest CSV data" "cd $PROJECT_ROOT/apps/fetcher && npm start"

# Step 3: Import data to database
run_step "Importing data to database" "cd $PROJECT_ROOT/apps/importer && npm start"

echo ""
echo "🎉 Data sync completed successfully!"

# Optional: Show some stats
echo ""
echo "📊 Quick stats:"
if command -v psql >/dev/null 2>&1; then
    DB_NAME="${DB_NAME:-lego_collector}"
    DB_USER="${DB_USER:-postgres}"
    DB_HOST="${DB_HOST:-localhost}"
    DB_PORT="${DB_PORT:-5432}"
    
    SETS_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM sets;" 2>/dev/null | tr -d ' ' || echo "unknown")
    PARTS_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM parts;" 2>/dev/null | tr -d ' ' || echo "unknown")
    
    echo "   Sets: $SETS_COUNT"
    echo "   Parts: $PARTS_COUNT"
fi