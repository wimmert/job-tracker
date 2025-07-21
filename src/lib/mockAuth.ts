import { User } from '../types'
import { mockUsers, mockDelay } from './mockData'

// Mock authentication system using localStorage
class MockAuth {
  private currentUser: User | null = null
  private listeners: ((user: User | null) => void)[] = []

  constructor() {
    // Try to restore user from localStorage on initialization
    this.restoreSession()
  }

  private restoreSession() {
    try {
      const stored = localStorage.getItem('mockUser')
      if (stored) {
        this.currentUser = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error restoring session:', error)
      localStorage.removeItem('mockUser')
    }
  }

  private saveSession(user: User | null) {
    if (user) {
      localStorage.setItem('mockUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('mockUser')
    }
    this.currentUser = user
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser))
  }

  // Sign up new user
  async signUp(email: string, password: string, firstName: string, lastName: string) {
    await mockDelay(800) // Realistic signup delay
    
    // Check if user already exists (in real app)
    const existingUser = mockUsers.find(u => u.email === email)
    if (existingUser && email !== 'demo@example.com') {
      throw new Error('User with this email already exists')
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      firstName,
      lastName,
      subscriptionTier: 'free',
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          newJobs: true,
          statusUpdates: true,
          weeklyDigest: false
        },
        jobAlerts: {
          enabled: true,
          frequency: 'daily',
          keywords: []
        }
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }

    // Add to mock users if not demo user
    if (!mockUsers.find(u => u.id === newUser.id)) {
      mockUsers.push(newUser)
    }
    
    this.saveSession(newUser)
    return { user: newUser }
  }

  // Sign in existing user (accepts any email/password for demo)
  async signIn(email: string, password: string) {
    await mockDelay(600) // Realistic signin delay
    
    // For demo purposes, accept any email/password
    // Use existing demo user or create new one
    let user = mockUsers.find(u => u.email === email)
    
    if (!user) {
      // Create a new demo user
      user = {
        id: `user_${Date.now()}`,
        email,
        firstName: email.split('@')[0].split('.')[0] || 'Demo',
        lastName: 'User',
        subscriptionTier: Math.random() > 0.5 ? 'premium' : 'free',
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            newJobs: true,
            statusUpdates: true,
            weeklyDigest: true
          },
          jobAlerts: {
            enabled: true,
            frequency: 'daily',
            keywords: ['frontend', 'backend', 'fullstack']
          }
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }
      mockUsers.push(user)
    }

    this.saveSession(user)
    return { user }
  }

  // Sign out
  async signOut() {
    await mockDelay(200)
    this.saveSession(null)
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null
  }

  // Refresh authentication (check localStorage)
  async refresh() {
    await mockDelay(100)
    this.restoreSession()
    return this.currentUser
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>) {
    await mockDelay(400)
    
    if (!this.currentUser || this.currentUser.id !== userId) {
      throw new Error('User not found or not authenticated')
    }

    const updatedUser = { 
      ...this.currentUser, 
      ...updates, 
      updated: new Date().toISOString() 
    }
    
    // Update in mock data
    const userIndex = mockUsers.findIndex(u => u.id === userId)
    if (userIndex > -1) {
      mockUsers[userIndex] = updatedUser
    }
    
    this.saveSession(updatedUser)
    return updatedUser
  }

  // Listen for auth changes
  onChange(callback: (user: User | null) => void) {
    this.listeners.push(callback)
    
    // Call immediately with current state
    callback(this.currentUser)
    
    // Return cleanup function
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }
}

export const mockAuth = new MockAuth()