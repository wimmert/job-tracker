import pb from './pocketbase'
import { 
  User, 
  Company, 
  Job, 
  UserCompany, 
  JobApplication, 
  JobWithApplication,
  FilterOptions 
} from '../types'

// PocketBase API implementation
class PocketBaseAPI {
  // Companies
  async getTrackedCompanies(userId: string): Promise<UserCompany[]> {
    try {
      console.log('🔄 Fetching tracked companies from PocketBase...')
      
      const records = await pb.collection('userCompanies').getList(1, 50, {
        filter: `user = "${userId}"`,
        expand: 'company',
        sort: 'priority'
      })
      
      console.log('✅ PocketBase companies fetched:', records.items.length)
      return records.items as UserCompany[]
    } catch (error) {
      console.error('❌ Error fetching companies from PocketBase:', error)
      throw new Error('Failed to fetch companies from PocketBase')
    }
  }

  async getAllCompanies(): Promise<Company[]> {
    try {
      console.log('🔄 Fetching all companies from PocketBase...')
      
      const records = await pb.collection('companies').getFullList({
        filter: 'status = "active"',
        sort: 'name'
      })
      
      console.log('✅ PocketBase all companies fetched:', records.items.length)
      return records as Company[]
    } catch (error) {
      console.error('❌ Error fetching all companies from PocketBase:', error)
      throw new Error('Failed to fetch companies from PocketBase')
    }
  }

  async addTrackedCompany(userId: string, companyId: string, priority?: number): Promise<UserCompany> {
    try {
      console.log('🔄 Adding tracked company to PocketBase...')
      
      const data = {
        user: userId,
        company: companyId,
        priority: priority || 1,
        notifications: true,
        addedAt: new Date().toISOString()
      }
      
      const record = await pb.collection('userCompanies').create(data, {
        expand: 'company'
      })
      
      console.log('✅ Company added to PocketBase')
      return record as UserCompany
    } catch (error) {
      console.error('❌ Error adding company to PocketBase:', error)
      throw new Error('Failed to add company to PocketBase')
    }
  }

  async removeTrackedCompany(userId: string, userCompanyId: string): Promise<void> {
    try {
      console.log('🔄 Removing tracked company from PocketBase...')
      
      await pb.collection('userCompanies').delete(userCompanyId)
      
      console.log('✅ Company removed from PocketBase')
    } catch (error) {
      console.error('❌ Error removing company from PocketBase:', error)
      throw new Error('Failed to remove company from PocketBase')
    }
  }

  // Jobs
  async getJobs(userId: string, filters?: FilterOptions): Promise<JobWithApplication[]> {
    try {
      console.log('🔄 Fetching jobs from PocketBase for user:', userId)
      
      // Get user's tracked companies first
      const userCompanies = await this.getTrackedCompanies(userId)
      const trackedCompanyIds = userCompanies.map(uc => uc.company)
      
      if (trackedCompanyIds.length === 0) {
        console.log('📝 No tracked companies found, returning empty jobs list')
        return []
      }
      
      // Build filter for tracked companies
      const companyFilter = trackedCompanyIds.map(id => `company = "${id}"`).join(' || ')
      let filter = `(${companyFilter}) && status = "active"`
      
      // Apply additional filters if provided
      if (filters) {
        if (filters.companies.length > 0) {
          const selectedCompanies = filters.companies.map(name => `company.name = "${name}"`).join(' || ')
          filter += ` && (${selectedCompanies})`
        }
        
        if (filters.search) {
          filter += ` && (title ~ "${filters.search}" || description ~ "${filters.search}")`
        }
        
        if (filters.departments.length > 0) {
          const departments = filters.departments.map(dept => `department = "${dept}"`).join(' || ')
          filter += ` && (${departments})`
        }
        
        if (filters.locations.length > 0) {
          const locations = filters.locations.map(loc => `location ~ "${loc}"`).join(' || ')
          filter += ` && (${locations})`
        }
        
        if (filters.jobTypes.length > 0) {
          const jobTypes = filters.jobTypes.map(type => `jobType = "${type}"`).join(' || ')
          filter += ` && (${jobTypes})`
        }
        
        if (filters.experienceLevels.length > 0) {
          const levels = filters.experienceLevels.map(level => `experienceLevel = "${level}"`).join(' || ')
          filter += ` && (${levels})`
        }
      }
      
      console.log('🔍 PocketBase jobs filter:', filter)
      
      const records = await pb.collection('jobs').getList(1, 100, {
        filter,
        expand: 'company',
        sort: '-firstSeenAt'
      })
      
      console.log('📊 PocketBase jobs fetched:', records.items.length)
      
      // Get applications for this user
      const applications = await pb.collection('jobApplications').getList(1, 100, {
        filter: `user = "${userId}"`,
      })
      
      console.log('📊 PocketBase applications fetched:', applications.items.length)
      
      // Combine jobs with applications
      const jobsWithApplications = records.items.map(job => ({
        ...job,
        application: applications.items.find(app => app.job === job.id)
      })) as JobWithApplication[]
      
      console.log('✅ PocketBase jobs fetched:', jobsWithApplications.length)
      return jobsWithApplications
    } catch (error) {
      console.error('❌ Error fetching jobs from PocketBase:', error)
      throw new Error('Failed to fetch jobs from PocketBase')
    }
  }

  // Applications
  async updateApplicationStage(userId: string, jobId: string, stage: string, notes?: string): Promise<JobApplication> {
    try {
      console.log('🔄 Updating application stage in PocketBase...')
      
      // Check if application exists
      const existingApps = await pb.collection('job_applications').getList(1, 1, {
        filter: `user = "${userId}" && job = "${jobId}"`
      })
      
      const now = new Date().toISOString()
      const stageEntry = { stage, date: now, notes: notes || '' }
      
      if (existingApps.items.length > 0) {
        // Update existing application
        const existing = existingApps.items[0]
        const updatedData = {
          stage,
          appliedAt: stage === 'applied' && !existing.appliedAt ? now : existing.appliedAt,
          notes: notes || existing.notes,
          stageHistory: [...(existing.stageHistory || []), stageEntry],
          updated: now
        }
        
        const record = await pb.collection('job_applications').update(existing.id, updatedData)
        console.log('✅ Application updated in PocketBase')
        return record as JobApplication
      } else {
        // Create new application
        const newData = {
          user: userId,
          job: jobId,
          stage,
          appliedAt: stage === 'applied' ? now : null,
          notes: notes || null,
          stageHistory: [stageEntry]
        }
        
        const record = await pb.collection('job_applications').create(newData)
        console.log('✅ Application created in PocketBase')
        return record as JobApplication
      }
    } catch (error) {
      console.error('❌ Error updating application in PocketBase:', error)
      throw new Error('Failed to update application in PocketBase')
    }
  }

  async getApplications(userId: string): Promise<JobApplication[]> {
    try {
      console.log('🔄 Fetching applications from PocketBase for user:', userId)
      
      const records = await pb.collection('job_applications').getFullList({
        filter: `user = "${userId}"`,
        expand: 'job,job.company',
        sort: '-updated'
      })
      
      console.log('✅ PocketBase applications fetched:', records.length)
      return records as JobApplication[]
    } catch (error) {
      console.error('❌ Error fetching applications from PocketBase:', error)
      throw new Error('Failed to fetch applications from PocketBase')
    }
  }

  async updateApplicationNotes(userId: string, applicationId: string, notes: string): Promise<JobApplication> {
    try {
      console.log('🔄 Updating application notes in PocketBase...')
      
      const updatedData = {
        notes,
        updated: new Date().toISOString()
      }
      
      const record = await pb.collection('job_applications').update(applicationId, updatedData)
      console.log('✅ Application notes updated in PocketBase')
      return record as JobApplication
    } catch (error) {
      console.error('❌ Error updating application notes in PocketBase:', error)
      throw new Error('Failed to update application notes in PocketBase')
    }
  }

  async deleteApplication(userId: string, applicationId: string): Promise<void> {
    try {
      console.log('🔄 Deleting application from PocketBase...')
      
      await pb.collection('job_applications').delete(applicationId)
      
      console.log('✅ Application deleted from PocketBase')
    } catch (error) {
      console.error('❌ Error deleting application from PocketBase:', error)
      throw new Error('Failed to delete application from PocketBase')
    }
  }

  // Dashboard Stats
  async getDashboardStats(userId: string) {
    try {
      console.log('🔄 Fetching dashboard stats from PocketBase...')
      
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

      const stats = {
        totalJobs: jobs.length,
        newThisWeek,
        applications: appliedJobs,
        companies: userCompanies.length,
        inProgress: interviewStage,
        responseRate: appliedJobs > 0 ? Math.round((interviewStage / appliedJobs) * 100) : 0
      }

      console.log('✅ PocketBase dashboard stats calculated')
      return stats
    } catch (error) {
      console.error('❌ Error fetching dashboard stats from PocketBase:', error)
      throw new Error('Failed to fetch dashboard stats from PocketBase')
    }
  }

  // Analytics
  async getAnalytics(userId: string) {
    try {
      console.log('🔄 Fetching analytics from PocketBase...')
      
      const [applications, jobs, userCompanies] = await Promise.all([
        this.getApplications(userId),
        this.getJobs(userId),
        this.getTrackedCompanies(userId)
      ])
      
      // Calculate job trends from real data
      const jobTrends = this.calculateJobTrends(jobs)
      
      // Calculate company hiring from real data
      const companyHiring = this.calculateCompanyHiring(jobs, userCompanies)
      
      // Calculate location distribution from real data
      const locationDistribution = this.calculateLocationDistribution(jobs)
      
      // Calculate department breakdown from real data
      const departmentBreakdown = this.calculateDepartmentBreakdown(jobs)
      
      const analytics = {
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

      console.log('✅ PocketBase analytics calculated')
      return analytics
    } catch (error) {
      console.error('❌ Error fetching analytics from PocketBase:', error)
      throw new Error('Failed to fetch analytics from PocketBase')
    }
  }

  private calculateJobTrends(jobs: any[]) {
    // Group jobs by date and calculate trends
    const dateGroups: { [key: string]: { newJobs: number, applications: number } } = {}
    
    // Initialize last 20 days
    for (let i = 19; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dateGroups[dateStr] = { newJobs: 0, applications: 0 }
    }
    
    // Count jobs by first seen date
    jobs.forEach(job => {
      const jobDate = new Date(job.firstSeenAt).toISOString().split('T')[0]
      if (dateGroups[jobDate]) {
        dateGroups[jobDate].newJobs++
      }
      
      // Count applications
      if (job.application && job.application.appliedAt) {
        const appDate = new Date(job.application.appliedAt).toISOString().split('T')[0]
        if (dateGroups[appDate]) {
          dateGroups[appDate].applications++
        }
      }
    })
    
    return Object.entries(dateGroups).map(([date, data]) => ({
      date,
      newJobs: data.newJobs,
      applications: data.applications
    }))
  }

  private calculateCompanyHiring(jobs: any[], userCompanies: any[]) {
    const companyJobCounts: { [key: string]: number } = {}
    
    // Count jobs per company
    jobs.forEach(job => {
      const companyName = job.expand?.company?.name || job.company
      if (companyName) {
        companyJobCounts[companyName] = (companyJobCounts[companyName] || 0) + 1
      }
    })
    
    // Calculate growth (mock calculation for now)
    return Object.entries(companyJobCounts).map(([company, jobCount]) => ({
      company,
      jobs: jobCount,
      growth: Math.floor(Math.random() * 25) + 5 // Mock growth percentage
    }))
  }

  private calculateLocationDistribution(jobs: any[]) {
    const locationCounts: { [key: string]: number } = {}
    
    jobs.forEach(job => {
      const location = job.location
      if (location) {
        // Normalize location names
        let normalizedLocation = location
        if (location.toLowerCase().includes('remote')) {
          normalizedLocation = 'Remote'
        } else if (location.includes(',')) {
          normalizedLocation = location.split(',')[0].trim()
        }
        
        locationCounts[normalizedLocation] = (locationCounts[normalizedLocation] || 0) + 1
      }
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
    try {
      console.log('🔄 Updating user preferences in PocketBase...')
      
      const record = await pb.collection('users').update(userId, {
        preferences,
        updated: new Date().toISOString()
      })
      
      console.log('✅ User preferences updated in PocketBase')
      return record as User
    } catch (error) {
      console.error('❌ Error updating user preferences in PocketBase:', error)
      throw new Error('Failed to update user preferences in PocketBase')
    }
  }
}

export const pocketbaseAPI = new PocketBaseAPI()