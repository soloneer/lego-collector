import express from 'express'
import cors from 'cors'
import pg from 'pg'

const { Pool } = pg

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Database configuration - supports both local and Supabase
const pool = new Pool(
  process.env.DATABASE_URL || process.env.SUPABASE_DB_URL ? 
    { connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL } :
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'lego_collector',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    }
)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

// Get featured sets (newest or popular)
app.get('/sets/featured', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, t.name as theme_name 
      FROM sets s
      LEFT JOIN themes t ON s.theme_id = t.id
      WHERE s.year >= 2020 AND s.num_parts > 100
      ORDER BY s.year DESC, s.num_parts DESC
      LIMIT 12
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching featured sets:', error)
    res.status(500).json({ error: 'Failed to fetch featured sets' })
  }
})

// Get sets with filtering
app.get('/sets', async (req, res) => {
  try {
    const { search, year, theme, minParts, maxParts, limit = 50, offset = 0 } = req.query
    
    let query = `
      SELECT s.*, t.name as theme_name 
      FROM sets s
      LEFT JOIN themes t ON s.theme_id = t.id
      WHERE 1=1
    `
    const params = []
    let paramCount = 0

    if (search) {
      paramCount++
      query += ` AND s.name ILIKE $${paramCount}`
      params.push(`%${search}%`)
    }

    if (year) {
      paramCount++
      query += ` AND s.year = $${paramCount}`
      params.push(parseInt(year))
    }

    if (theme) {
      paramCount++
      query += ` AND s.theme_id = $${paramCount}`
      params.push(parseInt(theme))
    }

    if (minParts) {
      paramCount++
      query += ` AND s.num_parts >= $${paramCount}`
      params.push(parseInt(minParts))
    }

    if (maxParts) {
      paramCount++
      query += ` AND s.num_parts <= $${paramCount}`
      params.push(parseInt(maxParts))
    }

    query += ` ORDER BY s.year DESC, s.name ASC`
    
    paramCount++
    query += ` LIMIT $${paramCount}`
    params.push(parseInt(limit))
    
    paramCount++
    query += ` OFFSET $${paramCount}`
    params.push(parseInt(offset))

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching sets:', error)
    res.status(500).json({ error: 'Failed to fetch sets' })
  }
})

// Get single set details
app.get('/sets/:setNum', async (req, res) => {
  try {
    const { setNum } = req.params
    const result = await pool.query(`
      SELECT s.*, t.name as theme_name 
      FROM sets s
      LEFT JOIN themes t ON s.theme_id = t.id
      WHERE s.set_num = $1
    `, [setNum])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Set not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching set:', error)
    res.status(500).json({ error: 'Failed to fetch set' })
  }
})

// Get parts for a set
app.get('/sets/:setNum/parts', async (req, res) => {
  try {
    const { setNum } = req.params
    const result = await pool.query(`
      SELECT 
        ip.quantity,
        ip.is_spare,
        p.part_num,
        p.name as part_name,
        p.image_url,
        c.name as color_name,
        c.rgb as color_rgb
      FROM inventories i
      JOIN inventory_parts ip ON i.id = ip.inventory_id
      JOIN parts p ON ip.part_num = p.part_num
      JOIN colors c ON ip.color_id = c.id
      WHERE i.set_num = $1
      ORDER BY ip.quantity DESC, p.name ASC
    `, [setNum])
    
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching set parts:', error)
    res.status(500).json({ error: 'Failed to fetch set parts' })
  }
})

// Get minifigs for a set
app.get('/sets/:setNum/minifigs', async (req, res) => {
  try {
    const { setNum } = req.params
    const result = await pool.query(`
      SELECT 
        im.quantity,
        m.fig_num,
        m.name,
        m.num_parts,
        m.fig_img_url
      FROM inventories i
      JOIN inventory_minifigs im ON i.id = im.inventory_id
      JOIN minifigs m ON im.fig_num = m.fig_num
      WHERE i.set_num = $1
      ORDER BY m.name ASC
    `, [setNum])
    
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching set minifigs:', error)
    res.status(500).json({ error: 'Failed to fetch set minifigs' })
  }
})

// Get multiple sets by set numbers (for collection page)
app.post('/sets/batch', async (req, res) => {
  try {
    const { setNums } = req.body
    if (!Array.isArray(setNums) || setNums.length === 0) {
      return res.json([])
    }
    
    const placeholders = setNums.map((_, i) => `$${i + 1}`).join(', ')
    const result = await pool.query(`
      SELECT s.*, t.name as theme_name 
      FROM sets s
      LEFT JOIN themes t ON s.theme_id = t.id
      WHERE s.set_num IN (${placeholders})
      ORDER BY s.year DESC, s.name ASC
    `, setNums)
    
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching batch sets:', error)
    res.status(500).json({ error: 'Failed to fetch sets' })
  }
})

// Get themes
app.get('/themes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name 
      FROM themes 
      WHERE parent_id IS NULL
      ORDER BY name ASC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching themes:', error)
    res.status(500).json({ error: 'Failed to fetch themes' })
  }
})

// Track affiliate clicks
app.post('/affiliate-click', async (req, res) => {
  try {
    const { setNum, source, setName, timestamp, referrer } = req.body
    const ipAddress = req.ip || req.connection.remoteAddress
    const userAgent = req.get('User-Agent')
    
    await pool.query(`
      INSERT INTO affiliate_clicks (set_num, source, ip_address, user_agent, clicked_at, referrer, set_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [setNum, source, ipAddress, userAgent, timestamp, referrer, setName])
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error tracking affiliate click:', error)
    res.status(500).json({ error: 'Failed to track click' })
  }
})

// Get affiliate click analytics (admin only)
app.get('/admin/analytics/clicks', async (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query
    
    let query = `
      SELECT 
        ac.set_num,
        ac.set_name,
        ac.source,
        COUNT(*) as click_count,
        DATE(ac.clicked_at) as click_date
      FROM affiliate_clicks ac
      WHERE 1=1
    `
    const params = []
    
    if (startDate) {
      params.push(startDate)
      query += ` AND ac.clicked_at >= $${params.length}`
    }
    
    if (endDate) {
      params.push(endDate)
      query += ` AND ac.clicked_at <= $${params.length}`
    }
    
    query += `
      GROUP BY ac.set_num, ac.set_name, ac.source, DATE(ac.clicked_at)
      ORDER BY click_count DESC, click_date DESC
      LIMIT $${params.length + 1}
    `
    params.push(parseInt(limit))
    
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

app.listen(port, () => {
  console.log(`🚀 LEGO Collector API server running on port ${port}`)
})