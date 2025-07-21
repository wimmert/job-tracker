import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '../types'
import { mockAuth } from '../lib/mockAuth'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: User }>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ user: User }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<User>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing mock authentication...')
      
      try {
        const currentUser = await mockAuth.refresh()
        setUser(currentUser)
        console.log('✅ Mock authentication initialized')
      } catch (error) {
        console.error('❌ Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const unsubscribe = mockAuth.onChange((user) => {
      setUser(user)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Mock sign in for:', email)
    const result = await mockAuth.signIn(email, password)
    setUser(result.user)
    return result
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    console.log('📝 Mock sign up for:', email)
    const result = await mockAuth.signUp(email, password, firstName, lastName)
    setUser(result.user)
    return result
  }

  const signOut = async () => {
    console.log('🚪 Mock sign out')
    await mockAuth.signOut()
    setUser(null)
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in')
    }

    console.log('📝 Mock profile update for user:', user.id)
    const updatedUser = await mockAuth.updateProfile(user.id, updates)
    setUser(updatedUser)
    return updatedUser
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}