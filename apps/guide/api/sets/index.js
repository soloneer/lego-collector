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
    const { search, year, theme, minParts, maxParts, limit = 50, offset = 0 } = req.query;
    
    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND s.name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (year) {
      whereClause += ` AND s.year = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }

    if (theme) {
      whereClause += ` AND t.name ILIKE $${paramIndex}`;
      params.push(`%${theme}%`);
      paramIndex++;
    }

    if (minParts) {
      whereClause += ` AND s.num_parts >= $${paramIndex}`;
      params.push(minParts);
      paramIndex++;
    }

    if (maxParts) {
      whereClause += ` AND s.num_parts <= $${paramIndex}`;
      params.push(maxParts);
      paramIndex++;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM sets s
      LEFT JOIN themes t ON s.theme_id = t.id
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const dataQuery = `
      SELECT s.*, t.name as theme_name 
      FROM sets s
      LEFT JOIN themes t ON s.theme_id = t.id
      ${whereClause}
      ORDER BY s.year DESC, s.name ASC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);
    const dataResult = await pool.query(dataQuery, params);

    res.status(200).json({
      sets: dataResult.rows,
      total: total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching sets:', error);
    res.status(500).json({ error: 'Failed to fetch sets' });
  }
}