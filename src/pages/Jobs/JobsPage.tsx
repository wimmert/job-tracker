import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useDataMode } from '../../hooks/useDataMode'
import { useDebounce } from '../../hooks/useDebounce'
import { useLocation } from 'react-router-dom'
import { JobWithApplication, ApplicationStage, FilterOptions, UserCompany } from '../../types'
import { api } from '../../lib/api'
import Header from '../../components/Layout/Header'
import JobCard from '../../components/JobCard'
import JobDetailModal from '../../components/JobDetailModal'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { 
  Briefcase, 
  Filter, 
  X, 
  Search, 
  Building2, 
  MapPin, 
  Users, 
  Clock,
  Plus,
  ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'

const JobsPage = () => {
  const { user } = useAuth()
  const { dataMode, isUsingMockData, isUsingPocketBase } = useDataMode()
  const location = useLocation()
  const [jobs, setJobs] = useState<JobWithApplication[]>([])
  const [trackedCompanies, setTrackedCompanies] = useState<UserCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [jobsLoading, setJobsLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobWithApplication | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [dataSource, setDataSource] = useState<'mock' | 'real'>('mock')
  const [searchInput, setSearchInput] = useState('')
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    companies: [],
    locations: [],
    departments: [],
    jobTypes: [],
    experienceLevels: [],
    search: ''
  })

  // Debounced search value
  const debouncedSearch = useDebounce(searchInput, 1000)

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters(prev => ({ ...prev, search: debouncedSearch }))
    }
  }, [debouncedSearch, filters.search])

  // Reload data when filters change
  useEffect(() => {
    if (user) {
      setSearchLoading(true)
      loadData()
        .finally(() => setSearchLoading(false))
    }
  }, [filters, user])
  
  useEffect(() => {
    loadData()
  }, [user])

  // Handle navigation state for company filtering
  useEffect(() => {
    if (location.state?.companyId && location.state?.companyName) {
      setFilters(prev => ({
        ...prev,
        companies: [location.state.companyName]
      }))
      setShowFilters(true)
    }
  }, [location.state])

  const handleStatusChange = async (jobId: string, stage: ApplicationStage) => {
    if (!user) return

    try {
      await api.updateApplicationStage(user.id, jobId, stage)
      await loadData()
      
      if (stage !== 'not_applied') {
        toast.success('Application status updated!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update application')
    }
  }

  const handleHideJob = (jobId: string) => {
    // For demo purposes, just show a toast
    toast.success('Job hidden from view')
  }

  const handleViewDetails = (job: JobWithApplication) => {
    setSelectedJob(job)
  }

  const handleJobSelect = (jobId: string, selected: boolean) => {
    setSelectedJobs(prev => 
      selected 
        ? [...prev, jobId]
        : prev.filter(id => id !== jobId)
    )
  }

  const handleBulkAction = (action: string) => {
    if (selectedJobs.length === 0) {
      toast.error('Please select jobs first')
      return
    }
    
    // Handle bulk actions
    switch (action) {
      case 'apply':
        toast.success(`Applied to ${selectedJobs.length} jobs`)
        break
      case 'hide':
        toast.success(`Hidden ${selectedJobs.length} jobs`)
        break
      default:
        break
    }
    
    setSelectedJobs([])
  }

  // Extract unique filter options from jobs
  const getUniqueCompanies = () => {
    // Get unique company names from jobs data only (to avoid duplicates)
    const companyNames = new Set<string>()
    jobs.forEach(job => {
      if (job.company) {
        companyNames.add(job.company)
      }
    })
    return Array.from(companyNames).sort()
  }

  // Get job count for each company
  const getCompanyJobCounts = () => {
    const counts: { [key: string]: number } = {}
    jobs.forEach(job => {
      if (job.company) {
        counts[job.company] = (counts[job.company] || 0) + 1
      }
    })
    return counts
  }
  const getUniqueLocations = () => {
    const locations = new Set(jobs.map(job => job.location))
    return Array.from(locations).sort()
  }

  const getUniqueDepartments = () => {
    const departments = new Set(jobs.map(job => job.department))
    return Array.from(departments).sort()
  }

  const handleFilterChange = (filterType: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const handleFilterToggle = (filterType: keyof FilterOptions, value: string) => {
    console.log('🔍 INVESTIGATION - Filter Toggle Called:')
    console.log('filterType:', filterType)
    console.log('value:', value)
    console.log('current filters[filterType]:', filters[filterType])
    
    setFilters(prev => {
      const currentValues = prev[filterType] as string[]
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      
      console.log('🔍 INVESTIGATION - New Values:', newValues)
      
      return {
        ...prev,
        [filterType]: newValues
      }
    })
  }

  const clearFilters = () => {
    setFilters({
      companies: [],
      locations: [],
      departments: [],
      jobTypes: [],
      experienceLevels: [],
      search: ''
    })
    setSearchInput('')
  }

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    setJobsLoading(true)
    
    // Determine data source based on mode and what actually gets returned
    const initialDataSource = isUsingMockData ? 'mock' : 'real'
    
    try {
      console.log(`🔄 Loading jobs data in ${dataMode} mode...`)
      
      const [jobsData, companiesData] = await Promise.all([
        api.getJobs(user.id, filters),
        api.getTrackedCompanies(user.id)
      ])
      
      setJobs(jobsData)
      setTrackedCompanies(companiesData)
      
      // Detect if we actually got real data or fell back to mock
      if (isUsingPocketBase && jobsData.length > 0) {
        // Check if this looks like real PocketBase data (has PocketBase-style IDs)
        const hasRealData = jobsData.some(job => 
          job.id && !job.id.startsWith('job') && job.id.length > 10
        )
        setDataSource(hasRealData ? 'real' : 'mock')
        console.log(`📊 Jobs data source detected: ${hasRealData ? 'real PocketBase data' : 'mock data fallback'}`)
      } else {
        setDataSource('mock')
        console.log('📝 Using mock jobs data')
      }
      
      console.log(`✅ Jobs data loaded successfully (${dataSource} data)`)
    } catch (error) {
      console.error('Error loading jobs:', error)
      setDataSource('mock') // Fallback to mock on error
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
      setJobsLoading(false)
    }
  }

  const hasActiveFilters = Object.values(filters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : filter !== ''
  )

  const companyJobCounts = getCompanyJobCounts()

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Jobs" subtitle="Loading jobs data..." />
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <Header 
        title="Jobs" 
        subtitle={
          jobsLoading 
            ? "Loading jobs..." 
            : `Tracking ${trackedCompanies.length} companies • ${
                dataSource === 'real' ? 'Real Data' : 'Mock Data'
              } ${isUsingPocketBase && dataSource === 'mock' ? '(Fallback)' : ''}`
        }
      />

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Data Source Indicator */}
        {!loading && (
          <div className="mb-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              dataSource === 'real' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            }`}>
              {dataSource === 'real' ? (
                <>✓ Using Real Jobs Data from PocketBase</>
              ) : (
                <>📝 Using Mock Jobs Data{isUsingPocketBase ? ' (Connection Failed)' : ' (Development Mode)'}</>
              )}
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search jobs by title, company, or keywords..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
            {searchInput && searchInput !== debouncedSearch && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Waiting to search...</span>
              </div>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant={showFilters ? "primary" : "secondary"}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {Object.values(filters).flat().filter(Boolean).length}
                  </span>
                )}
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Bulk Actions */}
            {selectedJobs.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedJobs.length} selected
                </span>
                <Button size="sm" onClick={() => handleBulkAction('apply')}>
                  Apply to Selected
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleBulkAction('hide')}>
                  Hide Selected
                </Button>
              </div>
            )}
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.companies.map(company => (
                <span
                  key={company}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  <Building2 className="h-3 w-3 mr-1" />
                  {company}
                  <button
                    onClick={() => handleFilterToggle('companies', company)}
                    className="ml-2 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {filters.locations.map(location => (
                <span
                  key={location}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {location}
                  <button
                    onClick={() => handleFilterToggle('locations', location)}
                    className="ml-2 hover:text-green-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {filters.departments.map(department => (
                <span
                  key={department}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                >
                  <Users className="h-3 w-3 mr-1" />
                  {department}
                  <button
                    onClick={() => handleFilterToggle('departments', department)}
                    className="ml-2 hover:text-purple-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Filter Panel */}
          {showFilters && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">Filter Jobs</h3>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Companies Filter */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">Companies</h4>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleFilterChange('companies', getUniqueCompanies())}
                          className="text-xs"
                        >
                          Select All
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleFilterChange('companies', [])}
                          className="text-xs"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {getUniqueCompanies().map(company => (
                        <label key={company} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.companies.includes(company)}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleFilterToggle('companies', company)
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{company}</span>
                          {companyJobCounts[company] && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              ({companyJobCounts[company]})
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Locations Filter */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">Locations</h4>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleFilterChange('locations', getUniqueLocations())}
                          className="text-xs"
                        >
                          Select All
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleFilterChange('locations', [])}
                          className="text-xs"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {getUniqueLocations().map(location => (
                        <label key={location} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.locations.includes(location)}
                            onChange={() => handleFilterToggle('locations', location)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{location}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Departments Filter */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">Departments</h4>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleFilterChange('departments', getUniqueDepartments())}
                          className="text-xs"
                        >
                          Select All
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleFilterChange('departments', [])}
                          className="text-xs"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {getUniqueDepartments().map(department => (
                        <label key={department} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.departments.includes(department)}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleFilterToggle('departments', department)
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{department}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Job Types Filter */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">Job Types</h4>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleFilterChange('jobTypes', ['full_time', 'part_time', 'contract', 'internship'])}
                          className="text-xs"
                        >
                          Select All
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleFilterChange('jobTypes', [])}
                          className="text-xs"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {['full_time', 'part_time', 'contract', 'internship'].map(jobType => (
                        <label key={jobType} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.jobTypes.includes(jobType)}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleFilterToggle('jobTypes', jobType)
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                            {jobType.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Jobs Grid */}
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                {hasActiveFilters ? 'No jobs match your filters' : 'No jobs available'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your filters to see more opportunities.'
                  : 'Add companies to start tracking job opportunities.'
                }
              </p>
              {hasActiveFilters ? (
                <Button onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => window.location.href = '/companies'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Companies
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isNew={new Date(job.firstSeenAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
                onStatusChange={handleStatusChange}
                onHide={handleHideJob}
                onViewDetails={handleViewDetails}
                isSelected={selectedJobs.includes(job.id)}
                onSelect={handleJobSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}

export default JobsPage