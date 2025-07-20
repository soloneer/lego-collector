#!/usr/bin/env node

// Migration script to transfer data from local PostgreSQL to Supabase
// Run with: node scripts/migrate-to-supabase.js

import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

// Configuration
const LOCAL_DB_CONFIG = {
  host: process.env.LOCAL_DB_HOST || 'localhost',
  port: process.env.LOCAL_DB_PORT || 5432,
  database: process.env.LOCAL_DB_NAME || 'lego_collector',
  user: process.env.LOCAL_DB_USER || 'postgres',
  password: process.env.LOCAL_DB_PASSWORD || ''
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key for admin operations

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Tables to migrate in dependency order
const MIGRATION_ORDER = [
  'themes',
  'colors', 
  'part_categories',
  'parts',
  'sets',
  'inventories',
  'minifigs',
  'inventory_parts',
  'inventory_minifigs'
];

class SupabaseMigrator {
  constructor() {
    this.localClient = new Client(LOCAL_DB_CONFIG);
    this.stats = {
      tables: {},
      startTime: new Date(),
      errors: []
    };
  }

  async connect() {
    console.log('🔄 Connecting to local database...');
    await this.localClient.connect();
    console.log('✅ Connected to local database');
  }

  async disconnect() {
    await this.localClient.end();
  }

  async migrateTable(tableName) {
    console.log(`\n📦 Migrating table: ${tableName}`);
    
    try {
      // Get data from local database
      const result = await this.localClient.query(`SELECT * FROM ${tableName}`);
      const rows = result.rows;
      
      if (rows.length === 0) {
        console.log(`   ⚠️  Table ${tableName} is empty, skipping...`);
        this.stats.tables[tableName] = { rows: 0, success: true };
        return;
      }

      console.log(`   📊 Found ${rows.length.toLocaleString()} rows`);

      // Clear existing data in Supabase (be careful!)
      console.log(`   🧹 Clearing existing data in Supabase...`);
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .neq('id', 0); // Delete all rows (using a condition that's always true)

      if (deleteError && deleteError.code !== 'PGRST116') { // PGRST116 = no rows to delete
        console.warn(`   ⚠️  Warning clearing ${tableName}:`, deleteError.message);
      }

      // Insert data in batches
      const batchSize = 1000;
      let insertedCount = 0;

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        
        const { data, error } = await supabase
          .from(tableName)
          .insert(batch);

        if (error) {
          console.error(`   ❌ Error inserting batch for ${tableName}:`, error);
          this.stats.errors.push({ table: tableName, batch: i, error: error.message });
        } else {
          insertedCount += batch.length;
          console.log(`   ✅ Inserted ${insertedCount.toLocaleString()}/${rows.length.toLocaleString()} rows`);
        }
      }

      this.stats.tables[tableName] = {
        rows: insertedCount,
        total: rows.length,
        success: insertedCount === rows.length
      };

      console.log(`   🎉 Completed ${tableName}: ${insertedCount}/${rows.length} rows`);

    } catch (error) {
      console.error(`   ❌ Failed to migrate ${tableName}:`, error.message);
      this.stats.tables[tableName] = { rows: 0, success: false, error: error.message };
      this.stats.errors.push({ table: tableName, error: error.message });
    }
  }

  async migrateAllTables() {
    console.log('🚀 Starting full database migration to Supabase...');
    
    for (const tableName of MIGRATION_ORDER) {
      await this.migrateTable(tableName);
    }
  }

  async generateReport() {
    const endTime = new Date();
    const duration = Math.round((endTime - this.stats.startTime) / 1000);
    
    console.log('\n📋 Migration Report');
    console.log('='.repeat(50));
    console.log(`Started: ${this.stats.startTime.toISOString()}`);
    console.log(`Completed: ${endTime.toISOString()}`);
    console.log(`Duration: ${duration} seconds`);
    console.log('');

    let totalRows = 0;
    let successfulTables = 0;

    Object.entries(this.stats.tables).forEach(([table, stats]) => {
      const status = stats.success ? '✅' : '❌';
      console.log(`${status} ${table}: ${stats.rows?.toLocaleString() || 0} rows`);
      
      if (stats.success) successfulTables++;
      totalRows += stats.rows || 0;
    });

    console.log('');
    console.log(`📊 Summary:`);
    console.log(`   Tables migrated: ${successfulTables}/${MIGRATION_ORDER.length}`);
    console.log(`   Total rows: ${totalRows.toLocaleString()}`);
    console.log(`   Errors: ${this.stats.errors.length}`);

    if (this.stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.stats.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.table}: ${error.error}`);
      });
    }

    // Save report to file
    const reportPath = `./migration-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.stats, null, 2));
    console.log(`\n💾 Detailed report saved: ${reportPath}`);

    return this.stats.errors.length === 0;
  }
}

async function main() {
  const migrator = new SupabaseMigrator();
  
  try {
    await migrator.connect();
    await migrator.migrateAllTables();
    const success = await migrator.generateReport();
    
    if (success) {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Migration completed with errors. Check the report for details.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    process.exit(1);
  } finally {
    await migrator.disconnect();
  }
}

// Run migration
main();