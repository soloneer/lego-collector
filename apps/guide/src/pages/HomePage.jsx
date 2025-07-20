import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SetCard from '../components/SetCard'
import { useSupabaseCollection } from '../hooks/useSupabaseCollection'

function HomePage() {
  const [featuredSets, setFeaturedSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { ownedSets, toggleOwned } = useSupabaseCollection()

  useEffect(() => {
    const fetchFeaturedSets = async () => {
      try {
        const response = await fetch('/api/sets/featured')
        if (!response.ok) throw new Error('Failed to fetch featured sets')
        const data = await response.json()
        setFeaturedSets(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedSets()
  }, [])

  if (loading) return <div className="loading">Loading featured sets...</div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div>
      <section style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px', color: '#333' }}>
          🧱 LEGO Collector Guide
        </h1>
        <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>
          Discover, track, and manage your LEGO collection with comprehensive set data from Rebrickable
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/sets" className="btn" style={{ fontSize: '16px', padding: '12px 24px' }}>
            Browse All Sets
          </Link>
          <Link to="/collection" className="btn btn-secondary" style={{ fontSize: '16px', padding: '12px 24px' }}>
            My Collection
          </Link>
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: '24px', color: '#333' }}>Featured Sets</h2>
        {featuredSets.length > 0 ? (
          <div className="grid grid-4">
            {featuredSets.map(set => (
              <SetCard
                key={set.set_num}
                set={set}
                isOwned={ownedSets.includes(set.set_num)}
                onToggleOwned={toggleOwned}
                showQuickBuy={true}
              />
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
            No featured sets available. Start the backend server to see data.
          </p>
        )}
      </section>
    </div>
  )
}

export default HomePage