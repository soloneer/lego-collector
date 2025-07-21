import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Debug: Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not found');
      return res.status(500).json({ error: 'Database configuration missing' });
    }

    const result = await pool.query(`
      SELECT s.*, t.name as theme_name 
      FROM sets s
      LEFT JOIN themes t ON s.theme_id = t.id
      WHERE s.year >= 2020 AND s.num_parts > 100
      ORDER BY s.year DESC, s.num_parts DESC
      LIMIT 12
    `);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching featured sets:', error);
    res.status(500).json({ error: 'Failed to fetch featured sets', details: error.message });
  }
}