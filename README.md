# 🧱 LEGO Collector App

A modular, locally-hosted system for managing and displaying comprehensive LEGO collection data sourced from Rebrickable. The system consists of three interconnected apps that can operate independently.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CSV Fetcher   │    │ Database Import │    │ Collector Guide │
│                 │    │     & Sync      │    │    Frontend     │
│ Downloads CSVs  │───▶│                 │───▶│                 │
│ from Rebrickable│    │ Syncs to Postgres│    │ React Frontend  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📦 Components

### 1. CSV Fetcher (`apps/fetcher/`)
Downloads LEGO data CSVs from Rebrickable daily.

**Features:**
- Downloads 9 CSV files (sets, parts, colors, themes, etc.)
- Handles gzipped files automatically
- Logs download success/failure
- Stores files in `data/latest/`

**Usage:**
```bash
cd apps/fetcher
npm install
npm start
```

### 2. Database Importer (`apps/importer/`)
Imports CSV data into PostgreSQL with upsert logic.

**Features:**
- Idempotent imports (handles duplicates)
- Batch processing for performance
- Import logging and statistics
- Database migration support

**Usage:**
```bash
cd apps/importer
npm install
npm run migrate  # First time setup
npm start        # Import data
```

### 3. Collector Guide (`apps/guide/`)
React frontend for browsing and managing collections.

**Features:**
- Browse sets by year, theme, parts count
- Detailed set views with parts and minifigs
- Collection tracking (localStorage)
- Affiliate link tracking
- Responsive design

**Usage:**
```bash
# Frontend
cd apps/guide
npm install
npm run dev

# API Server
cd apps/guide/api
npm install
npm run dev
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+

### Setup
1. **Clone and setup:**
   ```bash
   git clone <repo>
   cd lego-collector
   cp .env.example .env
   # Edit .env with your database credentials
   ```

2. **Setup database:**
   ```bash
   createdb lego_collector
   cd apps/importer
   npm install
   npm run migrate
   ```

3. **Download data:**
   ```bash
   cd apps/fetcher
   npm install
   npm start
   ```

4. **Import data:**
   ```bash
   cd apps/importer
   npm start
   ```

5. **Start frontend:**
   ```bash
   # Terminal 1: API Server
   cd apps/guide/api
   npm install
   npm run dev

   # Terminal 2: Frontend
   cd apps/guide
   npm install
   npm run dev
   ```

6. **Open browser:** http://localhost:3000

## 📊 Database Schema

The database contains:
- **Sets:** LEGO set information (name, year, parts count, etc.)
- **Parts:** Individual LEGO elements with colors
- **Minifigs:** Minifigure data
- **Themes:** Set theme hierarchy
- **Inventories:** Set contents (parts and minifigs)
- **Users & Collections:** User accounts and owned sets
- **Analytics:** Affiliate click tracking

## 🔧 Configuration

Key environment variables:
- `DB_*`: Database connection settings
- `CSV_SOURCE_URL`: Rebrickable download URL
- `PORT`: Frontend port (default: 3000)
- `API_PORT`: API server port (default: 3001)

## 📱 Features

### For Visitors
- Browse all LEGO sets
- Filter by year, theme, part count
- View detailed set information
- See parts and minifigures included

### For Collectors
- Track owned sets locally
- Collection statistics
- Export/import collection data
- Purchase links with affiliate tracking

### For Developers
- Modular architecture
- RESTful API
- PostgreSQL with proper indexing
- React with modern hooks

## 🖼️ Image Handling

- Primary: Rebrickable CDN URLs
- Fallback: Local placeholder images
- Future: Local image caching

## 💰 Monetization

- Affiliate links to Amazon and LEGO Shop
- Click tracking for analytics
- Future: AdSense integration

## 🚀 Deployment Options

### Local Development
- PostgreSQL + React dev server
- All data stored locally

### Cloud Deployment (Future)
- Migrate to Supabase for database
- Deploy frontend to Vercel
- Use environment variables to toggle configs

## 📋 Scripts

```bash
# Data Management
npm run fetch-data    # Download latest CSVs
npm run import-data   # Import to database
npm run sync-data     # Fetch + Import

# Development
npm run dev           # Start all services
npm run build         # Build for production
npm run migrate       # Run database migrations
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Attribution

Data provided by [Rebrickable](https://rebrickable.com/) under their terms of service. Images and data are used with attribution as permitted.

## 🚀 Production Deployment

For production deployment to lego.collector.guide, see [DEPLOYMENT.md](./DEPLOYMENT.md) for complete setup instructions including:

- Supabase database configuration
- Vercel hosting setup  
- GitHub Actions CI/CD
- Custom domain configuration
- SSL certificates
- Automated data syncing

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Development
cp .env.example .env

# Production (set in Vercel dashboard)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_AMAZON_AFFILIATE_TAG=your-amazon-tag
```

## 🧱 Your LEGO Collector is Ready!

- **Local Development**: http://localhost:3000
- **Production**: https://lego.collector.guide (after deployment)

Ready for deployment to production! 🚀

Live at: https://lego-collector-guide-34dy50l0i-andrew-molloys-projects.vercel.app

## 📋 Current Task List (Claude Context)

### ✅ Completed Tasks
- [x] Fixed missing minifig photos (now uses placeholder-minifig.jpg as final fallback)
- [x] Hide "Parts:" label when no parts exist (shows "Sticker Book" instead)  
- [x] Set up GitHub Actions for automated daily data syncing
- [x] Fixed critical bug in minifig image import (CSV column mapping: img_url vs fig_img_url)

### 🔄 In Progress
- None

### 📝 Pending Tasks  
- [ ] Run data import to update minifig images in database
- [ ] Test minifig image display in production
- [ ] Add error handling for failed image loads in SetCard component
- [ ] Implement local image caching strategy
- [ ] Add analytics dashboard for affiliate link performance
- [ ] Optimize database queries for large datasets
- [ ] Add user authentication and personal collections
- [ ] Implement advanced search and filtering

### 🚧 Technical Debt
- [ ] Replace SVG fallbacks with proper placeholder images
- [ ] Optimize bundle size and implement code splitting
- [ ] Add comprehensive error boundaries
- [ ] Improve accessibility (ARIA labels, keyboard navigation)
- [ ] Add TypeScript for better type safety

### 💡 Feature Ideas
- [ ] Dark mode toggle
- [ ] Set comparison tool
- [ ] Wishlist functionality
- [ ] Price tracking integration
- [ ] Mobile app (React Native)
- [ ] Inventory management for parts

---

*Note: This task list helps maintain context across Claude sessions. Update this section when starting new work or completing tasks.*