export type SubscriptionTier = 'free' | 'premium'

export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship'

export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'staff' | 'principal'

export type JobStatus = 'active' | 'closed' | 'filled'

export type ApplicationStage = 'not_applied' | 'applied' | 'phone_screen' | 'interview' | 'final_round' | 'offer' | 'rejected'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  subscriptionTier: SubscriptionTier
  preferences: {
    theme: 'light' | 'dark'
    notifications: {
      email: boolean
      newJobs: boolean
      statusUpdates: boolean
      weeklyDigest: boolean
    }
    jobAlerts: {
      enabled: boolean
      frequency: 'daily' | 'weekly'
      keywords: string[]
    }
  }
  timezone: string
  created: string
  updated: string
}

export interface Company {
  id: string
  name: string
  slug: string
  careerPageUrl: string
  industry: string
  headquarters: string
  status: 'active' | 'inactive'
  scrapingConfig: any
  logoUrl: string | null
  description?: string
  size?: string
  founded?: string
  website?: string
  created: string
  updated: string
}

export interface Job {
  id: string
  company: string
  title: string
  department: string
  location: string
  jobType: JobType
  experienceLevel: ExperienceLevel
  description: string
  applicationUrl: string
  status: JobStatus
  firstSeenAt: string
  lastSeenAt: string
  daysPosted: number
  salaryMin: number | null
  salaryMax: number | null
  requirements?: string[]
  benefits?: string[]
  created: string
  updated: string
  expand?: {
    company?: Company
  }
}

export interface UserCompany {
  id: string
  user: string
  company: string
  priority: number
  notifications: boolean
  addedAt: string
  created: string
  updated: string
  expand?: {
    company?: Company
  }
}

export interface JobApplication {
  id: string
  user: string
  job: string
  stage: ApplicationStage
  appliedAt: string | null
  notes: string | null
  stageHistory: Array<{
    stage: string
    date: string
    notes: string
  }>
  created: string
  updated: string
  expand?: {
    job?: Job
  }
}

export interface JobWithApplication extends Job {
  application?: JobApplication
}

export interface FilterOptions {
  companies: string[]
  locations: string[]
  departments: string[]
  jobTypes: JobType[]
  experienceLevels: ExperienceLevel[]
  search: string
}

export interface Theme {
  isDark: boolean
}