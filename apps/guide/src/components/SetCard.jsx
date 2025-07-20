import { Link } from 'react-router-dom'
import { AFFILIATE_PARTNERS, trackAffiliateClick } from '../lib/affiliates'

function SetCard({ set, isOwned, onToggleOwned, showQuickBuy = false }) {
  const imageUrl = set.set_img_url || '/placeholder-set.jpg'
  
  return (
    <div className="card">
      <img 
        src={imageUrl} 
        alt={set.name}
        onError={(e) => {
          e.target.src = '/placeholder-set.jpg'
        }}
      />
      <h3>{set.name}</h3>
      <p>
        Set: {set.set_num}<br />
        Year: {set.year}<br />
        Parts: {set.num_parts}
      </p>
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: showQuickBuy ? '8px' : '0' }}>
          <Link to={`/set/${set.set_num}`} className="btn">
            View Details
          </Link>
          <button
            onClick={() => onToggleOwned(set.set_num)}
            className={`btn ${isOwned ? 'btn-secondary' : ''}`}
          >
            {isOwned ? 'Remove' : 'Add to Collection'}
          </button>
        </div>
        
        {showQuickBuy && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={async () => {
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
              onClick={async () => {
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