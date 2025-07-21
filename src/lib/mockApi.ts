import { 
  User, 
  Company, 
  Job, 
  UserCompany, 
  JobApplication, 
  JobWithApplication,
  FilterOptions 
} from '../types'
import { 
  mockUsers, 
  mockCompanies, 
  mockJobs, 
  mockUserCompanies, 
  mockJobApplications,
  getJobsWithApplications,
  mockAnalyticsData,
  mockDelay 
} from './mockData'

// Enhanced mock API with localStorage persistence
class MockAPI {
  private jobsStorageKey = 'mock_jobs_global'
  
  constructor() {
    // Load jobs from localStorage on startup
    this.loadJobsFromStorage()
  }
  
  private loadJobsFromStorage() {
    try {
      const stored = localStorage.getItem(this.jobsStorageKey)
      if (stored) {
        const storedJobs = JSON.parse(stored)
        // Merge stored jobs with default mock jobs, avoiding duplicates
        const existingIds = new Set(mockJobs.map(job => job.id))
        const newJobs = storedJobs.filter((job: any) => !existingIds.has(job.id))
        mockJobs.push(...newJobs)
        console.log(`📦 Loaded ${newJobs.length} additional jobs from localStorage`)
      }
    } catch (error) {
      console.warn('Failed to load jobs from localStorage:', error)
    }
  }
  
  private saveJobsToStorage() {
    try {
      // Only save jobs that were added after initial load (have scraped flag or recent dates)
      const jobsToSave = mockJobs.filter(job => 
        job.created && new Date(job.created) > new Date('2024-01-19T00:00:00Z')
      )
      localStorage.setItem(this.jobsStorageKey, JSON.stringify(jobsToSave))
      console.log(`💾 Saved ${jobsToSave.length} jobs to localStorage`)
    } catch (error) {
      console.warn('Failed to save jobs to localStorage:', error)
    }
  }

  private getStorageKey(key: string, userId?: string) {
    return userId ? `mock_${key}_${userId}` : `mock_${key}`
  }

  private loadFromStorage<T>(key: string, defaultValue: T, userId?: string): T {
    try {
      const stored = localStorage.getItem(this.getStorageKey(key, userId))
      if (!stored) {
        console.log(`📦 No stored data for ${key}, using default`)
        return defaultValue
      }
      
      const parsed = JSON.parse(stored)
      
      // Validate data structure for userCompanies
      if (key === 'userCompanies' && Array.isArray(parsed)) {
        const validCompanies = parsed.filter(uc => 
          uc && typeof uc === 'object' && uc.id && uc.user && uc.company
        )
        
        if (validCompanies.length !== parsed.length) {
          console.warn(`⚠️ Found ${parsed.length - validCompanies.length} corrupted company entries, cleaning up`)
          this.saveToStorage(key, validCompanies, userId)
          return validCompanies as T
        }
      }
      
      console.log(`📦 Loaded ${key} from localStorage:`, Array.isArray(parsed) ? `${parsed.length} items` : 'data')
      return parsed
    } catch {
      console.warn(`⚠️ Failed to parse localStorage data for ${key}, using default`)
      return defaultValue
    }
  }

  private saveToStorage<T>(key: string, data: T, userId?: string) {
    try {
      const storageKey = this.getStorageKey(key, userId)
      localStorage.setItem(storageKey, JSON.stringify(data))
      console.log(`💾 Saved ${key} to localStorage:`, Array.isArray(data) ? `${data.length} items` : 'data')
    } catch (error) {
      console.error(`❌ Failed to save ${key} to localStorage:`, error)
    }
  }

  // Companies
  async getTrackedCompanies(userId: string): Promise<UserCompany[]> {
    await mockDelay()
    const userCompanies = this.loadFromStorage('userCompanies', mockUserCompanies, userId)
    
    console.log('🔍 DEBUG getTrackedCompanies - userId:', userId)
    console.log('🔍 DEBUG getTrackedCompanies - loadFromStorage result:', userCompanies)
    console.log('🔍 DEBUG getTrackedCompanies - loadFromStorage length:', userCompanies.length)
    console.log('🔍 DEBUG getTrackedCompanies - mockUserCompanies default length:', mockUserCompanies.length)
    
    console.log('🔍 DEBUG - Full loadFromStorage data:', JSON.stringify(userCompanies, null, 2))
    console.log('🔍 DEBUG - Company IDs in userCompanies:', userCompanies.map(uc => uc.company))
    console.log('🔍 DEBUG - Available company IDs in mockCompanies:', mockCompanies.map(c => c.id))
    
    const filtered = userCompanies.filter(uc => uc.user === userId)
    console.log('🔍 DEBUG getTrackedCompanies - after filter:', filtered)
    console.log('🔍 DEBUG getTrackedCompanies - filtered length:', filtered.length)
    
    return userCompanies
      .filter(uc => uc.user === userId)
      .map(uc => ({
        ...uc,
        expand: {
          company: mockCompanies.find(c => c.id === uc.company)
        }
      }))
      .map((result, index) => {
        console.log(`🔍 DEBUG getTrackedCompanies - result[${index}]:`, result.expand?.company?.name)
        return result
      })
      .sort((a, b) => a.priority - b.priority)
  }

  async getAllCompanies(): Promise<Company[]> {
    await mockDelay()
    return mockCompanies.filter(c => c.status === 'active')
  }

  async addTrackedCompany(userId: string, companyId: string, priority?: number): Promise<UserCompany> {
    await mockDelay()
    
    const company = mockCompanies.find(c => c.id === companyId)
    if (!company) throw new Error('Company not found')
    
    const userCompanies = this.loadFromStorage('userCompanies', mockUserCompanies, userId)
    
    // Check if already tracking
    const existing = userCompanies.find(uc => uc.user === userId && uc.company === companyId)
    if (existing) {
      throw new Error('Already tracking this company')
    }

    const maxPriority = Math.max(...userCompanies.filter(uc => uc.user === userId).map(uc => uc.priority), 0)
    
    const newUserCompany: UserCompany = {
      id: `uc_${Date.now()}`,
      user: userId,
      company: companyId,
      priority: priority || maxPriority + 1,
      notifications: true,
      addedAt: new Date().toISOString(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      expand: { company }
    }
    
    userCompanies.push(newUserCompany)
    this.saveToStorage('userCompanies', userCompanies, userId)
    
    return newUserCompany
  }

  // Clear all user data from localStorage (for debugging)
  async clearAllUserData(userId: string): Promise<void> {
    await mockDelay(200)
    
    console.log(`🗑️ Clearing all localStorage data for user: ${userId}`)
    
    // Clear all user-specific data
    localStorage.removeItem(this.getStorageKey('userCompanies', userId))
    localStorage.removeItem(this.getStorageKey('applications', userId))
    localStorage.removeItem('mockUser')
    localStorage.removeItem(this.jobsStorageKey)
    
    console.log('✅ All user data cleared from localStorage')
  }

  // Reset user data to original mock data
  async resetUserData(userId: string): Promise<void> {
    await mockDelay(200)
    
    console.log(`🔄 Resetting user data to original mock data for user: ${userId}`)
    
    // Clear existing data
    await this.clearAllUserData(userId)
    
    // Reset to original mock data
    const originalUserCompanies = mockUserCompanies.filter(uc => uc.user === userId)
    this.saveToStorage('userCompanies', originalUserCompanies, userId)
    
    const originalApplications = mockJobApplications.filter(app => app.user === userId)
    this.saveToStorage('applications', originalApplications, userId)
    
    console.log(`✅ User data reset complete. ${originalUserCompanies.length} companies, ${originalApplications.length} applications`)
  }

  async removeTrackedCompany(userId: string, userCompanyId: string): Promise<void> {
    await mockDelay()
    
    console.log(`🗑️ Removing tracked company: ${userCompanyId} for user: ${userId}`)
    
    const userCompanies = this.loadFromStorage('userCompanies', mockUserCompanies, userId)
    console.log(`📊 Before removal: ${userCompanies.length} companies`)
    
    const filtered = userCompanies.filter(uc => uc.id !== userCompanyId)
    console.log(`📊 After filtering: ${filtered.length} companies`)
    
    this.saveToStorage('userCompanies', filtered, userId)
    
    // Verify the save worked
    const verification = this.loadFromStorage('userCompanies', [], userId)
    console.log(`✅ Verification: ${verification.length} companies in localStorage`)
  }

  async updateCompanyPriority(userId: string, userCompanyId: string, priority: number): Promise<void> {
    await mockDelay()
    
    const userCompanies = this.loadFromStorage('userCompanies', mockUserCompanies, userId)
    const company = userCompanies.find(uc => uc.id === userCompanyId)
    if (company) {
      company.priority = priority
      company.updated = new Date().toISOString()
      this.saveToStorage('userCompanies', userCompanies, userId)
    }
  }

  // Add scraped jobs to the system
  async addScrapedJobs(userId: string, companyName: string, newJobs: any[]): Promise<number> {
    await mockDelay(200)
    
    console.log(`🔄 Adding ${newJobs.length} scraped jobs for ${companyName}`)
    
    // Find the company to get proper company data
    const company = mockCompanies.find(c => c.name === companyName)
    if (!company) {
      console.warn(`Company ${companyName} not found in mockCompanies`)
      return 0
    }
    
    // Convert scraped jobs to proper Job format
    const formattedJobs = newJobs.map((job, index) => ({
      id: `scraped_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
      company: companyName,
      title: job.title,
      department: job.department,
      location: job.location,
      jobType: job.jobType || 'full_time',
      experienceLevel: job.experienceLevel || 'mid',
      description: job.description,
      applicationUrl: job.applicationUrl || `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com/careers`,
      status: 'active',
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      daysPosted: 0,
      salaryMin: job.salaryMin || null,
      salaryMax: job.salaryMax || null,
      requirements: job.requirements || [],
      benefits: job.benefits || [],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      expand: {
        company: company
      }
    }))
    
    // Add jobs to the global mockJobs array
    mockJobs.push(...formattedJobs)
    
    // Save to localStorage for persistence
    this.saveJobsToStorage()
    
    console.log(`✅ Added ${formattedJobs.length} jobs to mockJobs array`)
    console.log(`📊 Total jobs in system: ${mockJobs.length}`)
    
    return formattedJobs.length
  }

  // Add scraped jobs to the system
  async addScrapedJobs(userId: string, companyName: string, newJobs: any[]): Promise<number> {
    await mockDelay(200)
    
    console.log(`🔄 Adding ${newJobs.length} scraped jobs for ${companyName}`)
    
    // Find the company to get proper company data
    const company = mockCompanies.find(c => c.name === companyName)
    if (!company) {
      console.warn(`Company ${companyName} not found in mockCompanies`)
      return 0
    }
    
    // Convert scraped jobs to proper Job format
    const formattedJobs = newJobs.map((job, index) => ({
      id: `scraped_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
      company: companyName,
      title: job.title,
      department: job.department,
      location: job.location,
      jobType: job.jobType || 'full_time',
      experienceLevel: job.experienceLevel || 'mid',
      description: job.description,
      applicationUrl: job.applicationUrl || `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com/careers`,
      status: 'active',
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      daysPosted: 0,
      salaryMin: job.salaryMin || null,
      salaryMax: job.salaryMax || null,
      requirements: job.requirements || [],
      benefits: job.benefits || [],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      expand: {
        company: company
      }
    }))
    
    // Add jobs to the global mockJobs array
    mockJobs.push(...formattedJobs)
    
    // Save to localStorage for persistence
    this.saveJobsToStorage()
    
    console.log(`✅ Added ${formattedJobs.length} jobs to mockJobs array`)
    console.log(`📊 Total jobs in system: ${mockJobs.length}`)
    
    return formattedJobs.length
  }

  // Remove oldest jobs for a specific company
  async removeOldestJobs(companyName: string, count: number): Promise<number> {
    await mockDelay(200)
    
    console.log(`🗑️ Removing ${count} oldest jobs for ${companyName}`)
    
    // Find jobs for this company, sorted by creation date (oldest first)
    const companyJobs = mockJobs
      .filter(job => job.company === companyName)
      .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
    
    const jobsToRemove = companyJobs.slice(0, count)
    const removedIds = jobsToRemove.map(job => job.id)
    
    // Remove jobs from the global mockJobs array
    const initialLength = mockJobs.length
    for (let i = mockJobs.length - 1; i >= 0; i--) {
      if (removedIds.includes(mockJobs[i].id)) {
        mockJobs.splice(i, 1)
      }
    }
    
    const actualRemoved = initialLength - mockJobs.length
    
    // Save to localStorage for persistence
    this.saveJobsToStorage()
    
    console.log(`✅ Removed ${actualRemoved} jobs from mockJobs array`)
    console.log(`📊 Total jobs in system: ${mockJobs.length}`)
    
    return actualRemoved
  }

  // Jobs
  async getJobs(userId: string, filters?: FilterOptions): Promise<JobWithApplication[]> {
    await mockDelay()
    
    // Get user's tracked companies
    const userCompanies = await this.getTrackedCompanies(userId)
    const trackedCompanyIds = userCompanies.map(uc => uc.company)
    
    if (trackedCompanyIds.length === 0) {
      return []
    }

    // Get applications for this user
    const applications = this.loadFromStorage('applications', mockJobApplications, userId)
    
    // Filter jobs by tracked companies
    let filteredJobs = mockJobs
      .filter(job => {
        // Find the company by name since jobs now use company names directly
        const company = mockCompanies.find(c => c.name === job.company)
        return company && trackedCompanyIds.includes(company.id) && job.status === 'active'
      })
      .map(job => ({
        ...job,
        expand: {
          company: mockCompanies.find(c => c.name === job.company)
        },
        application: applications.find(app => app.job === job.id && app.user === userId)
      }))

    // Apply filters if provided
    if (filters) {
      if (filters.companies.length > 0) {
        filteredJobs = filteredJobs.filter(job => filters.companies.includes(job.company))
      }
      
      if (filters.locations.length > 0) {
        filteredJobs = filteredJobs.filter(job => 
          filters.locations.some(location => 
            job.location.toLowerCase().includes(location.toLowerCase()) ||
            location.toLowerCase() === 'remote' && job.location.toLowerCase().includes('remote')
          )
        )
      }
      
      if (filters.departments.length > 0) {
        filteredJobs = filteredJobs.filter(job => filters.departments.includes(job.department))
      }
      
      if (filters.jobTypes.length > 0) {
        filteredJobs = filteredJobs.filter(job => filters.jobTypes.includes(job.jobType))
      }
      
      if (filters.experienceLevels.length > 0) {
        filteredJobs = filteredJobs.filter(job => filters.experienceLevels.includes(job.experienceLevel))
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredJobs = filteredJobs.filter(job =>
          job.title.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.expand?.company?.name.toLowerCase().includes(searchLower) ||
          job.department.toLowerCase().includes(searchLower)
        )
      }
    }

    return filteredJobs.sort((a, b) => new Date(b.firstSeenAt).getTime() - new Date(a.firstSeenAt).getTime())
  }

  // Job Applications
  async updateApplicationStage(userId: string, jobId: string, stage: string, notes?: string): Promise<JobApplication> {
    await mockDelay()
    
    const applications = this.loadFromStorage('applications', mockJobApplications, userId)
    const existingIndex = applications.findIndex(app => 
      app.user === userId && app.job === jobId
    )

    const now = new Date().toISOString()
    const stageEntry = { stage, date: now, notes: notes || '' }

    if (existingIndex > -1) {
      // Update existing application
      const existing = applications[existingIndex]
      const updatedApp: JobApplication = {
        ...existing,
        stage,
        appliedAt: stage === 'applied' && !existing.appliedAt ? now : existing.appliedAt,
        notes: notes || existing.notes,
        stageHistory: [...(existing.stageHistory || []), stageEntry],
        updated: now
      }
      
      applications[existingIndex] = updatedApp
      this.saveToStorage('applications', applications, userId)
      return updatedApp
    } else {
      // Create new application
      const newApp: JobApplication = {
        id: `app_${Date.now()}`,
        user: userId,
        job: jobId,
        stage,
        appliedAt: stage === 'applied' ? now : null,
        notes: notes || null,
        stageHistory: [stageEntry],
        created: now,
        updated: now
      }
      
      applications.push(newApp)
      this.saveToStorage('applications', applications, userId)
      return newApp
    }
  }

  async getApplications(userId: string): Promise<JobApplication[]> {
    await mockDelay()
    const applications = this.loadFromStorage('applications', mockJobApplications, userId)
    return applications
      .filter(app => app.user === userId)
      .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
  }

  async deleteApplication(userId: string, applicationId: string): Promise<void> {
    await mockDelay()
    const applications = this.loadFromStorage('applications', mockJobApplications, userId)
    const filtered = applications.filter(app => app.id !== applicationId)
    this.saveToStorage('applications', filtered, userId)
  }

  async updateApplicationNotes(userId: string, applicationId: string, notes: string): Promise<JobApplication> {
    await mockDelay()
    
    const applications = this.loadFromStorage('applications', mockJobApplications, userId)
    const applicationIndex = applications.findIndex(app => app.id === applicationId)
    
    if (applicationIndex === -1) {
      throw new Error('Application not found')
    }
    
    const updatedApp = {
      ...applications[applicationIndex],
      notes,
      updated: new Date().toISOString()
    }
    
    applications[applicationIndex] = updatedApp
    this.saveToStorage('applications', applications, userId)
    
    return updatedApp
  }

  // Dashboard Stats
  async getDashboardStats(userId: string) {
    await mockDelay()
    
    const [jobs, applications, userCompanies] = await Promise.all([
      this.getJobs(userId),
      this.getApplications(userId),
      this.getTrackedCompanies(userId)
    ])

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const newThisWeek = jobs.filter(job => 
      new Date(job.firstSeenAt) > weekAgo
    ).length

    const appliedJobs = applications.filter(app => app.stage !== 'not_applied').length
    const interviewStage = applications.filter(app => 
      ['phone_screen', 'interview', 'final_round'].includes(app.stage)
    ).length

    return {
      totalJobs: jobs.length,
      newThisWeek,
      applications: appliedJobs,
      companies: userCompanies.length,
      inProgress: interviewStage,
      responseRate: appliedJobs > 0 ? Math.round((interviewStage / appliedJobs) * 100) : 0
    }
  }

  // Analytics
  async getAnalytics(userId: string) {
    await mockDelay()
    
    const [applications, jobs, userCompanies] = await Promise.all([
      this.getApplications(userId),
      this.getJobs(userId),
      this.getTrackedCompanies(userId)
    ])
    
    // Calculate analytics from actual user data
    const jobTrends = this.calculateJobTrends(jobs, applications)
    const companyHiring = this.calculateCompanyHiring(jobs)
    const locationDistribution = this.calculateLocationDistribution(jobs)
    const departmentBreakdown = this.calculateDepartmentBreakdown(jobs)
    
    return {
      jobTrends,
      companyHiring,
      locationDistribution,
      departmentBreakdown,
      userStats: {
        totalApplications: applications.length,
        averageResponseTime: '3.2 days',
        successRate: applications.length > 0 ? Math.round((applications.filter(a => 
          ['interview', 'final_round', 'offer'].includes(a.stage)
        ).length / applications.length) * 100) : 0
      }
    }
  }

  private calculateJobTrends(jobs: any[], applications: any[]) {
    // Generate realistic trends based on actual data
    const trends = []
    const baseJobs = Math.max(1, Math.floor(jobs.length / 20))
    const baseApps = Math.max(0, Math.floor(applications.length / 20))
    
    for (let i = 19; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      trends.push({
        date: dateStr,
        newJobs: baseJobs + Math.floor(Math.random() * 3),
        applications: baseApps + Math.floor(Math.random() * 2)
      })
    }
    
    return trends
  }

  private calculateCompanyHiring(jobs: any[]) {
    const companyJobCounts: { [key: string]: number } = {}
    
    jobs.forEach(job => {
      const companyName = job.expand?.company?.name || job.company
      if (companyName) {
        companyJobCounts[companyName] = (companyJobCounts[companyName] || 0) + 1
      }
    })
    
    return Object.entries(companyJobCounts).map(([company, jobCount]) => ({
      company,
      jobs: jobCount,
      growth: Math.floor(Math.random() * 25) + 5
    }))
  }

  private calculateLocationDistribution(jobs: any[]) {
    const locationCounts: { [key: string]: number } = {}
    
    jobs.forEach(job => {
      let location = job.location
      if (location.toLowerCase().includes('remote')) {
        location = 'Remote'
      } else if (location.includes(',')) {
        location = location.split(',')[0].trim()
      }
      locationCounts[location] = (locationCounts[location] || 0) + 1
    })
    
    return Object.entries(locationCounts).map(([location, count]) => ({
      location,
      count
    }))
  }

  private calculateDepartmentBreakdown(jobs: any[]) {
    const departmentCounts: { [key: string]: number } = {}
    
    jobs.forEach(job => {
      const department = job.department
      if (department) {
        departmentCounts[department] = (departmentCounts[department] || 0) + 1
      }
    })
    
    return Object.entries(departmentCounts).map(([department, count]) => ({
      department,
      count
    }))
  }

  // User Preferences
  async updateUserPreferences(userId: string, preferences: any): Promise<User> {
    await mockDelay()
    
    const user = mockUsers.find(u => u.id === userId)
    if (!user) throw new Error('User not found')
    
    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...preferences },
      updated: new Date().toISOString()
    }
    
    // Update in mock data
    const userIndex = mockUsers.findIndex(u => u.id === userId)
    if (userIndex > -1) {
      mockUsers[userIndex] = updatedUser
    }
    
    // Save to localStorage
    localStorage.setItem('mockUser', JSON.stringify(updatedUser))
    
    return updatedUser
  }
}

export const mockAPI = new MockAPI()