import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSupabaseCollection } from '../hooks/useSupabaseCollection'
import AffiliateLinks from '../components/AffiliateLinks'

function SetDetailPage() {
  const { setNum } = useParams()
  const [set, setSet] = useState(null)
  const [parts, setParts] = useState([])
  const [minifigs, setMinifigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const { ownedSets, toggleOwned } = useSupabaseCollection()

  useEffect(() => {
    const fetchSetDetails = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`/api/sets/${setNum}`)
        
        if (!response.ok) {
          throw new Error('Set not found')
        }
        
        const data = await response.json()
        
        setSet(data.set)
        setParts(data.parts || [])
        setMinifigs(data.minifigs || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSetDetails()
  }, [setNum])


  if (loading) return <div className="loading">Loading set details...</div>
  if (error) return <div className="error">Error: {error}</div>
  if (!set) return <div className="error">Set not found</div>

  const isOwned = ownedSets.includes(setNum)
  const imageUrl = set.set_img_url || '/placeholder-set.jpg'

  return (
    <div>
      <Link to="/sets" style={{ color: '#666', marginBottom: '16px', display: 'inline-block' }}>
        ← Back to Sets
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginBottom: '32px' }}>
        <div>
          <img 
            src={imageUrl}
            alt={set.name}
            style={{ width: '100%', borderRadius: '8px' }}
            onError={(e) => {
              e.target.src = '/placeholder-set.jpg'
            }}
          />
        </div>
        <div>
          <h1 style={{ marginBottom: '16px', color: '#333' }}>{set.name}</h1>
          <div style={{ marginBottom: '24px' }}>
            <p><strong>Set Number:</strong> {set.set_num}</p>
            <p><strong>Year:</strong> {set.year}</p>
            <p><strong>Parts:</strong> {set.num_parts}</p>
            <p><strong>Theme:</strong> {set.theme_name || 'Unknown'}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              onClick={() => toggleOwned(setNum)}
              className={`btn ${isOwned ? 'btn-secondary' : ''}`}
            >
              {isOwned ? 'Remove from Collection' : 'Add to Collection'}
            </button>
          </div>

          <AffiliateLinks set={set} featured={true} />
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #ddd', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '12px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '2px solid #e74c3c' : '2px solid transparent',
              color: activeTab === 'overview' ? '#e74c3c' : '#666',
              fontWeight: activeTab === 'overview' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('parts')}
            style={{
              padding: '12px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'parts' ? '2px solid #e74c3c' : '2px solid transparent',
              color: activeTab === 'parts' ? '#e74c3c' : '#666',
              fontWeight: activeTab === 'parts' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            Parts ({parts.length})
          </button>
          <button
            onClick={() => setActiveTab('minifigs')}
            style={{
              padding: '12px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'minifigs' ? '2px solid #e74c3c' : '2px solid transparent',
              color: activeTab === 'minifigs' ? '#e74c3c' : '#666',
              fontWeight: activeTab === 'minifigs' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            Minifigs ({minifigs.length})
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div>
          <h3 style={{ marginBottom: '16px' }}>Set Overview</h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            This LEGO set was released in {set.year} and contains {set.num_parts} pieces. 
            {minifigs.length > 0 && ` It includes ${minifigs.length} minifigure${minifigs.length !== 1 ? 's' : ''}.`}
          </p>
        </div>
      )}

      {activeTab === 'parts' && (
        <div>
          <h3 style={{ marginBottom: '16px' }}>Parts List</h3>
          {parts.length > 0 ? (
            <div style={{ display: 'grid', gap: '8px' }}>
              {parts.map((part, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ width: '40px', height: '40px', marginRight: '12px' }}>
                    {part.image_url && (
                      <img 
                        src={part.image_url}
                        alt={part.part_name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong>{part.part_name}</strong><br />
                    <span style={{ color: '#666' }}>
                      {part.part_num} • {part.color_name} • Qty: {part.quantity}
                      {part.is_spare && ' (Spare)'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666' }}>No parts data available for this set.</p>
          )}
        </div>
      )}

      {activeTab === 'minifigs' && (
        <div>
          <h3 style={{ marginBottom: '16px' }}>Minifigures</h3>
          {minifigs.length > 0 ? (
            <div className="grid grid-4">
              {minifigs.map((minifig, index) => (
                <div key={index} className="card">
                  <img 
                    src={minifig.fig_img_url || '/placeholder-minifig.jpg'}
                    alt={minifig.name}
                    onError={(e) => {
                      e.target.src = '/placeholder-minifig.jpg'
                    }}
                  />
                  <h3>{minifig.name}</h3>
                  <p>
                    {minifig.fig_num}<br />
                    Parts: {minifig.num_parts}<br />
                    Quantity: {minifig.quantity}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666' }}>No minifigures included in this set.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default SetDetailPage