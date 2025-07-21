import { mockAPI } from './mockApi'
import { pocketbaseAPI } from './pocketbaseApi'
import { 
  User, 
  Company, 
  Job, 
  UserCompany, 
  JobApplication, 
  JobWithApplication,
  FilterOptions 
} from '../types'

type DataMode = 'mock' | 'pocketbase'

// Dual-mode API that switches between mock and PocketBase
class DualModeAPI {
  private dataMode: DataMode = 'mock'

  setDataMode(mode: DataMode) {
    this.dataMode = mode
    console.log(`🔄 Data mode switched to: ${mode}`)
  }

  getDataMode(): DataMode {
    return this.dataMode
  }

  private getAPI() {
    return this.dataMode === 'pocketbase' ? pocketbaseAPI : mockAPI
  }

  private async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    if (this.dataMode === 'mock') {
      console.log(`📝 Using mock data for: ${operationName}`)
      return fallbackOperation()
    }

    try {
      console.log(`🔄 Attempting PocketBase operation: ${operationName}`)
      const result = await operation()
      console.log(`✅ PocketBase operation successful: ${operationName}`)
      return result
    } catch (error) {
      console.warn(`⚠️ PocketBase operation failed for ${operationName}, falling back to mock data:`, error)
      return fallbackOperation()
    }
  }

  // Companies
  async getTrackedCompanies(userId: string): Promise<UserCompany[]> {
    return this.executeWithFallback(
      () => pocketbaseAPI.getTrackedCompanies(userId),
      () => mockAPI.getTrackedCompanies(userId),
      'getTrackedCompanies'
    )
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.executeWithFallback(
      () => pocketbaseAPI.getAllCompanies(),
      () => mockAPI.getAllCompanies(),
      'getAllCompanies'
    )
  }

  async addTrackedCompany(userId: string, companyId: string, priority?: number): Promise<UserCompany> {
    return this.executeWithFallback(
      () => pocketbaseAPI.addTrackedCompany(userId, companyId, priority),
      () => mockAPI.addTrackedCompany(userId, companyId, priority),
      'addTrackedCompany'
    )
  }

  async removeTrackedCompany(userId: string, userCompanyId: string): Promise<void> {
    return this.executeWithFallback(
      () => pocketbaseAPI.removeTrackedCompany(userId, userCompanyId),
      () => mockAPI.removeTrackedCompany(userId, userCompanyId),
      'removeTrackedCompany'
    )
  }

  async updateCompanyPriority(userId: string, userCompanyId: string, priority: number): Promise<void> {
    return this.executeWithFallback(
      () => Promise.resolve(), // PocketBase implementation would go here
      () => mockAPI.updateCompanyPriority(userId, userCompanyId, priority),
      'updateCompanyPriority'
    )
  }

  // Jobs
  async getJobs(userId: string, filters?: FilterOptions): Promise<JobWithApplication[]> {
    return this.executeWithFallback(
      () => pocketbaseAPI.getJobs(userId, filters),
      () => mockAPI.getJobs(userId, filters),
      'getJobs'
    )
  }

  // Job Applications
  async updateApplicationStage(userId: string, jobId: string, stage: string, notes?: string): Promise<JobApplication> {
    return this.executeWithFallback(
      () => pocketbaseAPI.updateApplicationStage(userId, jobId, stage, notes),
      () => mockAPI.updateApplicationStage(userId, jobId, stage, notes),
      'updateApplicationStage'
    )
  }

  async getApplications(userId: string): Promise<JobApplication[]> {
    return this.executeWithFallback(
      () => pocketbaseAPI.getApplications(userId),
      () => mockAPI.getApplications(userId),
      'getApplications'
    )
  }

  async updateApplicationNotes(userId: string, applicationId: string, notes: string): Promise<JobApplication> {
    return this.executeWithFallback(
      () => pocketbaseAPI.updateApplicationNotes(userId, applicationId, notes),
      () => mockAPI.updateApplicationNotes(userId, applicationId, notes),
      'updateApplicationNotes'
    )
  }

  async deleteApplication(userId: string, applicationId: string): Promise<void> {
    return this.executeWithFallback(
      () => pocketbaseAPI.deleteApplication(userId, applicationId),
      () => mockAPI.deleteApplication(userId, applicationId),
      'deleteApplication'
    )
  }

  // Dashboard Stats
  async getDashboardStats(userId: string) {
    return this.executeWithFallback(
      () => pocketbaseAPI.getDashboardStats(userId),
      () => mockAPI.getDashboardStats(userId),
      'getDashboardStats'
    )
  }

  // Analytics
  async getAnalytics(userId: string) {
    return this.executeWithFallback(
      () => pocketbaseAPI.getAnalytics(userId),
      () => mockAPI.getAnalytics(userId),
      'getAnalytics'
    )
  }

  // User Preferences
  async updateUserPreferences(userId: string, preferences: any): Promise<User> {
    return this.executeWithFallback(
      () => pocketbaseAPI.updateUserPreferences(userId, preferences),
      () => mockAPI.updateUserPreferences(userId, preferences),
      'updateUserPreferences'
    )
  }

  // Add scraped jobs
  async addScrapedJobs(userId: string, companyName: string, newJobs: any[]): Promise<number> {
    return this.executeWithFallback(
      () => Promise.resolve(0), // PocketBase implementation would go here
      () => mockAPI.addScrapedJobs(userId, companyName, newJobs),
      'addScrapedJobs'
    )
  }

  // Remove oldest jobs for a company
  async removeOldestJobs(companyName: string, count: number): Promise<number> {
    return this.executeWithFallback(
      () => Promise.resolve(0), // PocketBase implementation would go here
      () => mockAPI.removeOldestJobs(companyName, count),
      'removeOldestJobs'
    )
  }

  // Debug methods
  async clearAllUserData(userId: string): Promise<void> {
    return this.executeWithFallback(
      () => Promise.resolve(), // PocketBase implementation would go here
      () => mockAPI.clearAllUserData(userId),
      'clearAllUserData'
    )
  }

  async resetUserData(userId: string): Promise<void> {
    return this.executeWithFallback(
      () => Promise.resolve(), // PocketBase implementation would go here
      () => mockAPI.resetUserData(userId),
      'resetUserData'
    )
  }
}

export const dualModeAPI = new DualModeAPI()