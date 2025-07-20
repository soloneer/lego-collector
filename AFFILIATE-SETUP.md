# 💰 Multi-Region Affiliate Setup Guide

This guide helps you set up affiliate accounts across different regions to maximize revenue and provide the best user experience.

## 🌍 Supported Regions

The system automatically detects users' regions and directs them to appropriate stores:

| Region | Amazon Domain | LEGO Store | Detection Methods |
|--------|---------------|------------|-------------------|
| 🇺🇸 US | amazon.com | lego.com/en-us | Default, en-US language |
| 🇬🇧 UK | amazon.co.uk | lego.com/en-gb | en-GB language, Europe/London timezone |
| 🇩🇪 DE | amazon.de | lego.com/de-de | German language, German timezone |
| 🇫🇷 FR | amazon.fr | lego.com/fr-fr | French language, Paris timezone |
| 🇮🇹 IT | amazon.it | lego.com/it-it | Italian language, Italian timezone |
| 🇪🇸 ES | amazon.es | lego.com/es-es | Spanish language, Madrid timezone |
| 🇨🇦 CA | amazon.ca | lego.com/en-ca | Canadian language, Canadian timezone |
| 🇦🇺 AU | amazon.com.au | lego.com/en-au | Australian language/timezone |
| 🇯🇵 JP | amazon.co.jp | lego.com/ja-jp | Japanese language, Tokyo timezone |

## 🛒 Amazon Associates Setup

### Priority Regions (Highest Revenue Potential)

**1. Amazon UK (amazon.co.uk)**
- Higher commission rates than US for many categories
- Strong LEGO market
- **Setup**: [associates.amazon.co.uk](https://associates.amazon.co.uk)
- **Commission**: Typically 4-8% for toys

**2. Amazon US (amazon.com)**
- Largest market, highest volume
- **Setup**: [associates.amazon.com](https://associates.amazon.com)
- **Commission**: Typically 3-6% for toys

**3. Amazon DE (amazon.de)**
- Strong German/European market
- **Setup**: [partnernet.amazon.de](https://partnernet.amazon.de)
- **Commission**: Similar to UK rates

### Application Process

1. **Apply to each region separately** - each has its own application
2. **Use the same website** (lego.collector.guide) for all applications
3. **Wait for approval** (usually 1-3 days)
4. **Get your associate tags** for each region

### Commission Rates by Region

| Region | Typical Toy Commission | Application Difficulty |
|--------|----------------------|----------------------|
| UK | 4-8% | Easy |
| DE | 4-7% | Easy |
| US | 3-6% | Medium |
| CA | 3-5% | Easy |
| FR | 3-6% | Easy |
| IT | 3-6% | Easy |
| ES | 3-6% | Easy |
| AU | 2-5% | Medium |
| JP | 2-4% | Hard (Japanese required) |

## 🧱 LEGO VIP Affiliate Program

LEGO doesn't have a traditional affiliate program, but they do have:

1. **LEGO VIP Program** - Users get points for purchases
2. **Educational/Bulk Sales** - Contact LEGO directly for partnerships
3. **Content Creator Programs** - For YouTubers/bloggers

**Alternative**: Focus on Amazon affiliates for LEGO purchases, as many users prefer Amazon's shipping/returns.

## ⚙️ Configuration

### Environment Variables

Set these in your Vercel dashboard (or local `.env`):

```bash
# Required - Start with these
VITE_AMAZON_US_TAG=yoursite-20
VITE_AMAZON_UK_TAG=yoursite-21

# Add as you get approved
VITE_AMAZON_DE_TAG=yoursite-de-21
VITE_AMAZON_FR_TAG=yoursite-fr-21
VITE_AMAZON_CA_TAG=yoursite-ca-20
# ... etc
```

### Progressive Rollout Strategy

**Week 1**: Apply to UK and US (highest priority)
```bash
VITE_AMAZON_US_TAG=yoursite-20
VITE_AMAZON_UK_TAG=yoursite-21
```

**Week 2**: Add major EU markets
```bash
VITE_AMAZON_DE_TAG=yoursite-de-21
VITE_AMAZON_FR_TAG=yoursite-fr-21
```

**Week 3**: Complete coverage
```bash
# Add remaining regions as approved
```

## 📊 Expected Revenue Impact

### Before Multi-Region (US only):
- UK visitor clicks Amazon link → Goes to amazon.com
- Poor conversion (shipping costs, currency)
- Lost commission opportunity

### After Multi-Region:
- UK visitor clicks Amazon link → Goes to amazon.co.uk
- Better conversion (local shipping, GBP pricing)
- Higher commission rates
- **Estimated 3-5x revenue increase**

## 🎯 Revenue Projections

**Conservative Estimates (1,000 daily visitors):**

| Region | % of Traffic | Clicks/Day | Conversion | Avg Commission | Daily Revenue |
|--------|-------------|------------|------------|----------------|---------------|
| US | 40% | 12 | 2% | $3.00 | $0.72 |
| UK | 25% | 8 | 3% | $4.00 | $0.96 |
| DE | 15% | 5 | 2.5% | $3.50 | $0.44 |
| CA | 10% | 3 | 2% | $2.50 | $0.15 |
| Other | 10% | 3 | 1.5% | $2.00 | $0.09 |
| **Total** | | | | | **$2.36/day** |

**Monthly**: ~$70
**Annual**: ~$850

*Scale proportionally with traffic growth*

## 🔧 Testing & Optimization

### Test Your Setup

1. **Change browser language** to different regions
2. **Use VPN** to test from different countries  
3. **Check affiliate links** go to correct domains
4. **Verify commission tracking** in each affiliate dashboard

### Optimization Tips

1. **Track performance by region** in affiliate dashboards
2. **A/B test button placement** for different cultures
3. **Adjust product recommendations** by region (popular sets vary)
4. **Consider currency display** for better UX

## 🚨 Common Issues & Solutions

### "Links Going to Wrong Region"

**Problem**: Users seeing wrong Amazon domain
**Solution**: Check browser language detection logic
```javascript
// Test detection
console.log(navigator.language)
console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)
```

### "Low Conversion Rates"

**Problem**: Users not completing purchases
**Solutions**:
- Ensure correct currency/language
- Add region selector for manual override
- Show local shipping information

### "Affiliate Rejections"

**Problem**: Applications getting rejected
**Solutions**:
- Ensure site has substantial content
- Add privacy policy and terms
- Apply when site has some traffic
- Follow each region's specific guidelines

## 📈 Scaling Strategy

### Phase 1: Foundation (Month 1)
- ✅ Set up US and UK affiliates
- ✅ Implement region detection
- ✅ Test basic functionality

### Phase 2: European Expansion (Month 2)
- ✅ Add DE, FR, IT, ES affiliates
- ✅ Optimize for EU market
- ✅ Add region selector UI

### Phase 3: Global Coverage (Month 3+)
- ✅ Add CA, AU, JP affiliates
- ✅ Advanced analytics and optimization
- ✅ Consider additional affiliate networks

---

💡 **Pro Tip**: Start with UK and US only - they'll generate 80% of your affiliate revenue and are easiest to set up. Add other regions as your traffic grows.