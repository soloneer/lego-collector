import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import SetsPage from './pages/SetsPage'
import SetDetailPage from './pages/SetDetailPage'
import CollectionPage from './pages/CollectionPage'
import AuthCallback from './pages/AuthCallback'

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Header />
        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/sets" element={<SetsPage />} />
              <Route path="/set/:setNum" element={<SetDetailPage />} />
              <Route path="/collection" element={<CollectionPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}

export default App