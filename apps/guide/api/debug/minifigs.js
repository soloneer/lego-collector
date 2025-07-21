import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  try {
    // Get some minifigs with and without image URLs
    const withImages = await pool.query(`
      SELECT fig_num, name, fig_img_url
      FROM minifigs 
      WHERE fig_img_url IS NOT NULL AND fig_img_url != ''
      LIMIT 5
    `);
    
    const withoutImages = await pool.query(`
      SELECT fig_num, name, fig_img_url
      FROM minifigs 
      WHERE fig_img_url IS NULL OR fig_img_url = ''
      LIMIT 5
    `);
    
    const total = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(fig_img_url) as with_urls,
        COUNT(*) - COUNT(fig_img_url) as without_urls
      FROM minifigs
    `);
    
    res.status(200).json({
      stats: total.rows[0],
      withImages: withImages.rows,
      withoutImages: withoutImages.rows
    });
  } catch (error) {
    console.error('Error fetching minifigs:', error);
    res.status(500).json({ error: 'Failed to fetch minifigs' });
  }
}