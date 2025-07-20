// Affiliate link configuration
export const AFFILIATE_PARTNERS = {
  amazon: {
    name: 'Amazon',
    baseUrl: 'https://www.amazon.com/s',
    logo: '🛒',
    color: '#ff9900',
    buildUrl: (setName, setNum) => {
      const query = encodeURIComponent(`LEGO ${setName} ${setNum}`)
      const tag = import.meta.env.VITE_AMAZON_AFFILIATE_TAG || 'legoguide-20'
      return `https://www.amazon.com/s?k=${query}&tag=${tag}&ref=sr_adgrp_1`
    }
  },
  legoShop: {
    name: 'LEGO Shop',
    baseUrl: 'https://www.lego.com/search',
    logo: '🧱',
    color: '#e74c3c',
    buildUrl: (setName, setNum) => {
      const query = encodeURIComponent(setName)
      return `https://www.lego.com/search/${query}`
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
export const generateAffiliateLinks = (setName, setNum) => {
  return Object.entries(AFFILIATE_PARTNERS).map(([key, partner]) => ({
    key,
    ...partner,
    url: partner.buildUrl(setName, setNum)
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