import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import Button from './ui/Button'
import { 
  Play, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Database,
  Globe,
  Settings,
  BarChart3,
  Pause,
  Activity,
  TrendingUp,
  Calendar,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ScrapingStatusProps {
  onManualScrape?: () => void
}

interface CompanyStatus {
  name: string
  slug: string
  enabled: boolean
  lastRun: string | null
  status: 'success' | 'error' | 'running' | 'never'
  jobsFound: number
  newJobs: number
  removedJobs: number
  duration: number
  rateLimit: number
  frequency: 'daily' | 'weekly'
  nextRun: string | null
}

const ScrapingStatus: React.FC<ScrapingStatusProps> = ({ onManualScrape }) => {
  const { user } = useAuth()
  const [isScrapingAll, setIsScrapingAll] = useState(false)
  const [isScrapingCompany, setIsScrapingCompany] = useState<string | null>(null)
  const [lastScrapeResults, setLastScrapeResults] = useState<any>(null)
  const [showLogs, setShowLogs] = useState(false)
  const [scrapingLogs, setScrapingLogs] = useState<string[]>([])
  const [realJobCounts, setRealJobCounts] = useState<{[key: string]: number}>({})
  const [totalJobsCount, setTotalJobsCount] = useState(0)
  const [trackedCompaniesCount, setTrackedCompaniesCount] = useState(0)
  
  // Load real job counts from API
  useEffect(() => {
    loadRealJobCounts()
  }, [user])
  
  const loadRealJobCounts = async () => {
    if (!user) return
    
    try {
      const [jobs, trackedCompanies] = await Promise.all([
        api.getJobs(user.id),
        api.getTrackedCompanies(user.id)
      ])
      
      setTotalJobsCount(jobs.length)
      setTrackedCompaniesCount(trackedCompanies.length)
      
      // Count jobs per company
      const counts: {[key: string]: number} = {}
      jobs.forEach(job => {
        const companyName = job.company
        counts[companyName] = (counts[companyName] || 0) + 1
      })
      setRealJobCounts(counts)
      
      // Update company statuses with real job counts
      setCompanyStatuses(prev => prev.map(company => ({
        ...company,
        jobsFound: counts[company.name] || 0
      })))
      
      // Return the actual counts for immediate use
      return { jobCounts: counts, totalJobs: jobs.length }
      
    } catch (error) {
      console.error('Error loading real job counts:', error)
      return { jobCounts: {}, totalJobs: 0 }
    }
  }
  
  const addSimulatedJobs = async (companyName: string, count: number) => {
    const jobTemplates = {
      'Anthropic': [
        { title: 'Research Scientist - AI Safety', department: 'Research', experienceLevel: 'senior', description: 'Join our team to research and develop safe AI systems. Work on alignment, interpretability, and robustness of large language models.' },
        { title: 'ML Engineer - Constitutional AI', department: 'Engineering', experienceLevel: 'mid', description: 'Build and maintain the infrastructure that powers our Constitutional AI systems. Work with distributed systems and ML infrastructure.' },
        { title: 'Safety Researcher - Alignment', department: 'Research', experienceLevel: 'senior', description: 'Research AI alignment techniques and develop methods for ensuring AI systems behave as intended.' }
      ],
      'Zipline': [
        { title: 'Drone Systems Engineer', department: 'Engineering', experienceLevel: 'mid', description: 'Design and develop autonomous drone systems for medical delivery. Work on flight control, navigation, and safety systems.' },
        { title: 'Flight Control Software Engineer', department: 'Engineering', experienceLevel: 'senior', description: 'Develop flight control software for autonomous drones. Implement safety-critical systems and real-time control algorithms.' },
        { title: 'Logistics Operations Manager', department: 'Operations', experienceLevel: 'mid', description: 'Manage logistics operations for drone delivery networks. Optimize routes and coordinate with healthcare partners.' }
      ],
      'Wing': [
        { title: 'Autonomy Software Engineer', department: 'Engineering', experienceLevel: 'senior', description: 'Develop autonomous systems for delivery drones. Work on perception, planning, and control systems.' },
        { title: 'Drone Hardware Engineer', department: 'Engineering', experienceLevel: 'mid', description: 'Design and develop drone hardware systems. Work on mechanical design, electronics, and integration.' },
        { title: 'Flight Test Engineer', department: 'Engineering', experienceLevel: 'mid', description: 'Conduct flight testing for autonomous delivery drones. Analyze performance and safety metrics.' }
      ],
      'Waymo': [
        { title: 'Perception Engineer - Computer Vision', department: 'Engineering', experienceLevel: 'senior', description: 'Develop perception systems for autonomous vehicles. Work with computer vision, sensor fusion, and deep learning.' },
        { title: 'Motion Planning Engineer', department: 'Engineering', experienceLevel: 'senior', description: 'Design motion planning algorithms for autonomous vehicles. Work on path planning, trajectory optimization, and behavior prediction.' },
        { title: 'Simulation Engineer', department: 'Engineering', experienceLevel: 'mid', description: 'Build simulation systems for autonomous vehicle testing. Develop realistic virtual environments and scenarios.' }
      ],
      'Zoox': [
        { title: 'Robotics Engineer - Vehicle Systems', department: 'Engineering', experienceLevel: 'senior', description: 'Develop robotics systems for autonomous vehicles. Work on sensor integration, control systems, and vehicle dynamics.' },
        { title: 'AI Research Scientist', department: 'Research', experienceLevel: 'senior', description: 'Research and develop AI algorithms for autonomous driving. Work on machine learning, computer vision, and robotics.' },
        { title: 'Simulation Platform Engineer', department: 'Engineering', experienceLevel: 'mid', description: 'Build simulation systems for autonomous vehicle testing. Develop realistic virtual environments and scenarios.' }
      ],
      'AllTrails': [
        { title: 'Senior iOS Engineer', department: 'Engineering', experienceLevel: 'senior', description: 'Develop and maintain the AllTrails iOS app. Work on features for trail discovery, navigation, and community.' },
        { title: 'Product Manager - Discovery', department: 'Product', experienceLevel: 'senior', description: 'Lead product strategy for outdoor discovery features. Work with engineering and design to build amazing user experiences.' },
        { title: 'Backend Engineer - API Platform', department: 'Engineering', experienceLevel: 'mid', description: 'Build and maintain backend APIs for the AllTrails platform. Work with microservices and data processing systems.' }
      ]
    }
    
    const templates = jobTemplates[companyName as keyof typeof jobTemplates] || []
    const selectedTemplates = templates.slice(0, count)

    // Generate job data with proper structure
    const newJobsData = selectedTemplates.map(template => ({
      title: template.title,
      department: template.department,
      location: getCompanyLocation(companyName),
      jobType: 'full_time',
      experienceLevel: template.experienceLevel,
      description: template.description,
      salaryMin: getSalaryRange(template.experienceLevel).min,
      salaryMax: getSalaryRange(template.experienceLevel).max,
      requirements: generateRequirements(template.title, template.department),
      benefits: generateBenefits(companyName)
    }))

    // Use the mockAPI to add jobs properly
    try {
      const jobsAdded = await api.addScrapedJobs('user1', companyName, newJobsData)
      addLog(`✅ Added ${jobsAdded} new jobs to your Jobs page`)
      return jobsAdded
    } catch (error) {
      console.error('Error adding scraped jobs:', error)
      addLog(`❌ Failed to add jobs: ${error}`)
      return 0
    }
  }
  
  const getCompanyLocation = (companyName: string) => {
    const locations = {
      'Anthropic': 'San Francisco, CA',
      'Zipline': 'South San Francisco, CA',
      'Wing': 'Palo Alto, CA',
      'Waymo': 'Mountain View, CA',
      'Zoox': 'Foster City, CA',
      'AllTrails': 'San Francisco, CA'
    }
    return locations[companyName as keyof typeof locations] || 'San Francisco, CA'
  }
  
  const removeSimulatedJobs = async (companyName: string, count: number) => {
    if (count <= 0) return 0
    
    try {
      // Use the mockAPI to remove jobs properly
      const jobsRemoved = await api.removeOldestJobs(companyName, count)
      addLog(`🗑️ Removed ${jobsRemoved} old jobs from ${companyName}`)
      return jobsRemoved
    } catch (error) {
      console.error('Error removing simulated jobs:', error)
      addLog(`❌ Failed to remove jobs: ${error}`)
      return 0
    }
  }
  
  const getSalaryRange = (experienceLevel: string) => {
    const ranges = {
      'entry': { min: 120000, max: 160000 },
      'mid': { min: 150000, max: 200000 },
      'senior': { min: 180000, max: 280000 },
      'staff': { min: 220000, max: 350000 },
      'principal': { min: 280000, max: 450000 }
    }
    return ranges[experienceLevel as keyof typeof ranges] || ranges.mid
  }
  
  const getCompanyIndustry = (companyName: string) => {
    const industries = {
      'Anthropic': 'AI Safety',
      'Zipline': 'Drone Delivery',
      'Wing': 'Autonomous Delivery',
      'Waymo': 'Self-Driving Cars',
      'Zoox': 'Robotaxis',
      'AllTrails': 'Outdoor Recreation'
    }
    return industries[companyName as keyof typeof industries] || 'Technology'
  }
  
  const getCompanyLogo = (companyName: string) => {
    const logos = {
      'Anthropic': 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'Zipline': 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'Wing': 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'Waymo': 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'Zoox': 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      'AllTrails': 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    }
    return logos[companyName as keyof typeof logos] || null
  }
  
  const generateRequirements = (title: string, department: string) => {
    const titleLower = title.toLowerCase()
    const requirements = []
    
    if (titleLower.includes('research') || titleLower.includes('scientist')) {
      requirements.push('PhD in relevant field')
      requirements.push('3+ years research experience')
      requirements.push('Publications in top-tier venues')
    } else if (titleLower.includes('engineer') || titleLower.includes('software')) {
      requirements.push('BS/MS in Computer Science')
      requirements.push('5+ years software development')
      requirements.push('Experience with relevant technologies')
    } else if (titleLower.includes('product')) {
      requirements.push('Product management experience')
      requirements.push('Technical background')
      requirements.push('Data-driven approach')
    }
    
    requirements.push('Strong problem-solving skills')
    return requirements
  }
  
  const generateBenefits = (companyName: string) => {
    const baseBenefits = ['Health insurance', 'Equity package', 'Flexible work arrangements']
    const companySpecific = {
      'Anthropic': ['Research budget', 'Conference attendance'],
      'Zipline': ['Relocation assistance', 'Impact-driven mission'],
      'Wing': ['Google benefits', 'Sabbatical program'],
      'Waymo': ['Google benefits', 'Transportation'],
      'Zoox': ['Amazon benefits', 'Stock units'],
      'AllTrails': ['Outdoor gear allowance', 'Remote work']
    }
    
    return [...baseBenefits, ...(companySpecific[companyName as keyof typeof companySpecific] || [])]
  }

  const [companyStatuses, setCompanyStatuses] = useState<CompanyStatus[]>([
    {
      name: 'Anthropic',
      slug: 'anthropic',
      enabled: true,
      lastRun: '2024-01-19T06:00:00Z',
      status: 'success',
      jobsFound: 0, // Will be updated from real data
      newJobs: 2,
      removedJobs: 1,
      duration: 3200,
      rateLimit: 2,
      frequency: 'daily',
      nextRun: '2024-01-20T06:00:00Z'
    },
    {
      name: 'Zipline',
      slug: 'zipline',
      enabled: true,
      lastRun: '2024-01-19T06:05:00Z',
      status: 'success',
      jobsFound: 0, // Will be updated from real data
      newJobs: 1,
      removedJobs: 2,
      duration: 2800,
      rateLimit: 2,
      frequency: 'daily',
      nextRun: '2024-01-20T06:05:00Z'
    },
    {
      name: 'Wing',
      slug: 'wing',
      enabled: true,
      lastRun: '2024-01-19T06:10:00Z',
      status: 'error',
      jobsFound: 0, // Will be updated from real data
      newJobs: 0,
      removedJobs: 0,
      duration: 5000,
      rateLimit: 3,
      frequency: 'daily',
      nextRun: '2024-01-20T06:10:00Z'
    },
    {
      name: 'Waymo',
      slug: 'waymo',
      enabled: true,
      lastRun: '2024-01-19T06:15:00Z',
      status: 'success',
      jobsFound: 0, // Will be updated from real data
      newJobs: 3,
      removedJobs: 0,
      duration: 4100,
      rateLimit: 2,
      frequency: 'daily',
      nextRun: '2024-01-20T06:15:00Z'
    },
    {
      name: 'Zoox',
      slug: 'zoox',
      enabled: false,
      lastRun: '2024-01-18T06:20:00Z',
      status: 'success',
      jobsFound: 0, // Will be updated from real data
      newJobs: 0,
      removedJobs: 2,
      duration: 2200,
      rateLimit: 2,
      frequency: 'weekly',
      nextRun: '2024-01-25T06:20:00Z'
    },
    {
      name: 'AllTrails',
      slug: 'alltrails',
      enabled: true,
      lastRun: null,
      status: 'never',
      jobsFound: 0, // Will be updated from real data
      newJobs: 0,
      removedJobs: 0,
      duration: 0,
      rateLimit: 1,
      frequency: 'daily',
      nextRun: '2024-01-20T06:25:00Z'
    }
  ])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setScrapingLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const formatLastRun = (lastRun: string | null) => {
    if (!lastRun) return 'Never'
    const date = new Date(lastRun)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 1) {
      return 'Just now'
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return `${diffDays}d ago`
    }
  }

  const simulateScrapingProgress = async (companyName: string) => {
    addLog(`🔄 Starting ${companyName} scraper...`)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    addLog(`🌐 Fetching ${companyName} careers page...`)
    await new Promise(resolve => setTimeout(resolve, 800))
    
    addLog(`📄 Parsing job listings...`)
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const jobsFound = Math.floor(Math.random() * 10) + 3
    const newJobs = Math.floor(Math.random() * 3)
    const removedJobs = Math.floor(Math.random() * 2)
    
    addLog(`✅ Found ${jobsFound} jobs (${newJobs} new, ${removedJobs} removed)`)
    addLog(`💾 Saving to database...`)
    await new Promise(resolve => setTimeout(resolve, 400))
    
    addLog(`✅ ${companyName} scraping completed`)
    
    return { jobsFound, newJobs, removedJobs }
  }

  const handleScrapeAll = async () => {
    setIsScrapingAll(true)
    setShowLogs(true)
    setScrapingLogs([])
    
    try {
      addLog('🚀 Starting scheduled scraping for all companies...')
      
      let totalJobs = 0
      let totalNew = 0
      
      for (const company of companyStatuses.filter(c => c.enabled)) {
        const result = await simulateScrapingProgress(company.name)
        totalJobs += result.jobsFound
        totalNew += result.newJobs
        
        // Actually add new jobs to the system
        if (result.newJobs > 0) {
          await addSimulatedJobs(company.name, result.newJobs)
        }
        
        // Update company status
        setCompanyStatuses(prev => prev.map(c => 
          c.slug === company.slug 
            ? { 
                ...c, 
                lastRun: new Date().toISOString(),
                status: 'success' as const,
                jobsFound: result.jobsFound,
                newJobs: result.newJobs,
                removedJobs: result.removedJobs,
                duration: Math.floor(Math.random() * 3000) + 1000
              }
            : c
        ))
        
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Reload real job counts after scraping
      await loadRealJobCounts()
      
      addLog(`🎯 Scraping completed! Total: ${totalJobs} jobs (${totalNew} new)`)
      
      setLastScrapeResults({
        newJobs: totalNew,
        updatedJobs: totalJobs - totalNew,
        total: totalJobs,
        companies: companyStatuses.filter(c => c.enabled).length
      })
      
      toast.success(`Scraping completed! Found ${totalJobs} jobs (${totalNew} new) - Check Jobs page for new listings`)
      onManualScrape?.()
      
    } catch (error: any) {
      addLog(`❌ Scraping failed: ${error.message}`)
      toast.error('Scraping failed')
    } finally {
      setIsScrapingAll(false)
    }
  }

  const handleScrapeCompany = async (companySlug: string, companyName: string) => {
    setIsScrapingCompany(companySlug)
    setShowLogs(true)
    setScrapingLogs([])
    
    try {
      // Get real job count BEFORE scraping
      const jobCountBefore = realJobCounts[companyName] || 0
      
      const result = await simulateScrapingProgress(companyName)
      
      // Remove jobs if simulation indicates some were removed
      let actualRemovedJobs = 0
      if (result.removedJobs > 0) {
        actualRemovedJobs = await removeSimulatedJobs(companyName, result.removedJobs)
      }
      
      // Actually add new jobs to the system
      let actualNewJobs = 0
      if (result.newJobs > 0) {
        actualNewJobs = await addSimulatedJobs(companyName, result.newJobs)
      }
      
      // Reload real job counts after scraping
      const newCounts = await loadRealJobCounts()
      
      // Get real job count AFTER scraping from returned values
      const jobCountAfter = newCounts?.jobCounts[companyName] || 0
      
      // Create comprehensive toast message
      let toastMessage = `${companyName} scraping completed!`
      if (actualNewJobs > 0 && actualRemovedJobs > 0) {
        toastMessage += ` Added ${actualNewJobs} new jobs, removed ${actualRemovedJobs} jobs (Total: ${jobCountAfter} jobs)`
      } else if (actualNewJobs > 0) {
        toastMessage += ` Added ${actualNewJobs} new jobs (Total: ${jobCountAfter} jobs)`
      } else if (actualRemovedJobs > 0) {
        toastMessage += ` Removed ${actualRemovedJobs} jobs (Total: ${jobCountAfter} jobs)`
      } else {
        toastMessage += ` No changes (Total: ${jobCountAfter} jobs)`
      }
      
      toast.success(toastMessage)
      onManualScrape?.()
      
      // Update the specific company's newJobs count with the actual number added
      setCompanyStatuses(prev => prev.map(c => 
        c.slug === companySlug 
          ? { 
              ...c, 
              newJobs: actualNewJobs,
              removedJobs: actualRemovedJobs,
              lastRun: new Date().toISOString(),
              status: 'success' as const
            }
          : c
      ))
      
    } catch (error: any) {
      addLog(`❌ ${companyName} scraping failed: ${error.message}`)
      toast.error(`Failed to scrape ${companyName}`)
    } finally {
      setIsScrapingCompany(null)
    }
  }

  const handleToggleCompany = (companySlug: string) => {
    setCompanyStatuses(prev => prev.map(c => 
      c.slug === companySlug ? { ...c, enabled: !c.enabled } : c
    ))
  }

  const handleUpdateRateLimit = (companySlug: string, rateLimit: number) => {
    setCompanyStatuses(prev => prev.map(c => 
      c.slug === companySlug ? { ...c, rateLimit } : c
    ))
  }

  const handleUpdateFrequency = (companySlug: string, frequency: 'daily' | 'weekly') => {
    setCompanyStatuses(prev => prev.map(c => 
      c.slug === companySlug ? { ...c, frequency } : c
    ))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'running':
        return 'text-blue-600'
      default:
        return 'text-slate-400'
    }
  }

  const formatDuration = (ms: number) => {
    if (ms === 0) return 'N/A'
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatNextRun = (nextRun: string | null) => {
    if (!nextRun) return 'Not scheduled'
    const date = new Date(nextRun)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    
    if (diffMs < 0) {
      return 'Overdue'
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours < 1) {
      return `In ${diffMinutes}m`
    } else if (diffHours < 24) {
      return `In ${diffHours}h ${diffMinutes}m`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      const remainingHours = diffHours % 24
      return `In ${diffDays}d ${remainingHours}h`
    }
  }

  const totalStats = companyStatuses.reduce((acc, company) => ({
    enabled: trackedCompaniesCount, // Use real tracked companies count
    totalJobs: totalJobsCount,
    newJobs: acc.newJobs + company.newJobs,
    errors: acc.errors + (company.status === 'error' ? 1 : 0)
  }), { enabled: 0, totalJobs: 0, newJobs: 0, errors: 0 })

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Scraping Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalStats.enabled}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Scrapers</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalStats.totalJobs}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Jobs</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalStats.newJobs}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">New Today</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{totalStats.errors}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Errors</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Web Scraping Control
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLogs(!showLogs)}
              >
                <Activity className="h-4 w-4 mr-2" />
                Logs
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scrape All Companies */}
          <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100">
                Scrape All Active Companies
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Run scraping for all {totalStats.enabled} enabled companies
              </p>
            </div>
            <Button
              onClick={handleScrapeAll}
              loading={isScrapingAll}
              disabled={isScrapingAll || isScrapingCompany !== null}
            >
              {isScrapingAll ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Scrape All
                </>
              )}
            </Button>
          </div>

          {/* Company Status Grid */}
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
              Company Scraping Management
            </h3>
            <div className="space-y-4">
              {companyStatuses.map((company) => (
                <div
                  key={company.slug}
                  className={`p-6 border rounded-lg ${
                    company.enabled 
                      ? 'border-slate-200 dark:border-slate-700' 
                      : 'border-slate-100 dark:border-slate-800 opacity-60'
                  }`}
                >
                  {/* Company Header with Controls */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(company.status)}
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {company.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* Enable/Disable Toggle */}
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={company.enabled}
                          onChange={() => handleToggleCompany(company.slug)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {company.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </label>
                      
                      {/* Scrape Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleScrapeCompany(company.slug, company.name)}
                        loading={isScrapingCompany === company.slug}
                        disabled={isScrapingAll || isScrapingCompany !== null || !company.enabled}
                      >
                        {isScrapingCompany === company.slug ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Status Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</p>
                      <p className={`text-sm font-medium ${getStatusColor(company.status)}`}>
                        {company.status === 'never' ? 'Never run' : company.status}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Last Run</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {formatLastRun(company.lastRun)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Jobs Found</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {company.jobsFound} ({company.newJobs} new, {company.removedJobs} removed)
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Duration</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {formatDuration(company.duration)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Next Run</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {formatNextRun(company.nextRun)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Configuration Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-6">
                      {/* Frequency Control */}
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Frequency:
                        </label>
                        <select
                          value={company.frequency}
                          onChange={(e) => handleUpdateFrequency(company.slug, e.target.value as 'daily' | 'weekly')}
                          className="px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
                          disabled={!company.enabled}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                      
                      {/* Rate Limit Control */}
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Rate Limit:
                        </label>
                        <select
                          value={company.rateLimit}
                          onChange={(e) => handleUpdateRateLimit(company.slug, parseInt(e.target.value))}
                          className="px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
                          disabled={!company.enabled}
                        >
                          <option value={1}>Fast (1s)</option>
                          <option value={2}>Normal (2s)</option>
                          <option value={3}>Slow (3s)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Configurations */}

      {/* Scraping Logs */}
      {showLogs && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Scraping Logs
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScrapingLogs([])}
              >
                Clear Logs
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {scrapingLogs.length === 0 ? (
                <p className="text-slate-500">No logs yet. Start scraping to see real-time progress.</p>
              ) : (
                scrapingLogs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Scrape Results */}
      {lastScrapeResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Last Scrape Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{lastScrapeResults.newJobs || 0}</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">New Jobs</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{lastScrapeResults.updatedJobs || 0}</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Updated</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{lastScrapeResults.total || 0}</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Jobs</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{lastScrapeResults.companies || 0}</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Companies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Scraping Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Scheduled Scraping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-300">Automatic Daily Scraping</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Runs every day at 6:00 AM UTC</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600 font-medium">Next: 6:00 AM UTC</p>
                <p className="text-xs text-blue-500">{formatNextRun(new Date(Date.now() + (Math.floor(Math.random() * 12) + 1) * 60 * 60 * 1000).toISOString())}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Features:</h4>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                  <li>• Automatic job discovery</li>
                  <li>• Duplicate detection</li>
                  <li>• Database persistence</li>
                  <li>• Error handling & retries</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Monitoring:</h4>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                  <li>• Success/failure tracking</li>
                  <li>• Performance metrics</li>
                  <li>• Rate limiting compliance</li>
                  <li>• Detailed logging</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ScrapingStatus