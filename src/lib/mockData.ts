import { 
  User, 
  Company, 
  Job, 
  UserCompany, 
  JobApplication, 
  JobWithApplication,
  FilterOptions 
} from '../types'

// Mock delay function for realistic API simulation
export const mockDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms))

// Sample Users
export const mockUsers: User[] = [
  {
    id: 'user1',
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'User',
    subscriptionTier: 'premium',
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
    timezone: 'America/Los_Angeles',
    created: '2024-01-01T00:00:00Z',
    updated: '2024-01-19T12:00:00Z'
  }
]

// Sample Companies
export const mockCompanies: Company[] = [
  {
    id: 'Anthropic',
    name: 'Anthropic',
    slug: 'anthropic',
    careerPageUrl: 'https://www.anthropic.com/careers',
    industry: 'AI Safety',
    headquarters: 'San Francisco, CA',
    status: 'active',
    scrapingConfig: {},
    logoUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    description: 'AI safety company focused on developing safe, beneficial AI systems.',
    size: '100-500',
    founded: '2021',
    website: 'https://www.anthropic.com',
    created: '2024-01-01T00:00:00Z',
    updated: '2024-01-19T12:00:00Z'
  },
  {
    id: 'Zipline',
    name: 'Zipline',
    slug: 'zipline',
    careerPageUrl: 'https://www.zipline.com/careers',
    industry: 'Drone Delivery',
    headquarters: 'South San Francisco, CA',
    status: 'active',
    scrapingConfig: {},
    logoUrl: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    description: 'Instant logistics for the world. Delivering medical supplies via autonomous drones.',
    size: '500-1000',
    founded: '2014',
    website: 'https://www.zipline.com',
    created: '2024-01-01T00:00:00Z',
    updated: '2024-01-19T12:00:00Z'
  },
  {
    id: 'Wing',
    name: 'Wing',
    slug: 'wing',
    careerPageUrl: 'https://wing.com/careers',
    industry: 'Autonomous Delivery',
    headquarters: 'Palo Alto, CA',
    status: 'active',
    scrapingConfig: {},
    logoUrl: 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    description: 'Alphabet subsidiary developing autonomous delivery drones for everyday items.',
    size: '200-500',
    founded: '2012',
    website: 'https://wing.com',
    created: '2024-01-01T00:00:00Z',
    updated: '2024-01-19T12:00:00Z'
  },
  {
    id: 'Waymo',
    name: 'Waymo',
    slug: 'waymo',
    careerPageUrl: 'https://waymo.com/careers',
    industry: 'Self-Driving Cars',
    headquarters: 'Mountain View, CA',
    status: 'active',
    scrapingConfig: {},
    logoUrl: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    description: 'Alphabet subsidiary developing autonomous vehicle technology.',
    size: '1000-5000',
    founded: '2009',
    website: 'https://waymo.com',
    created: '2024-01-01T00:00:00Z',
    updated: '2024-01-19T12:00:00Z'
  },
  {
    id: 'Zoox',
    name: 'Zoox',
    slug: 'zoox',
    careerPageUrl: 'https://zoox.com/careers',
    industry: 'Robotaxis',
    headquarters: 'Foster City, CA',
    status: 'active',
    scrapingConfig: {},
    logoUrl: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    description: 'Amazon subsidiary developing fully autonomous robotaxis.',
    size: '1000-2000',
    founded: '2014',
    website: 'https://zoox.com',
    created: '2024-01-01T00:00:00Z',
    updated: '2024-01-19T12:00:00Z'
  },
  {
    id: 'AllTrails',
    name: 'AllTrails',
    slug: 'alltrails',
    careerPageUrl: 'https://www.alltrails.com/careers',
    industry: 'Outdoor Recreation',
    headquarters: 'San Francisco, CA',
    status: 'active',
    scrapingConfig: {},
    logoUrl: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    description: 'Leading platform for outdoor enthusiasts to discover and share trail information.',
    size: '100-500',
    founded: '2010',
    website: 'https://www.alltrails.com',
    created: '2024-01-01T00:00:00Z',
    updated: '2024-01-19T12:00:00Z'
  }
]

// Sample Jobs with company names
export const mockJobs: Job[] = [
  // Anthropic Jobs
  {
    id: 'job1',
    company: 'Anthropic',
    title: 'AI Safety Researcher',
    department: 'Research',
    location: 'San Francisco, CA',
    jobType: 'full_time',
    experienceLevel: 'senior',
    description: 'Join our team to research and develop safe AI systems. Work on alignment, interpretability, and robustness of large language models.',
    applicationUrl: 'https://www.anthropic.com/careers/ai-safety-researcher',
    status: 'active',
    firstSeenAt: '2024-01-15T09:00:00Z',
    lastSeenAt: '2024-01-19T09:00:00Z',
    daysPosted: 4,
    salaryMin: 180000,
    salaryMax: 280000,
    requirements: ['PhD in AI/ML or related field', '3+ years research experience', 'Publications in top-tier venues'],
    benefits: ['Health insurance', 'Equity package', 'Flexible work arrangements'],
    created: '2024-01-15T09:00:00Z',
    updated: '2024-01-19T09:00:00Z'
  },
  {
    id: 'job2',
    company: 'Anthropic',
    title: 'Infrastructure Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    jobType: 'full_time',
    experienceLevel: 'mid',
    description: 'Build and maintain the infrastructure that powers our AI systems. Work with distributed systems, cloud platforms, and ML infrastructure.',
    applicationUrl: 'https://www.anthropic.com/careers/infrastructure-engineer',
    status: 'active',
    firstSeenAt: '2024-01-16T10:00:00Z',
    lastSeenAt: '2024-01-19T10:00:00Z',
    daysPosted: 3,
    salaryMin: 150000,
    salaryMax: 220000,
    requirements: ['5+ years infrastructure experience', 'Experience with Kubernetes', 'Cloud platform expertise'],
    benefits: ['Health insurance', 'Stock options', 'Learning budget'],
    created: '2024-01-16T10:00:00Z',
    updated: '2024-01-19T10:00:00Z'
  },
  // Zipline Jobs
  {
    id: 'job3',
    company: 'Zipline',
    title: 'Robotics Engineer',
    department: 'Engineering',
    location: 'South San Francisco, CA',
    jobType: 'full_time',
    experienceLevel: 'senior',
    description: 'Design and develop autonomous drone systems for medical delivery. Work on flight control, navigation, and safety systems.',
    applicationUrl: 'https://www.zipline.com/careers/robotics-engineer',
    status: 'active',
    firstSeenAt: '2024-01-14T11:00:00Z',
    lastSeenAt: '2024-01-19T11:00:00Z',
    daysPosted: 5,
    salaryMin: 160000,
    salaryMax: 240000,
    requirements: ['MS in Robotics/Aerospace', 'Drone development experience', 'C++/Python proficiency'],
    benefits: ['Health insurance', 'Equity', 'Relocation assistance'],
    created: '2024-01-14T11:00:00Z',
    updated: '2024-01-19T11:00:00Z'
  },
  {
    id: 'job4',
    company: 'Zipline',
    title: 'Flight Software Engineer',
    department: 'Engineering',
    location: 'South San Francisco, CA',
    jobType: 'full_time',
    experienceLevel: 'mid',
    description: 'Develop flight control software for autonomous drones. Implement safety-critical systems and real-time control algorithms.',
    applicationUrl: 'https://www.zipline.com/careers/flight-software-engineer',
    status: 'closed',
    firstSeenAt: '2024-01-10T12:00:00Z',
    lastSeenAt: '2024-01-18T12:00:00Z',
    daysPosted: 8,
    salaryMin: 140000,
    salaryMax: 200000,
    requirements: ['Embedded systems experience', 'Real-time programming', 'Safety-critical software'],
    benefits: ['Health insurance', 'Stock options', 'Flexible PTO'],
    created: '2024-01-10T12:00:00Z',
    updated: '2024-01-18T12:00:00Z'
  },
  // Wing Jobs
  {
    id: 'job5',
    company: 'Wing',
    title: 'Autonomy Engineer',
    department: 'Engineering',
    location: 'Palo Alto, CA',
    jobType: 'full_time',
    experienceLevel: 'senior',
    description: 'Develop autonomous systems for delivery drones. Work on perception, planning, and control systems.',
    applicationUrl: 'https://wing.com/careers/autonomy-engineer',
    status: 'active',
    firstSeenAt: '2024-01-17T13:00:00Z',
    lastSeenAt: '2024-01-19T13:00:00Z',
    daysPosted: 2,
    salaryMin: 170000,
    salaryMax: 260000,
    requirements: ['PhD in Robotics/CS', 'Autonomous systems experience', 'Machine learning background'],
    benefits: ['Google benefits', 'Stock grants', 'Sabbatical program'],
    created: '2024-01-17T13:00:00Z',
    updated: '2024-01-19T13:00:00Z'
  },
  {
    id: 'job6',
    company: 'Wing',
    title: 'Hardware Engineer',
    department: 'Engineering',
    location: 'Palo Alto, CA',
    jobType: 'full_time',
    experienceLevel: 'mid',
    description: 'Design and develop drone hardware systems. Work on mechanical design, electronics, and integration.',
    applicationUrl: 'https://wing.com/careers/hardware-engineer',
    status: 'filled',
    firstSeenAt: '2024-01-12T14:00:00Z',
    lastSeenAt: '2024-01-17T14:00:00Z',
    daysPosted: 5,
    salaryMin: 130000,
    salaryMax: 190000,
    requirements: ['Mechanical/Electrical engineering degree', 'Hardware design experience', 'CAD proficiency'],
    benefits: ['Google benefits', 'Equity', 'Health and wellness'],
    created: '2024-01-12T14:00:00Z',
    updated: '2024-01-17T14:00:00Z'
  },
  // Waymo Jobs
  {
    id: 'job7',
    company: 'Waymo',
    title: 'Perception Engineer',
    department: 'Engineering',
    location: 'Mountain View, CA',
    jobType: 'full_time',
    experienceLevel: 'senior',
    description: 'Develop perception systems for autonomous vehicles. Work with computer vision, sensor fusion, and deep learning.',
    applicationUrl: 'https://waymo.com/careers/perception-engineer',
    status: 'active',
    firstSeenAt: '2024-01-13T15:00:00Z',
    lastSeenAt: '2024-01-19T15:00:00Z',
    daysPosted: 6,
    salaryMin: 180000,
    salaryMax: 300000,
    requirements: ['MS/PhD in Computer Vision', 'Deep learning expertise', 'Autonomous vehicle experience'],
    benefits: ['Google benefits', 'Stock options', 'Transportation'],
    created: '2024-01-13T15:00:00Z',
    updated: '2024-01-19T15:00:00Z'
  },
  {
    id: 'job8',
    company: 'Waymo',
    title: 'Motion Planning Engineer',
    department: 'Engineering',
    location: 'Mountain View, CA',
    jobType: 'full_time',
    experienceLevel: 'senior',
    description: 'Design motion planning algorithms for autonomous vehicles. Work on path planning, trajectory optimization, and behavior prediction.',
    applicationUrl: 'https://waymo.com/careers/motion-planning-engineer',
    status: 'active',
    firstSeenAt: '2024-01-11T16:00:00Z',
    lastSeenAt: '2024-01-19T16:00:00Z',
    daysPosted: 8,
    salaryMin: 175000,
    salaryMax: 290000,
    requirements: ['Robotics/CS background', 'Motion planning experience', 'Optimization algorithms'],
    benefits: ['Google benefits', 'Equity', 'Professional development'],
    created: '2024-01-11T16:00:00Z',
    updated: '2024-01-19T16:00:00Z'
  },
  // Zoox Jobs
  {
    id: 'job9',
    company: 'Zoox',
    title: 'Simulation Engineer',
    department: 'Engineering',
    location: 'Foster City, CA',
    jobType: 'full_time',
    experienceLevel: 'mid',
    description: 'Build simulation systems for autonomous vehicle testing. Develop realistic virtual environments and scenarios.',
    applicationUrl: 'https://zoox.com/careers/simulation-engineer',
    status: 'active',
    firstSeenAt: '2024-01-18T17:00:00Z',
    lastSeenAt: '2024-01-19T17:00:00Z',
    daysPosted: 1,
    salaryMin: 145000,
    salaryMax: 210000,
    requirements: ['Game engine experience', '3D graphics programming', 'Physics simulation'],
    benefits: ['Amazon benefits', 'Stock units', 'Flexible work'],
    created: '2024-01-18T17:00:00Z',
    updated: '2024-01-19T17:00:00Z'
  },
  {
    id: 'job10',
    company: 'Zoox',
    title: 'AI Research Scientist',
    department: 'Research',
    location: 'Foster City, CA',
    jobType: 'full_time',
    experienceLevel: 'senior',
    description: 'Research and develop AI algorithms for autonomous driving. Work on machine learning, computer vision, and robotics.',
    applicationUrl: 'https://zoox.com/careers/ai-research-scientist',
    status: 'active',
    firstSeenAt: '2024-01-16T18:00:00Z',
    lastSeenAt: '2024-01-19T18:00:00Z',
    daysPosted: 3,
    salaryMin: 200000,
    salaryMax: 350000,
    requirements: ['PhD in AI/ML', 'Research publications', 'Autonomous vehicle experience'],
    benefits: ['Amazon benefits', 'Equity', 'Research budget'],
    created: '2024-01-16T18:00:00Z',
    updated: '2024-01-19T18:00:00Z'
  },
  // AllTrails Jobs
  {
    id: 'job11',
    company: 'AllTrails',
    title: 'iOS Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    jobType: 'full_time',
    experienceLevel: 'mid',
    description: 'Develop and maintain the AllTrails iOS app. Work on features for trail discovery, navigation, and community.',
    applicationUrl: 'https://www.alltrails.com/careers/ios-engineer',
    status: 'active',
    firstSeenAt: '2024-01-19T19:00:00Z',
    lastSeenAt: '2024-01-19T19:00:00Z',
    daysPosted: 0,
    salaryMin: 120000,
    salaryMax: 180000,
    requirements: ['iOS development experience', 'Swift proficiency', 'App Store publishing'],
    benefits: ['Health insurance', 'Equity', 'Outdoor gear allowance'],
    created: '2024-01-19T19:00:00Z',
    updated: '2024-01-19T19:00:00Z'
  },
  {
    id: 'job12',
    company: 'AllTrails',
    title: 'Product Manager',
    department: 'Product',
    location: 'Remote',
    jobType: 'full_time',
    experienceLevel: 'senior',
    description: 'Lead product strategy for outdoor discovery features. Work with engineering and design to build amazing user experiences.',
    applicationUrl: 'https://www.alltrails.com/careers/product-manager',
    status: 'active',
    firstSeenAt: '2024-01-15T20:00:00Z',
    lastSeenAt: '2024-01-19T20:00:00Z',
    daysPosted: 4,
    salaryMin: 140000,
    salaryMax: 200000,
    requirements: ['Product management experience', 'Consumer app background', 'Data-driven approach'],
    benefits: ['Health insurance', 'Stock options', 'Remote work'],
    created: '2024-01-15T20:00:00Z',
    updated: '2024-01-19T20:00:00Z'
  }
]

// User Company Tracking
export const mockUserCompanies: UserCompany[] = [
  {
    id: 'uc1',
    user: 'user1',
    company: 'Anthropic',
    priority: 1,
    notifications: true,
    addedAt: '2024-01-01T00:00:00Z',
    created: '2024-01-01T00:00:00Z',
    updated: '2024-01-01T00:00:00Z'
  },
  {
    id: 'uc2',
    user: 'user1',
    company: 'Zipline',
    priority: 2,
    notifications: true,
    addedAt: '2024-01-02T00:00:00Z',
    created: '2024-01-02T00:00:00Z',
    updated: '2024-01-02T00:00:00Z'
  },
  {
    id: 'uc3',
    user: 'user1',
    company: 'Wing',
    priority: 3,
    notifications: false,
    addedAt: '2024-01-03T00:00:00Z',
    created: '2024-01-03T00:00:00Z',
    updated: '2024-01-03T00:00:00Z'
  },
  {
    id: 'uc4',
    user: 'user1',
    company: 'Waymo',
    priority: 4,
    notifications: true,
    addedAt: '2024-01-04T00:00:00Z',
    created: '2024-01-04T00:00:00Z',
    updated: '2024-01-04T00:00:00Z'
  },
  {
    id: 'uc5',
    user: 'user1',
    company: 'Zoox',
    priority: 5,
    notifications: true,
    addedAt: '2024-01-05T00:00:00Z',
    created: '2024-01-05T00:00:00Z',
    updated: '2024-01-05T00:00:00Z'
  },
  {
    id: 'uc6',
    user: 'user1',
    company: 'AllTrails',
    priority: 6,
    notifications: true,
    addedAt: '2024-01-06T00:00:00Z',
    created: '2024-01-06T00:00:00Z',
    updated: '2024-01-06T00:00:00Z'
  }
]

// Sample Job Applications
export const mockJobApplications: JobApplication[] = [
  {
    id: 'app1',
    user: 'user1',
    job: 'job1',
    stage: 'phone_screen',
    appliedAt: '2024-01-16T10:00:00Z',
    notes: 'Initial phone screen scheduled for next week. Discussed AI safety research interests.',
    stageHistory: [
      { stage: 'applied', date: '2024-01-16T10:00:00Z', notes: 'Applied through company website' },
      { stage: 'phone_screen', date: '2024-01-18T14:00:00Z', notes: 'Phone screen with hiring manager' }
    ],
    created: '2024-01-16T10:00:00Z',
    updated: '2024-01-18T14:00:00Z'
  },
  {
    id: 'app2',
    user: 'user1',
    job: 'job3',
    stage: 'interview',
    appliedAt: '2024-01-15T09:00:00Z',
    notes: 'Technical interview went well. Discussed drone control systems and safety protocols.',
    stageHistory: [
      { stage: 'applied', date: '2024-01-15T09:00:00Z', notes: 'Applied via LinkedIn' },
      { stage: 'phone_screen', date: '2024-01-17T11:00:00Z', notes: 'Initial screening call' },
      { stage: 'interview', date: '2024-01-19T15:00:00Z', notes: 'Technical interview with engineering team' }
    ],
    created: '2024-01-15T09:00:00Z',
    updated: '2024-01-19T15:00:00Z'
  },
  {
    id: 'app3',
    user: 'user1',
    job: 'job5',
    stage: 'final_round',
    appliedAt: '2024-01-14T08:00:00Z',
    notes: 'Final round interviews scheduled. Team seems great, excited about the autonomy work.',
    stageHistory: [
      { stage: 'applied', date: '2024-01-14T08:00:00Z', notes: 'Applied through referral' },
      { stage: 'phone_screen', date: '2024-01-16T13:00:00Z', notes: 'Screening with recruiter' },
      { stage: 'interview', date: '2024-01-18T10:00:00Z', notes: 'Technical interviews' },
      { stage: 'final_round', date: '2024-01-19T16:00:00Z', notes: 'Final round with leadership team' }
    ],
    created: '2024-01-14T08:00:00Z',
    updated: '2024-01-19T16:00:00Z'
  },
  {
    id: 'app4',
    user: 'user1',
    job: 'job2',
    stage: 'rejected',
    appliedAt: '2024-01-13T12:00:00Z',
    notes: 'Unfortunately did not move forward. Good learning experience about infrastructure at scale.',
    stageHistory: [
      { stage: 'applied', date: '2024-01-13T12:00:00Z', notes: 'Applied online' },
      { stage: 'phone_screen', date: '2024-01-15T14:00:00Z', notes: 'Phone screen completed' },
      { stage: 'rejected', date: '2024-01-17T09:00:00Z', notes: 'Did not move forward after phone screen' }
    ],
    created: '2024-01-13T12:00:00Z',
    updated: '2024-01-17T09:00:00Z'
  },
  {
    id: 'app5',
    user: 'user1',
    job: 'job11',
    stage: 'offer',
    appliedAt: '2024-01-12T15:00:00Z',
    notes: 'Received offer! Great team and interesting mobile challenges. Considering the opportunity.',
    stageHistory: [
      { stage: 'applied', date: '2024-01-12T15:00:00Z', notes: 'Applied via company careers page' },
      { stage: 'phone_screen', date: '2024-01-14T11:00:00Z', notes: 'Initial call with engineering manager' },
      { stage: 'interview', date: '2024-01-16T14:00:00Z', notes: 'Technical interview - iOS development' },
      { stage: 'final_round', date: '2024-01-18T10:00:00Z', notes: 'Final interviews with team' },
      { stage: 'offer', date: '2024-01-19T17:00:00Z', notes: 'Offer received - reviewing details' }
    ],
    created: '2024-01-12T15:00:00Z',
    updated: '2024-01-19T17:00:00Z'
  },
  {
    id: 'app6',
    user: 'user1',
    job: 'job10',
    stage: 'applied',
    appliedAt: '2024-01-19T11:00:00Z',
    notes: 'Just applied today. Very interested in the AI research role at Zoox.',
    stageHistory: [
      { stage: 'applied', date: '2024-01-19T11:00:00Z', notes: 'Applied through company website' }
    ],
    created: '2024-01-19T11:00:00Z',
    updated: '2024-01-19T11:00:00Z'
  }
]

// Helper function to get jobs with applications
export const getJobsWithApplications = (userId: string): JobWithApplication[] => {
  return mockJobs.map(job => ({
    ...job,
    expand: {
      company: mockCompanies.find(c => c.id === job.company)
    },
    application: mockJobApplications.find(app => app.job === job.id && app.user === userId)
  }))
}

// Mock Analytics Data
export const mockAnalyticsData = {
  jobTrends: [
    { date: '2024-01-01', newJobs: 5, applications: 2 },
    { date: '2024-01-02', newJobs: 3, applications: 1 },
    { date: '2024-01-03', newJobs: 7, applications: 3 },
    { date: '2024-01-04', newJobs: 4, applications: 2 },
    { date: '2024-01-05', newJobs: 6, applications: 1 },
    { date: '2024-01-06', newJobs: 2, applications: 4 },
    { date: '2024-01-07', newJobs: 8, applications: 2 },
    { date: '2024-01-08', newJobs: 5, applications: 3 },
    { date: '2024-01-09', newJobs: 3, applications: 1 },
    { date: '2024-01-10', newJobs: 9, applications: 5 },
    { date: '2024-01-11', newJobs: 4, applications: 2 },
    { date: '2024-01-12', newJobs: 6, applications: 3 },
    { date: '2024-01-13', newJobs: 7, applications: 4 },
    { date: '2024-01-14', newJobs: 5, applications: 2 },
    { date: '2024-01-15', newJobs: 8, applications: 6 },
    { date: '2024-01-16', newJobs: 3, applications: 3 },
    { date: '2024-01-17', newJobs: 4, applications: 2 },
    { date: '2024-01-18', newJobs: 6, applications: 4 },
    { date: '2024-01-19', newJobs: 5, applications: 3 }
  ],
  companyHiring: [
    { company: 'Anthropic', jobs: 2, growth: 15 },
    { company: 'Zipline', jobs: 2, growth: 8 },
    { company: 'Wing', jobs: 2, growth: 12 },
    { company: 'Waymo', jobs: 2, growth: 20 },
    { company: 'Zoox', jobs: 2, growth: 18 },
    { company: 'AllTrails', jobs: 2, growth: 10 }
  ],
  locationDistribution: [
    { location: 'San Francisco', count: 4 },
    { location: 'Mountain View', count: 2 },
    { location: 'Palo Alto', count: 2 },
    { location: 'Foster City', count: 2 },
    { location: 'South San Francisco', count: 2 },
    { location: 'Remote', count: 1 }
  ],
  departmentBreakdown: [
    { department: 'Engineering', count: 9 },
    { department: 'Research', count: 2 },
    { department: 'Product', count: 1 }
  ]
}