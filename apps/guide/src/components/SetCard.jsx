import { Link } from 'react-router-dom'
import { AFFILIATE_PARTNERS, trackAffiliateClick } from '../lib/affiliates'

function SetCard({ set, isOwned, onToggleOwned, showQuickBuy = false }) {
  const getImageUrl = () => {
    if (!set.set_img_url) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBIMTUwVjEwMEgxNTBWMTUwSDEwMFYxNTBINTBWMTAwSDUwVjUwSDEwMFoiIGZpbGw9IiNFNUU3RUIiLz4KPHA+Tm8gSW1hZ2U8L3A+Cjwvc3ZnPgo='
    }
    return set.set_img_url.startsWith('http') ? set.set_img_url : `https://cdn.rebrickable.com${set.set_img_url}`
  }

  return (
    <div className="card" style={{ position: 'relative' }}>
      {/* Clickable overlay for navigation */}
      <Link 
        to={`/set/${set.set_num}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: '60px', // Stop before buttons area
          zIndex: 1,
          textDecoration: 'none',
          color: 'inherit'
        }}
        aria-label={`View details for ${set.name}`}
      />
      
      <div style={{ 
        width: '100%', 
        height: '200px', 
        backgroundColor: '#f8f8f8',
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <img 
          src={getImageUrl()} 
          alt={set.name}
          onError={(e) => {
            if (!e.target.dataset.fallbackTried) {
              e.target.dataset.fallbackTried = 'true'
              e.target.src = `https://img.bricklink.com/ItemImage/SN/0/${set.set_num}.jpg`
            } else if (!e.target.dataset.fallbackTried2) {
              e.target.dataset.fallbackTried2 = 'true'
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBIMTUwVjEwMEgxNTBWMTUwSDEwMFYxNTBINTBWMTAwSDUwVjUwSDEwMFoiIGZpbGw9IiNFNUU3RUIiLz4KPHRleHQgeD0iMTAwIiB5PSIxMjAiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo='
            }
          }}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain'
          }}
        />
      </div>
      <h3>{set.name}</h3>
      <p>
        Set: {set.set_num}<br />
        Year: {set.year}<br />
{set.num_parts > 0 && `Parts: ${set.num_parts}`}
      </p>
      <div style={{ marginTop: '12px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: showQuickBuy ? '8px' : '0' }}>
          <Link to={`/set/${set.set_num}`} className="btn">
            View Details
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault()
              onToggleOwned(set.set_num)
            }}
            className={`btn ${isOwned ? 'btn-secondary' : ''}`}
          >
            {isOwned ? 'Remove' : 'Add to Collection'}
          </button>
        </div>
        
        {showQuickBuy && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                await trackAffiliateClick(set.set_num, 'amazon', set.name)
                window.open(AFFILIATE_PARTNERS.amazon.buildUrl(set.name, set.set_num), '_blank')
              }}
              style={{
                flex: 1,
                padding: '4px 8px',
                backgroundColor: AFFILIATE_PARTNERS.amazon.color,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              🛒 Amazon
            </button>
            <button
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                await trackAffiliateClick(set.set_num, 'ebay', set.name)
                window.open(AFFILIATE_PARTNERS.ebay.buildUrl(set.name, set.set_num), '_blank')
              }}
              style={{
                flex: 1,
                padding: '4px 8px',
                backgroundColor: AFFILIATE_PARTNERS.ebay.color,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              🏷️ eBay
            </button>
            <button
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                await trackAffiliateClick(set.set_num, 'legoShop', set.name)
                window.open(AFFILIATE_PARTNERS.legoShop.buildUrl(set.name, set.set_num), '_blank')
              }}
              style={{
                flex: 1,
                padding: '4px 8px',
                backgroundColor: AFFILIATE_PARTNERS.legoShop.color,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              🧱 LEGO
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SetCard