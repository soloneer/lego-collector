import { useState, useEffect } from 'react'

export function useCollection() {
  const [ownedSets, setOwnedSets] = useState([])

  useEffect(() => {
    const savedCollection = localStorage.getItem('lego-collection')
    if (savedCollection) {
      try {
        setOwnedSets(JSON.parse(savedCollection))
      } catch (error) {
        console.error('Error loading collection from localStorage:', error)
        setOwnedSets([])
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('lego-collection', JSON.stringify(ownedSets))
  }, [ownedSets])

  const toggleOwned = (setNum) => {
    setOwnedSets(prev => {
      if (prev.includes(setNum)) {
        return prev.filter(s => s !== setNum)
      } else {
        return [...prev, setNum]
      }
    })
  }

  const addToCollection = (setNum) => {
    setOwnedSets(prev => {
      if (!prev.includes(setNum)) {
        return [...prev, setNum]
      }
      return prev
    })
  }

  const removeFromCollection = (setNum) => {
    setOwnedSets(prev => prev.filter(s => s !== setNum))
  }

  const clearCollection = () => {
    setOwnedSets([])
  }

  const importCollection = (setNums) => {
    if (Array.isArray(setNums)) {
      setOwnedSets(setNums)
    }
  }

  return {
    ownedSets,
    toggleOwned,
    addToCollection,
    removeFromCollection,
    clearCollection,
    importCollection
  }
}