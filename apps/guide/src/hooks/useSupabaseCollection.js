import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useSupabaseCollection() {
  const { user } = useAuth()
  const [ownedSets, setOwnedSets] = useState([])
  const [loading, setLoading] = useState(false)

  // Load collection from Supabase if user is logged in
  useEffect(() => {
    if (user) {
      loadCollection()
    } else {
      // Fall back to localStorage for anonymous users
      const savedCollection = localStorage.getItem('lego-collection')
      if (savedCollection) {
        try {
          setOwnedSets(JSON.parse(savedCollection))
        } catch (error) {
          console.error('Error loading collection from localStorage:', error)
          setOwnedSets([])
        }
      }
    }
  }, [user])

  // Sync with localStorage for anonymous users
  useEffect(() => {
    if (!user) {
      localStorage.setItem('lego-collection', JSON.stringify(ownedSets))
    }
  }, [ownedSets, user])

  const loadCollection = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_sets')
        .select('set_num, quantity, notes, created_at')
        .eq('user_id', user.id)

      if (error) throw error
      
      setOwnedSets(data.map(item => item.set_num))
    } catch (error) {
      console.error('Error loading collection:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCollection = async (setNum, quantity = 1, notes = '') => {
    if (user) {
      try {
        const { error } = await supabase
          .from('user_sets')
          .upsert({
            user_id: user.id,
            set_num: setNum,
            quantity,
            notes
          })

        if (error) throw error
        
        setOwnedSets(prev => {
          if (!prev.includes(setNum)) {
            return [...prev, setNum]
          }
          return prev
        })
      } catch (error) {
        console.error('Error adding to collection:', error)
      }
    } else {
      // Anonymous user - use localStorage
      setOwnedSets(prev => {
        if (!prev.includes(setNum)) {
          return [...prev, setNum]
        }
        return prev
      })
    }
  }

  const removeFromCollection = async (setNum) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('user_sets')
          .delete()
          .eq('user_id', user.id)
          .eq('set_num', setNum)

        if (error) throw error
        
        setOwnedSets(prev => prev.filter(s => s !== setNum))
      } catch (error) {
        console.error('Error removing from collection:', error)
      }
    } else {
      // Anonymous user - use localStorage
      setOwnedSets(prev => prev.filter(s => s !== setNum))
    }
  }

  const toggleOwned = (setNum) => {
    if (ownedSets.includes(setNum)) {
      removeFromCollection(setNum)
    } else {
      addToCollection(setNum)
    }
  }

  const clearCollection = async () => {
    if (user) {
      try {
        const { error } = await supabase
          .from('user_sets')
          .delete()
          .eq('user_id', user.id)

        if (error) throw error
        
        setOwnedSets([])
      } catch (error) {
        console.error('Error clearing collection:', error)
      }
    } else {
      setOwnedSets([])
    }
  }

  const importCollection = async (setNums) => {
    if (!Array.isArray(setNums)) return

    if (user) {
      try {
        // Clear existing collection
        await clearCollection()
        
        // Add all sets
        const inserts = setNums.map(setNum => ({
          user_id: user.id,
          set_num: setNum,
          quantity: 1
        }))

        const { error } = await supabase
          .from('user_sets')
          .insert(inserts)

        if (error) throw error
        
        setOwnedSets(setNums)
      } catch (error) {
        console.error('Error importing collection:', error)
      }
    } else {
      setOwnedSets(setNums)
    }
  }

  return {
    ownedSets,
    loading,
    toggleOwned,
    addToCollection,
    removeFromCollection,
    clearCollection,
    importCollection
  }
}