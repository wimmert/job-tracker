import { User } from '../types'
import { mockUsers, mockDelay } from './mockData'

// Mock authentication that simulates PocketBase auth
let currentUser: User | null = null

export const auth = {
  // Sign up new user
  signUp: async (email: string, password: string, firstName: string, lastName: string) => {
    await mockDelay()
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const newUser: User = {
      id: `user${Date.now()}`,
      email,
      firstName,
      lastName,
      subscriptionTier: 'free',
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          newJobs: true,
          statusUpdates: true
        }
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }

    mockUsers.push(newUser)
    currentUser = newUser
    
    // Store in localStorage for persistence
    localStorage.setItem('mockUser', JSON.stringify(newUser))
    
    return { user: newUser }
  },

  // Sign in existing user
  signIn: async (email: string, password: string) => {
    await mockDelay()
    
    // For demo purposes, we'll use the default user or create one
    let user = mockUsers.find(u => u.email === email)
    
    if (!user) {
      // Create demo user if not found
      user = {
        id: 'user1',
        email,
        firstName: 'Demo',
        lastName: 'User',
        subscriptionTier: 'premium',
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            newJobs: true,
            statusUpdates: true
          }
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }
      mockUsers.push(user)
    }

    currentUser = user
    localStorage.setItem('mockUser', JSON.stringify(user))
    
    return { user }
  },

  // Sign out
  signOut: async () => {
    await mockDelay(200)
    currentUser = null
    localStorage.removeItem('mockUser')
  },

  // Get current user
  getCurrentUser: () => {
    return currentUser
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return currentUser !== null
  },

  // Refresh authentication
  refresh: async () => {
    await mockDelay(200)
    
    // Try to restore from localStorage
    const stored = localStorage.getItem('mockUser')
    if (stored) {
      try {
        currentUser = JSON.parse(stored)
        return currentUser
      } catch (error) {
        localStorage.removeItem('mockUser')
      }
    }
    
    return null
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<User>) => {
    await mockDelay()
    
    if (!currentUser || currentUser.id !== userId) {
      throw new Error('User not found or not authenticated')
    }

    const updatedUser = { ...currentUser, ...updates, updated: new Date().toISOString() }
    currentUser = updatedUser
    
    // Update in mock data
    const userIndex = mockUsers.findIndex(u => u.id === userId)
    if (userIndex > -1) {
      mockUsers[userIndex] = updatedUser
    }
    
    localStorage.setItem('mockUser', JSON.stringify(updatedUser))
    return updatedUser
  },

  // Listen for auth changes (mock implementation)
  onChange: (callback: (user: User | null) => void) => {
    // In a real implementation, this would listen to auth state changes
    // For mock, we'll just call the callback immediately
    callback(currentUser)
    
    // Return a cleanup function
    return () => {}
  }
}