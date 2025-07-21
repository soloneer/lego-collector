import { useState, useEffect } from 'react'
import SetCard from '../components/SetCard'
import { useSupabaseCollection } from '../hooks/useSupabaseCollection'

function SetsPage() {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    year: '',
    theme: '',
    minParts: '',
    maxParts: ''
  })
  const [themes, setThemes] = useState([])
  const { ownedSets, toggleOwned } = useSupabaseCollection()

  const ITEMS_PER_PAGE = 50

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch('/api/themes')
        if (!response.ok) throw new Error('Failed to fetch themes')
        const data = await response.json()
        setThemes(data)
      } catch (err) {
        console.error('Error fetching themes:', err)
      }
    }

    fetchThemes()
  }, [])

  useEffect(() => {
    const fetchSets = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value)
        })
        
        params.append('limit', ITEMS_PER_PAGE)
        params.append('offset', (currentPage - 1) * ITEMS_PER_PAGE)
        
        const response = await fetch(`/api/sets?${params}`)
        if (!response.ok) throw new Error('Failed to fetch sets')
        const data = await response.json()
        setSets(data.sets || data) // Handle both old and new response format
        setTotalResults(data.total || data.length)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSets, 300)
    return () => clearTimeout(debounceTimer)
  }, [filters, currentPage])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE)

  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        gap: '8px',
        marginTop: '32px',
        marginBottom: '32px'
      }}>
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="btn btn-secondary"
          style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
        >
          Previous
        </button>
        
        <span style={{ color: '#666', fontSize: '14px' }}>
          Page {currentPage} of {totalPages} ({totalResults.toLocaleString()} sets)
        </span>
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="btn btn-secondary"
          style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px', color: '#333' }}>Browse LEGO Sets</h1>
      
      <div className="filters">
        <h3>Filters</h3>
        <div className="filter-group">
          <div>
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search sets..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div>
            <label>Year:</label>
            <input
              type="number"
              placeholder="Year"
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
            />
          </div>
          <div>
            <label>Theme:</label>
            <select
              value={filters.theme}
              onChange={(e) => handleFilterChange('theme', e.target.value)}
            >
              <option value="">All Themes</option>
              {themes.map((themeName, index) => (
                <option key={index} value={themeName}>
                  {themeName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Min Parts:</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.minParts}
              onChange={(e) => handleFilterChange('minParts', e.target.value)}
            />
          </div>
          <div>
            <label>Max Parts:</label>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxParts}
              onChange={(e) => handleFilterChange('maxParts', e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading && <div className="loading">Loading sets...</div>}
      {error && <div className="error">Error: {error}</div>}
      
      {!loading && !error && (
        <>
          {renderPagination()}
          
          <div className="grid grid-3">
            {sets.map(set => (
              <SetCard
                key={set.set_num}
                set={set}
                isOwned={ownedSets.includes(set.set_num)}
                onToggleOwned={toggleOwned}
                showQuickBuy={true}
              />
            ))}
          </div>
          
          {renderPagination()}
        </>
      )}
      
      {!loading && !error && sets.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
          No sets found matching your criteria.
        </p>
      )}
    </div>
  )
}

export default SetsPage