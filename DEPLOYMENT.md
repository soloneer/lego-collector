# 🚀 LEGO Collector Deployment Guide

This guide covers deploying the LEGO Collector application to production using Vercel, Supabase, and GitHub.

## 📋 Prerequisites

- GitHub account
- Vercel account (connected to GitHub)
- Supabase account
- Domain name (lego.collector.guide)

## 🏗️ Production Architecture

```
GitHub Repository → GitHub Actions → Vercel (Frontend + API)
                                 ↓
                               Supabase (Database + Auth)
                                 ↓
                             Custom Domain (lego.collector.guide)
```

## 1️⃣ Supabase Setup

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to your users
3. Set a strong database password
4. Wait for project initialization

### Configure Database Schema

1. Go to SQL Editor in Supabase dashboard
2. Copy the contents of `db/schema.sql`
3. Execute the SQL to create all tables and indexes

### Set up Authentication

1. Go to Authentication → Settings
2. Configure your site URL: `https://lego.collector.guide`
3. Add redirect URLs:
   - `https://lego.collector.guide/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

### Enable Google OAuth (Optional)

1. Go to Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials

### Get API Keys

1. Go to Settings → API
2. Copy the following values:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (for migrations)

## 2️⃣ GitHub Repository Setup

### Create Repository

1. Create a new GitHub repository: `lego-collector`
2. Push your local code to the repository:

```bash
git add .
git commit -m "Initial commit: LEGO Collector app"
git branch -M main
git remote add origin https://github.com/yourusername/lego-collector.git
git push -u origin main
```

### Set up GitHub Secrets

Go to repository Settings → Secrets and Variables → Actions, add:

#### Vercel Secrets
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID  
- `VERCEL_PROJECT_ID` - Vercel project ID

#### Supabase Secrets
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for migrations
- `SUPABASE_ACCESS_TOKEN` - Supabase CLI access token
- `SUPABASE_PROJECT_ID` - Supabase project reference ID

#### Affiliate Secrets
- `VITE_AMAZON_AFFILIATE_TAG` - Your Amazon Associates tag

## 3️⃣ Vercel Setup

### Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. Choose the repository: `lego-collector`
3. Configure build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/guide`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Environment Variables

Add these environment variables in Vercel dashboard:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_AMAZON_AFFILIATE_TAG=your-amazon-tag
```

### Deploy

1. Click "Deploy" - Vercel will build and deploy your app
2. You'll get a URL like: `https://lego-collector-xyz.vercel.app`

## 4️⃣ Domain Configuration

### Add Custom Domain

1. In Vercel dashboard, go to your project
2. Go to Settings → Domains
3. Add your domain: `lego.collector.guide`
4. Configure DNS records as instructed by Vercel

### DNS Setup

Add these DNS records to your domain:

```
Type: A
Name: lego.collector
Value: 76.76.19.61 (Vercel's IP)

Type: CNAME  
Name: www.lego.collector
Value: cname.vercel-dns.com
```

### SSL Certificate

Vercel automatically provisions SSL certificates for custom domains.

## 5️⃣ Data Migration

### Migrate Local Data to Supabase

1. Set environment variables:
```bash
export SUPABASE_URL=your-supabase-url
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

2. Run migration script:
```bash
node scripts/migrate-to-supabase.js
```

3. Verify migration in Supabase dashboard

## 6️⃣ Automated Deployments

The GitHub Actions workflows will:

### On Pull Request
- Run tests
- Deploy preview to Vercel
- Comment with preview URL

### On Main Branch Push
- Run tests
- Deploy to production
- Update Supabase schema
- Sync latest LEGO data

### Daily Data Sync
- Downloads latest CSV data from Rebrickable
- Updates Supabase database
- Creates GitHub issue if sync fails

## 7️⃣ Monitoring & Analytics

### Set up Monitoring

1. **Vercel Analytics**: Enable in project settings
2. **Supabase Monitoring**: Check database usage and API calls
3. **GitHub Issues**: Failed deployments create issues automatically

### Performance Monitoring

- Monitor Vercel function execution times
- Track database query performance in Supabase
- Set up alerts for high error rates

## 8️⃣ Backup Strategy

### Automated Backups

1. Daily database backups via GitHub Actions
2. Store backups in GitHub releases or external storage
3. Test restore procedures monthly

### Manual Backup

```bash
# Local backup
./scripts/backup-database.sh

# Supabase backup (via CLI)
supabase db dump --file backup.sql
```

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set correctly
   - Verify all dependencies are in package.json
   - Check build logs in Vercel dashboard

2. **Database Connection Errors**
   - Verify Supabase URL and keys
   - Check database is active (not paused)
   - Ensure schema is up to date

3. **Authentication Issues**
   - Verify redirect URLs in Supabase
   - Check domain configuration
   - Ensure OAuth providers are configured

### Debug Commands

```bash
# Test local API
curl http://localhost:3001/health

# Test production API  
curl https://lego.collector.guide/api/health

# Check Supabase connection
npx supabase status
```

## 📊 Performance Optimization

### Frontend Optimization
- Enable Vercel Analytics
- Use Vercel Image Optimization for LEGO images
- Implement caching strategies

### Database Optimization
- Monitor slow queries in Supabase
- Add indexes for commonly queried fields
- Use database connection pooling

### CDN & Caching
- Configure Vercel Edge Network
- Cache static assets aggressively
- Implement API response caching

## 🔐 Security Checklist

- [ ] Environment variables secured
- [ ] Database access restricted to necessary IPs
- [ ] API rate limiting configured
- [ ] HTTPS enforced on all endpoints
- [ ] User authentication properly configured
- [ ] No sensitive data in client-side code

## 📈 Scaling Considerations

### Database Scaling
- Monitor Supabase database size and performance
- Consider read replicas for high traffic
- Implement database connection pooling

### API Scaling
- Vercel functions auto-scale
- Monitor function execution limits
- Consider edge functions for global distribution

### CDN & Assets
- Use Vercel Edge Network
- Optimize image delivery
- Implement smart caching strategies

---

🎉 **Congratulations!** Your LEGO Collector app is now live at https://lego.collector.guide

For ongoing maintenance, monitor the GitHub Actions workflows and Vercel/Supabase dashboards regularly.