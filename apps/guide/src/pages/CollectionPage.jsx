import { useState, useEffect } from 'react'
import SetCard from '../components/SetCard'
import { useSupabaseCollection } from '../hooks/useSupabaseCollection'

function CollectionPage() {
  const [ownedSetsDetails, setOwnedSetsDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { ownedSets, toggleOwned } = useSupabaseCollection()

  useEffect(() => {
    const fetchOwnedSetsDetails = async () => {
      if (ownedSets.length === 0) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch('/api/sets/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ setNums: ownedSets })
        })
        
        if (!response.ok) throw new Error('Failed to fetch collection details')
        const data = await response.json()
        setOwnedSetsDetails(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOwnedSetsDetails()
  }, [ownedSets])

  const totalParts = ownedSetsDetails.reduce((sum, set) => sum + (set.num_parts || 0), 0)
  const totalSets = ownedSets.length

  if (loading) return <div className="loading">Loading your collection...</div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div>
      <h1 style={{ marginBottom: '24px', color: '#333' }}>My Collection</h1>
      
      {totalSets > 0 && (
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '32px'
        }}>
          <h3 style={{ marginBottom: '16px', color: '#333' }}>Collection Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                {totalSets.toLocaleString()}
              </div>
              <div style={{ color: '#666' }}>Sets Owned</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                {totalParts.toLocaleString()}
              </div>
              <div style={{ color: '#666' }}>Total Parts</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                {totalSets > 0 ? Math.round(totalParts / totalSets) : 0}
              </div>
              <div style={{ color: '#666' }}>Avg Parts/Set</div>
            </div>
          </div>
        </div>
      )}

      {totalSets === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '16px', color: '#666' }}>Your collection is empty</h3>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Start building your collection by browsing and adding LEGO sets!
          </p>
          <a href="/sets" className="btn" style={{ fontSize: '16px', padding: '12px 24px' }}>
            Browse Sets
          </a>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2>Your Sets ({totalSets})</h2>
            <div>
              <button 
                onClick={() => {
                  const data = JSON.stringify(ownedSets, null, 2)
                  const blob = new Blob([data], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'lego-collection.json'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="btn btn-secondary"
              >
                Export Collection
              </button>
            </div>
          </div>
          
          <div className="grid grid-3">
            {ownedSetsDetails.map(set => (
              <SetCard
                key={set.set_num}
                set={set}
                isOwned={true}
                onToggleOwned={toggleOwned}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CollectionPage