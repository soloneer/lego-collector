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
    const { id } = req.query;
    
    // Get set details
    const setResult = await pool.query(`
      SELECT s.*, t.name as theme_name 
      FROM sets s
      LEFT JOIN themes t ON s.theme_id = t.id
      WHERE s.set_num = $1
    `, [id]);

    if (setResult.rows.length === 0) {
      return res.status(404).json({ error: 'Set not found' });
    }

    const set = setResult.rows[0];

    // Get inventory details
    const inventoryResult = await pool.query(`
      SELECT i.id as inventory_id, i.version
      FROM inventories i
      WHERE i.set_num = $1
      ORDER BY i.version DESC
      LIMIT 1
    `, [id]);

    if (inventoryResult.rows.length === 0) {
      return res.status(200).json({ set, parts: [], minifigs: [] });
    }

    const inventory = inventoryResult.rows[0];

    // Get parts
    const partsResult = await pool.query(`
      SELECT p.part_num, p.name as part_name, p.image_url,
             c.name as color_name, c.rgb as color_rgb,
             ip.quantity, ip.is_spare
      FROM inventory_parts ip
      JOIN parts p ON ip.part_num = p.part_num
      JOIN colors c ON ip.color_id = c.id
      WHERE ip.inventory_id = $1
      ORDER BY ip.quantity DESC, p.name
    `, [inventory.inventory_id]);

    // Get minifigs
    const minifigsResult = await pool.query(`
      SELECT m.fig_num, m.name as fig_name, m.fig_img_url,
             im.quantity
      FROM inventory_minifigs im
      JOIN minifigs m ON im.fig_num = m.fig_num
      WHERE im.inventory_id = $1
      ORDER BY m.name
    `, [inventory.inventory_id]);

    res.status(200).json({
      set,
      parts: partsResult.rows,
      minifigs: minifigsResult.rows
    });
  } catch (error) {
    console.error('Error fetching set details:', error);
    res.status(500).json({ error: 'Failed to fetch set details' });
  }
}