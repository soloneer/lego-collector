import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  try {
    const result = await pool.query(`
      SELECT fig_num, name, fig_img_url
      FROM minifigs 
      WHERE fig_img_url IS NOT NULL
      LIMIT 10
    `);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching minifigs:', error);
    res.status(500).json({ error: 'Failed to fetch minifigs' });
  }
}