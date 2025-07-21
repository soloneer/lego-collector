import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { search, year, theme, minParts, maxParts, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT s.*, t.name as theme_name 
      FROM sets s
      LEFT JOIN themes t ON s.theme_id = t.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND s.name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (year) {
      query += ` AND s.year = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }

    if (theme) {
      query += ` AND t.name ILIKE $${paramIndex}`;
      params.push(`%${theme}%`);
      paramIndex++;
    }

    if (minParts) {
      query += ` AND s.num_parts >= $${paramIndex}`;
      params.push(minParts);
      paramIndex++;
    }

    if (maxParts) {
      query += ` AND s.num_parts <= $${paramIndex}`;
      params.push(maxParts);
      paramIndex++;
    }

    query += ` ORDER BY s.year DESC, s.name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching sets:', error);
    res.status(500).json({ error: 'Failed to fetch sets' });
  }
}