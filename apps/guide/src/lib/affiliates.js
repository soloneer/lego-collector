// Region-specific affiliate configuration
const AMAZON_REGIONS = {
  US: { domain: 'amazon.com', tag: import.meta.env.VITE_AMAZON_US_TAG || 'legoguide-20' },
  UK: { domain: 'amazon.co.uk', tag: import.meta.env.VITE_AMAZON_UK_TAG || 'legoguide-21' },
  DE: { domain: 'amazon.de', tag: import.meta.env.VITE_AMAZON_DE_TAG || 'legoguide-21' },
  FR: { domain: 'amazon.fr', tag: import.meta.env.VITE_AMAZON_FR_TAG || 'legoguide-21' },
  IT: { domain: 'amazon.it', tag: import.meta.env.VITE_AMAZON_IT_TAG || 'legoguide-21' },
  ES: { domain: 'amazon.es', tag: import.meta.env.VITE_AMAZON_ES_TAG || 'legoguide-21' },
  CA: { domain: 'amazon.ca', tag: import.meta.env.VITE_AMAZON_CA_TAG || 'legoguide-20' },
  AU: { domain: 'amazon.com.au', tag: import.meta.env.VITE_AMAZON_AU_TAG || 'legoguide-20' },
  JP: { domain: 'amazon.co.jp', tag: import.meta.env.VITE_AMAZON_JP_TAG || 'legoguide-22' }
}

const LEGO_REGIONS = {
  US: 'https://www.lego.com/en-us',
  UK: 'https://www.lego.com/en-gb', 
  DE: 'https://www.lego.com/de-de',
  FR: 'https://www.lego.com/fr-fr',
  IT: 'https://www.lego.com/it-it',
  ES: 'https://www.lego.com/es-es',
  CA: 'https://www.lego.com/en-ca',
  AU: 'https://www.lego.com/en-au',
  JP: 'https://www.lego.com/ja-jp'
}

// Detect user's region based on various signals
export const detectUserRegion = () => {
  // Try multiple detection methods
  const browserLang = navigator.language || navigator.userLanguage
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  
  // Map browser language to region
  const langToRegion = {
    'en-GB': 'UK', 'en-gb': 'UK',
    'de': 'DE', 'de-DE': 'DE', 'de-de': 'DE',
    'fr': 'FR', 'fr-FR': 'FR', 'fr-fr': 'FR',
    'it': 'IT', 'it-IT': 'IT', 'it-it': 'IT', 
    'es': 'ES', 'es-ES': 'ES', 'es-es': 'ES',
    'en-CA': 'CA', 'en-ca': 'CA', 'fr-CA': 'CA',
    'en-AU': 'AU', 'en-au': 'AU',
    'ja': 'JP', 'ja-JP': 'JP', 'ja-jp': 'JP'
  }
  
  // Map timezone to region (rough approximation)
  const timezoneToRegion = {
    'Europe/London': 'UK',
    'Europe/Berlin': 'DE', 'Europe/Vienna': 'DE', 'Europe/Zurich': 'DE',
    'Europe/Paris': 'FR', 'Europe/Brussels': 'FR',
    'Europe/Rome': 'IT', 'Europe/Milan': 'IT',
    'Europe/Madrid': 'ES', 'Europe/Barcelona': 'ES',
    'America/Toronto': 'CA', 'America/Vancouver': 'CA',
    'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU',
    'Asia/Tokyo': 'JP', 'Asia/Osaka': 'JP'
  }
  
  // Check stored preference first
  const stored = localStorage.getItem('lego-collector-region')
  if (stored && AMAZON_REGIONS[stored]) return stored
  
  // Try language detection
  if (langToRegion[browserLang]) return langToRegion[browserLang]
  
  // Try timezone detection
  if (timezoneToRegion[timezone]) return timezoneToRegion[timezone]
  
  // Default to US
  return 'US'
}

// Affiliate link configuration
export const AFFILIATE_PARTNERS = {
  amazon: {
    name: 'Amazon',
    logo: '🛒',
    color: '#ff9900',
    buildUrl: (setName, setNum, region = null) => {
      const userRegion = region || detectUserRegion()
      const amazonConfig = AMAZON_REGIONS[userRegion] || AMAZON_REGIONS.US
      const query = encodeURIComponent(`LEGO ${setName} ${setNum}`)
      return `https://www.${amazonConfig.domain}/s?k=${query}&tag=${amazonConfig.tag}&ref=sr_adgrp_1`
    }
  },
  legoShop: {
    name: 'LEGO Shop',
    logo: '🧱',
    color: '#e74c3c',
    buildUrl: (setName, setNum, region = null) => {
      const userRegion = region || detectUserRegion()
      const legoBase = LEGO_REGIONS[userRegion] || LEGO_REGIONS.US
      const query = encodeURIComponent(setName)
      return `${legoBase}/search/${query}`
    }
  },
  bricklink: {
    name: 'BrickLink',
    baseUrl: 'https://www.bricklink.com/v2/search.page',
    logo: '🔗',
    color: '#2e86de',
    buildUrl: (setName, setNum) => {
      return `https://www.bricklink.com/v2/search.page?q=${encodeURIComponent(setNum)}`
    }
  },
  brickowl: {
    name: 'Brick Owl',
    baseUrl: 'https://www.brickowl.com/search',
    logo: '🦉',
    color: '#8e44ad',
    buildUrl: (setName, setNum) => {
      return `https://www.brickowl.com/search/catalog?query=${encodeURIComponent(setNum)}`
    }
  }
}

// Track affiliate clicks
export const trackAffiliateClick = async (setNum, partner, setName) => {
  try {
    await fetch('/api/affiliate-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        setNum,
        source: partner,
        setName,
        timestamp: new Date().toISOString(),
        referrer: window.location.href
      })
    })
  } catch (error) {
    console.error('Failed to track affiliate click:', error)
  }
}

// Generate affiliate links for a set
export const generateAffiliateLinks = (setName, setNum, region = null) => {
  const userRegion = region || detectUserRegion()
  return Object.entries(AFFILIATE_PARTNERS).map(([key, partner]) => ({
    key,
    ...partner,
    url: partner.buildUrl(setName, setNum, userRegion),
    region: userRegion
  }))
}

// Get featured affiliate suggestions based on set characteristics
export const getFeaturedAffiliatePartners = (set) => {
  const suggestions = []
  
  // Always suggest LEGO Shop for official sets
  if (set.year >= 2020) {
    suggestions.push('legoShop')
  }
  
  // Suggest Amazon for popular/expensive sets
  if (set.num_parts > 1000 || set.year >= 2022) {
    suggestions.push('amazon')
  }
  
  // Suggest BrickLink for older/retired sets
  if (set.year < 2020) {
    suggestions.push('bricklink')
  }
  
  // Always include Brick Owl as alternative
  suggestions.push('brickowl')
  
  return [...new Set(suggestions)] // Remove duplicates
}