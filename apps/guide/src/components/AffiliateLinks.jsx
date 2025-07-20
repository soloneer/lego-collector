import { generateAffiliateLinks, trackAffiliateClick, getFeaturedAffiliatePartners } from '../lib/affiliates'

function AffiliateLinks({ set, featured = false }) {
  const affiliateLinks = generateAffiliateLinks(set.name, set.set_num)
  
  // Filter to featured partners if requested
  const displayLinks = featured 
    ? affiliateLinks.filter(link => getFeaturedAffiliatePartners(set).includes(link.key))
    : affiliateLinks

  const handleClick = async (partner, url) => {
    await trackAffiliateClick(set.set_num, partner.key, set.name)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>
        {featured ? 'Shop This Set' : 'Purchase Options'}
      </h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: featured ? 'repeat(auto-fit, minmax(140px, 1fr))' : 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '8px'
      }}>
        {displayLinks.map((partner) => (
          <button
            key={partner.key}
            onClick={() => handleClick(partner, partner.url)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: featured ? '12px 16px' : '8px 12px',
              backgroundColor: partner.color,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: featured ? '14px' : '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              textDecoration: 'none'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)'
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >
            <span style={{ fontSize: featured ? '16px' : '14px' }}>{partner.logo}</span>
            <span>{partner.name}</span>
          </button>
        ))}
      </div>
      
      {featured && (
        <p style={{ 
          fontSize: '12px', 
          color: '#666', 
          marginTop: '8px',
          fontStyle: 'italic'
        }}>
          🤝 We earn a small commission from purchases, helping us keep this site free!
        </p>
      )}
    </div>
  )
}

export default AffiliateLinks