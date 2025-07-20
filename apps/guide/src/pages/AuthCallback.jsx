import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Handle the OAuth callback
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // User is signed in, redirect to home
        navigate('/')
      } else {
        // No session, something went wrong
        navigate('/?error=auth_failed')
      }
    })
  }, [navigate])

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2>Completing sign in...</h2>
      <p>Please wait while we complete your authentication.</p>
    </div>
  )
}

export default AuthCallback