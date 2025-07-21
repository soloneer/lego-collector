#!/usr/bin/env node

// Direct CSV to Supabase migration script for GitHub Actions
// Reads CSV files and imports directly to Supabase (no local DB needed)

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import zlib from 'zlib';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Table mapping and processing functions
const TABLES = [
  {
    name: 'themes',
    file: 'themes.csv.gz',
    process: (row) => ({
      id: parseInt(row.id),
      name: row.name,
      parent_id: row.parent_id ? parseInt(row.parent_id) : null
    })
  },
  {
    name: 'colors', 
    file: 'colors.csv.gz',
    process: (row) => ({
      id: parseInt(row.id),
      name: row.name,
      rgb: row.rgb || null,
      is_trans: row.is_trans === 't'
    })
  },
  {
    name: 'part_categories',
    file: 'part_categories.csv.gz', 
    process: (row) => ({
      id: parseInt(row.id),
      name: row.name
    })
  },
  {
    name: 'parts',
    file: 'parts.csv.gz',
    process: (row) => ({
      part_num: row.part_num,
      name: row.name,
      part_cat_id: parseInt(row.part_cat_id),
      part_url: row.part_url || null,
      image_url: row.part_img_url || null
    })
  },
  {
    name: 'sets',
    file: 'sets.csv.gz',
    process: (row) => ({
      set_num: row.set_num,
      name: row.name,
      year: row.year ? parseInt(row.year) : null,
      theme_id: parseInt(row.theme_id),
      num_parts: row.num_parts ? parseInt(row.num_parts) : null,
      set_img_url: row.set_img_url || null
    })
  },
  {
    name: 'inventories',
    file: 'inventories.csv.gz',
    process: (row) => ({
      id: parseInt(row.id),
      version: parseInt(row.version),
      set_num: row.set_num
    })
  },
  {
    name: 'minifigs',
    file: 'minifigs.csv.gz', 
    process: (row) => ({
      fig_num: row.fig_num,
      name: row.name,
      num_parts: row.num_parts ? parseInt(row.num_parts) : null,
      fig_img_url: row.fig_img_url || null
    })
  },
  {
    name: 'inventory_parts',
    file: 'inventory_parts.csv.gz',
    process: (row) => ({
      inventory_id: parseInt(row.inventory_id),
      part_num: row.part_num,
      color_id: parseInt(row.color_id),
      quantity: parseInt(row.quantity),
      is_spare: row.is_spare === 't'
    })
  },
  {
    name: 'inventory_minifigs',
    file: 'inventory_minifigs.csv.gz',
    process: (row) => ({
      inventory_id: parseInt(row.inventory_id),
      fig_num: row.fig_num,
      quantity: parseInt(row.quantity)
    })
  }
];

async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const records = [];
    const stream = fs.createReadStream(filePath)
      .pipe(zlib.createGunzip())
      .pipe(parse({
        columns: true,
        skip_empty_lines: true
      }));

    stream.on('data', (record) => {
      records.push(record);
    });

    stream.on('end', () => {
      resolve(records);
    });

    stream.on('error', reject);
  });
}

async function insertBatch(table, data, batchSize = 1000) {
  let inserted = 0;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const { error } = await supabase
      .from(table)
      .insert(batch);
    
    if (error) {
      console.error(`❌ Error inserting batch for ${table}:`, error.message);
      continue;
    }
    
    inserted += batch.length;
    console.log(`   ✅ Inserted ${inserted}/${data.length} rows`);
  }
  
  return inserted;
}

async function migrateTable(tableConfig) {
  const { name, file, process } = tableConfig;
  const filePath = path.join(process.cwd(), 'data', 'latest', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${name}: ${file} not found`);
    return;
  }
  
  console.log(`📦 Migrating table: ${name}`);
  
  try {
    // Read and process CSV
    const rows = await readCSV(filePath);
    const processedData = rows.map(process);
    console.log(`   📊 Found ${processedData.length} rows`);
    
    // Clear existing data
    console.log(`   🧹 Clearing existing data...`);
    await supabase.from(name).delete().gte('id', 0);
    
    // Insert new data
    const inserted = await insertBatch(name, processedData);
    console.log(`   🎉 Completed ${name}: ${inserted}/${processedData.length} rows\n`);
    
  } catch (error) {
    console.error(`❌ Failed to migrate ${name}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting CSV to Supabase migration...\n');
  
  for (const table of TABLES) {
    await migrateTable(table);
  }
  
  console.log('✅ Migration completed!');
}

main().catch(console.error);