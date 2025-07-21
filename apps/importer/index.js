import pg from 'pg';
import fs from 'fs';
import path from 'path';
import zlib from 'node:zlib';
import { parse } from 'csv-parse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

// Database configuration
const dbConfig = process.env.DATABASE_URL ? 
  { 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  } : {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'lego_collector',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  };

const DATA_DIR = path.join(__dirname, '../../data/latest');

// Import configurations for each CSV file
const IMPORT_CONFIG = {
  'themes.csv.gz': {
    table: 'themes',
    columns: ['id', 'name', 'parent_id'],
    onConflict: 'id',
    transform: (row) => [
      parseInt(row.id) || null,
      row.name || null,
      row.parent_id ? parseInt(row.parent_id) : null
    ]
  },
  'colors.csv.gz': {
    table: 'colors',
    columns: ['id', 'name', 'rgb', 'is_trans'],
    onConflict: 'id',
    transform: (row) => [
      parseInt(row.id) || null,
      row.name || null,
      row.rgb || null,
      row.is_trans === 'True' || row.is_trans === 'true'
    ]
  },
  'part_categories.csv.gz': {
    table: 'part_categories',
    columns: ['id', 'name'],
    onConflict: 'id',
    transform: (row) => [
      parseInt(row.id) || null,
      row.name || null
    ]
  },
  'parts.csv.gz': {
    table: 'parts',
    columns: ['part_num', 'name', 'part_cat_id', 'part_url', 'image_url'],
    onConflict: 'part_num',
    transform: (row) => [
      row.part_num || null,
      row.name || null,
      row.part_cat_id ? parseInt(row.part_cat_id) : null,
      null, // part_url not in CSV
      null  // image_url not in CSV
    ]
  },
  'sets.csv.gz': {
    table: 'sets',
    columns: ['set_num', 'name', 'year', 'theme_id', 'num_parts', 'set_img_url'],
    onConflict: 'set_num',
    transform: (row) => [
      row.set_num || null,
      row.name || null,
      row.year ? parseInt(row.year) : null,
      row.theme_id ? parseInt(row.theme_id) : null,
      row.num_parts ? parseInt(row.num_parts) : null,
      row.img_url || null
    ]
  },
  'inventories.csv.gz': {
    table: 'inventories',
    columns: ['id', 'version', 'set_num'],
    onConflict: 'id',
    transform: (row) => [
      parseInt(row.id) || null,
      parseInt(row.version) || null,
      row.set_num || null
    ]
  },
  'inventory_parts.csv.gz': {
    table: 'inventory_parts',
    columns: ['inventory_id', 'part_num', 'color_id', 'quantity', 'is_spare'],
    onConflict: ['inventory_id', 'part_num', 'color_id', 'is_spare'],
    transform: (row) => [
      parseInt(row.inventory_id) || null,
      row.part_num || null,
      parseInt(row.color_id) || null,
      parseInt(row.quantity) || null,
      row.is_spare === 't' || row.is_spare === 'true'
    ]
  },
  'minifigs.csv.gz': {
    table: 'minifigs',
    columns: ['fig_num', 'name', 'num_parts', 'fig_img_url'],
    onConflict: 'fig_num',
    transform: (row) => [
      row.fig_num || null,
      row.name || null,
      row.num_parts ? parseInt(row.num_parts) : null,
      row.img_url || null
    ]
  },
  'inventory_minifigs.csv.gz': {
    table: 'inventory_minifigs',
    columns: ['inventory_id', 'fig_num', 'quantity'],
    onConflict: ['inventory_id', 'fig_num'],
    transform: (row) => [
      parseInt(row.inventory_id) || null,
      row.fig_num || null,
      parseInt(row.quantity) || null
    ]
  }
};

async function logImport(client, tableName, operation, recordsAffected, startTime, notes = null) {
  const query = `
    INSERT INTO import_logs (table_name, operation, records_affected, import_started_at, notes)
    VALUES ($1, $2, $3, $4, $5)
  `;
  await client.query(query, [tableName, operation, recordsAffected, startTime, notes]);
}

async function importCSVFile(client, filename, config) {
  const filePath = path.join(DATA_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return { imported: 0, updated: 0 };
  }
  
  console.log(`📥 Importing ${filename} into ${config.table}...`);
  const startTime = new Date();
  
  return new Promise((resolve, reject) => {
    const results = [];
    
    // Create read stream and decompress if .gz
    let stream = fs.createReadStream(filePath);
    if (filename.endsWith('.gz')) {
      stream = stream.pipe(zlib.createGunzip());
    }
    
    stream
      .pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (row) => {
        try {
          const transformedRow = config.transform(row);
          results.push(transformedRow);
        } catch (error) {
          console.error(`Error transforming row in ${filename}:`, error, row);
        }
      })
      .on('end', async () => {
        try {
          let imported = 0;
          let updated = 0;
          
          if (results.length > 0) {
            // Build upsert query
            const columns = config.columns.join(', ');
            const placeholders = config.columns.map((_, i) => `$${i + 1}`).join(', ');
            const conflictColumns = Array.isArray(config.onConflict) 
              ? config.onConflict.join(', ') 
              : config.onConflict;
            const updateClauses = config.columns
              .filter(col => !config.onConflict.includes?.(col) && col !== config.onConflict)
              .map(col => `${col} = EXCLUDED.${col}`)
              .join(', ');
            
            const query = `
              INSERT INTO ${config.table} (${columns})
              VALUES (${placeholders})
              ON CONFLICT (${conflictColumns}) 
              DO UPDATE SET ${updateClauses}
            `;
            
            // Import in batches
            const batchSize = 1000;
            for (let i = 0; i < results.length; i += batchSize) {
              const batch = results.slice(i, i + batchSize);
              
              for (const row of batch) {
                try {
                  const result = await client.query(query, row);
                  if (result.rowCount > 0) {
                    imported++;
                  }
                } catch (error) {
                  console.error(`Error inserting row into ${config.table}:`, error.message);
                  console.error('Row data:', row);
                }
              }
            }
          }
          
          await logImport(client, config.table, 'import', imported, startTime);
          
          console.log(`✅ ${config.table}: ${imported.toLocaleString()} records processed`);
          resolve({ imported, updated });
          
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function importAllFiles() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    
    console.log('🧱 Starting LEGO data import...');
    console.log('');
    
    const importOrder = [
      'themes.csv.gz',
      'colors.csv.gz', 
      'part_categories.csv.gz',
      'parts.csv.gz',
      'sets.csv.gz',
      'inventories.csv.gz',
      'minifigs.csv.gz',
      'inventory_parts.csv.gz',
      'inventory_minifigs.csv.gz'
    ];
    
    let totalImported = 0;
    
    for (const filename of importOrder) {
      const config = IMPORT_CONFIG[filename];
      if (config) {
        const result = await importCSVFile(client, filename, config);
        totalImported += result.imported;
      } else {
        console.log(`⚠️  No import config for ${filename}`);
      }
    }
    
    console.log('');
    console.log('📊 Import Summary:');
    console.log(`   Total records imported: ${totalImported.toLocaleString()}`);
    console.log('   Check import_logs table for detailed statistics');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importAllFiles()
    .then(() => {
      console.log('');
      console.log('🎉 Import process completed!');
    })
    .catch(error => {
      console.error('💥 Import process failed:', error);
      process.exit(1);
    });
}