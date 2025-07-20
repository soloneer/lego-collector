import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration  
const CSV_SOURCE_URL = 'https://cdn.rebrickable.com/media/downloads/';
const DATA_DIR = path.join(__dirname, '../../data/latest');

// List of CSV files to download from Rebrickable
const CSV_FILES = [
  'sets.csv.gz',
  'parts.csv.gz', 
  'colors.csv.gz',
  'themes.csv.gz',
  'part_categories.csv.gz',
  'inventories.csv.gz',
  'inventory_parts.csv.gz',
  'minifigs.csv.gz',
  'inventory_minifigs.csv.gz'
];

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function downloadFile(filename) {
  const url = `${CSV_SOURCE_URL}${filename}`;
  const outputPath = path.join(DATA_DIR, filename);
  
  try {
    console.log(`Downloading ${filename}...`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const fileStream = fs.createWriteStream(outputPath);
    
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    
    const stats = fs.statSync(outputPath);
    console.log(`✓ ${filename} downloaded (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
    
    return {
      filename,
      success: true,
      size: stats.size,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`✗ Failed to download ${filename}:`, error.message);
    
    return {
      filename,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function downloadAllFiles() {
  console.log('🧱 Starting LEGO CSV download from Rebrickable...');
  console.log(`📁 Output directory: ${DATA_DIR}`);
  console.log('');
  
  const results = [];
  
  for (const filename of CSV_FILES) {
    const result = await downloadFile(filename);
    results.push(result);
  }
  
  // Generate download log
  const logData = {
    downloadStarted: new Date().toISOString(),
    totalFiles: CSV_FILES.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  };
  
  const logPath = path.join(DATA_DIR, 'download_log.json');
  fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
  
  console.log('');
  console.log('📊 Download Summary:');
  console.log(`   Total files: ${logData.totalFiles}`);
  console.log(`   Successful: ${logData.successful}`);
  console.log(`   Failed: ${logData.failed}`);
  console.log(`   Log saved: ${logPath}`);
  
  if (logData.failed > 0) {
    console.log('');
    console.log('❌ Failed downloads:');
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`   - ${r.filename}: ${r.error}`));
  }
  
  return logData;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadAllFiles()
    .then(() => {
      console.log('');
      console.log('🎉 Download process completed!');
    })
    .catch(error => {
      console.error('💥 Download process failed:', error);
      process.exit(1);
    });
}