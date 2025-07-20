import { useState, useEffect } from 'react'
import { detectUserRegion } from '../lib/affiliates'

const REGIONS = {
  US: { name: '🇺🇸 United States', flag: '🇺🇸' },
  UK: { name: '🇬🇧 United Kingdom', flag: '🇬🇧' },
  DE: { name: '🇩🇪 Germany', flag: '🇩🇪' },
  FR: { name: '🇫🇷 France', flag: '🇫🇷' },
  IT: { name: '🇮🇹 Italy', flag: '🇮🇹' },
  ES: { name: '🇪🇸 Spain', flag: '🇪🇸' },
  CA: { name: '🇨🇦 Canada', flag: '🇨🇦' },
  AU: { name: '🇦🇺 Australia', flag: '🇦🇺' },
  JP: { name: '🇯🇵 Japan', flag: '🇯🇵' }
}

function RegionSelector({ className = '', compact = false }) {
  const [selectedRegion, setSelectedRegion] = useState(detectUserRegion())
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Save region preference
    localStorage.setItem('lego-collector-region', selectedRegion)
  }, [selectedRegion])

  const handleRegionChange = (region) => {
    setSelectedRegion(region)
    setIsOpen(false)
    // Force refresh of affiliate links by dispatching custom event
    window.dispatchEvent(new CustomEvent('regionChanged', { detail: region }))
  }

  if (compact) {
    return (
      <div className={className} style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'none',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title={`Shopping region: ${REGIONS[selectedRegion]?.name}`}
        >
          {REGIONS[selectedRegion]?.flag} {selectedRegion}
        </button>
        
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
            minWidth: '180px'
          }}>
            {Object.entries(REGIONS).map(([code, region]) => (
              <button
                key={code}
                onClick={() => handleRegionChange(code)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: selectedRegion === code ? '#f0f0f0' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => {
                  if (selectedRegion !== code) e.target.style.background = '#f8f8f8'
                }}
                onMouseOut={(e) => {
                  if (selectedRegion !== code) e.target.style.background = 'white'
                }}
              >
                {region.name}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
        🌍 Shopping Region
      </label>
      <select
        value={selectedRegion}
        onChange={(e) => handleRegionChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px',
          background: 'white'
        }}
      >
        {Object.entries(REGIONS).map(([code, region]) => (
          <option key={code} value={code}>
            {region.name}
          </option>
        ))}
      </select>
      <p style={{ 
        fontSize: '12px', 
        color: '#666', 
        marginTop: '4px',
        fontStyle: 'italic'
      }}>
        This determines which Amazon and LEGO stores you'll be directed to for purchases.
      </p>
    </div>
  )
}

export default RegionSelector