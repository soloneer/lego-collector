import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'

function Header() {
  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            🧱 LEGO Collector
          </Link>
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/sets">Browse Sets</Link>
            <Link to="/collection">My Collection</Link>
            
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: '#666' }}>
                  Welcome, {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '14px' }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn"
                style={{ padding: '6px 12px', fontSize: '14px' }}
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </div>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  )
}

export default Header