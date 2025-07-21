import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Company, UserCompany, JobApplication, JobWithApplication } from '../../types'
import { api } from '../../lib/api'
import Header from '../../components/Layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { 
  BarChart3, 
  TrendingUp, 
  Building2, 
  MapPin, 
  Users, 
  Calendar,
  Filter,
  X,
  CheckCircle,
  Target,
  Briefcase,
  Clock
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'

const AnalyticsPage = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [trackedCompanies, setTrackedCompanies] = useState<UserCompany[]>([])
  const [jobs, setJobs] = useState<JobWithApplication[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [dataSource, setDataSource] = useState<'mock' | 'real'>('mock')

  useEffect(() => {
    loadData()
  }, [user])

  useEffect(() => {
    if (trackedCompanies.length > 0 && selectedCompanies.length === 0) {
      // Default to all companies
      setSelectedCompanies(trackedCompanies.map(tc => tc.company))
    }
  }, [trackedCompanies])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    setAnalyticsLoading(true)
    
    try {
      console.log('🔄 Loading analytics data...')
      
      const [companiesData, jobsData, applicationsData, analyticsData] = await Promise.all([
        api.getTrackedCompanies(user.id),
        api.getJobs(user.id),
        api.getApplications(user.id),
        api.getAnalytics(user.id)
      ])
      
      setTrackedCompanies(companiesData)
      setJobs(jobsData)
      setApplications(applicationsData)
      setAnalytics(analyticsData)
      
      // Detect if we got real data or fell back to mock
      if (jobsData.length > 0 || applicationsData.length > 0) {
        // Check if this looks like real PocketBase data (has PocketBase-style IDs)
        const hasRealJobData = jobsData.some(job => 
          job.id && !job.id.startsWith('job') && job.id.length > 10
        )
        const hasRealAppData = applicationsData.some(app => 
          app.id && !app.id.startsWith('app') && app.id.length > 10
        )
        setDataSource(hasRealJobData || hasRealAppData ? 'real' : 'mock')
        console.log(`📊 Analytics data source detected: ${hasRealJobData || hasRealAppData ? 'real PocketBase data' : 'mock data fallback'}`)
      } else {
        setDataSource('mock')
        console.log('📝 Using mock analytics data')
      }
      
      console.log('✅ Analytics data loaded successfully')
    } catch (error) {
      console.error('Error loading analytics data:', error)
      setDataSource('mock') // Fallback to mock on error
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
      setAnalyticsLoading(false)
    }
  }

  const handleCompanyToggle = (companyId: string) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    )
  }

  const handleSelectAll = () => {
    setSelectedCompanies(trackedCompanies.map(tc => tc.company))
  }

  const handleClearAll = () => {
    setSelectedCompanies([])
  }

  const removeCompanyFilter = (companyId: string) => {
    setSelectedCompanies(prev => prev.filter(id => id !== companyId))
  }

  // Filter data based on selected companies
  const filteredJobs = jobs.filter(job => selectedCompanies.includes(job.company))
  const filteredApplications = applications.filter(app => {
    const job = jobs.find(j => j.id === app.job)
    return job && selectedCompanies.includes(job.company)
  })

  // Calculate filtered analytics
  const getFilteredAnalytics = () => {
    if (!analytics || selectedCompanies.length === 0) return null

    const filteredCompanyHiring = analytics.companyHiring.filter((company: any) => 
      selectedCompanies.some(id => {
        const trackedCompany = trackedCompanies.find(tc => tc.company === id)
        return trackedCompany?.expand?.company?.name === company.company
      })
    )

    const filteredLocationDistribution = analytics.locationDistribution.map((location: any) => ({
      ...location,
      count: filteredJobs.filter(job => job.location.includes(location.location)).length
    })).filter((location: any) => location.count > 0)

    const filteredDepartmentBreakdown = analytics.departmentBreakdown.map((dept: any) => ({
      ...dept,
      count: filteredJobs.filter(job => job.department === dept.department).length
    })).filter((dept: any) => dept.count > 0)

    return {
      ...analytics,
      companyHiring: filteredCompanyHiring,
      locationDistribution: filteredLocationDistribution,
      departmentBreakdown: filteredDepartmentBreakdown
    }
  }

  const filteredAnalytics = getFilteredAnalytics()

  const getSelectedCompanyNames = () => {
    return selectedCompanies.map(id => {
      const company = trackedCompanies.find(tc => tc.company === id)
      return company?.expand?.company?.name
    }).filter(Boolean)
  }

  const isFiltered = selectedCompanies.length < trackedCompanies.length

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-3 bg-${color}-100 dark:bg-${color}-900 rounded-lg`}>
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title} {isFiltered && <span className="text-xs">(Filtered)</span>}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Analytics" subtitle="Loading analytics data..." />
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
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
        title="Analytics" 
        subtitle={isFiltered 
          ? `Showing data for ${selectedCompanies.length} of ${trackedCompanies.length} companies • ${
              dataSource === 'real' ? 'Real Data' : 'Mock Data'
            }`
          : `Job market insights across ${trackedCompanies.length} tracked companies • ${
              dataSource === 'real' ? 'Real Data' : 'Mock Data'
            }`
        }
      />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Data Source Indicator */}
          {!loading && (
            <div className="mb-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                dataSource === 'real' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
              }`}>
                {dataSource === 'real' ? (
                  <>✓ Using Real Analytics Data from PocketBase</>
                ) : (
                  <>📝 Using Mock Analytics Data (Development Mode)</>
                )}
              </div>
            </div>
          )}

          {/* Company Filter Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant={showFilters ? "primary" : "secondary"}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Company Filter
                {isFiltered && (
                  <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {selectedCompanies.length}
                  </span>
                )}
              </Button>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedCompanies.length} of {trackedCompanies.length} companies selected
                </div>
                
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                  className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      Select Companies to Include
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                        Select All
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleClearAll}>
                        Clear All
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {trackedCompanies.map((userCompany) => {
                      const company = userCompany.expand?.company
                      if (!company) return null
                      
                      return (
                        <label key={company.id} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedCompanies.includes(company.id)}
                            onChange={() => handleCompanyToggle(company.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="h-6 w-6 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                            {company.logoUrl ? (
                              <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
                            ) : (
                              <Building2 className="h-3 w-3 text-slate-500" />
                            )}
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                            {company.name}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Filter Chips */}
            {isFiltered && (
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">Filtered by:</span>
                {getSelectedCompanyNames().map((companyName, index) => {
                  const companyId = selectedCompanies[index]
                  return (
                    <span
                      key={companyId}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    >
                      {companyName}
                      <button
                        onClick={() => removeCompanyFilter(companyId)}
                        className="ml-2 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Briefcase}
              title="Total Jobs"
              value={filteredJobs.length}
              subtitle={`From ${selectedCompanies.length} companies`}
              color="blue"
            />
            <StatCard
              icon={Target}
              title="Applications"
              value={filteredApplications.length}
              subtitle={`${Math.round((filteredApplications.length / Math.max(filteredJobs.length, 1)) * 100)}% application rate`}
              color="green"
            />
            <StatCard
              icon={TrendingUp}
              title="Success Rate"
              value={`${Math.round((filteredApplications.filter(app => ['interview', 'final_round', 'offer'].includes(app.stage)).length / Math.max(filteredApplications.length, 1)) * 100)}%`}
              subtitle="Interview rate"
              color="purple"
            />
            <StatCard
              icon={Clock}
              title="Avg Response"
              value="3.2 days"
              subtitle="From application"
              color="orange"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Job Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Job Trends {isFiltered && '(Filtered)'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.jobTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="newJobs" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="applications" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Company Hiring Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Company Hiring {isFiltered && `(${selectedCompanies.length} companies)`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredAnalytics?.companyHiring || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="company" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="jobs" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Location Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location Distribution {isFiltered && '(Filtered)'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={filteredAnalytics?.locationDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ location, percent }) => `${location} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(filteredAnalytics?.locationDistribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Department Breakdown {isFiltered && '(Filtered)'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredAnalytics?.departmentBreakdown || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Insights Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Key Insights {isFiltered && '(Filtered View)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {Math.round((filteredJobs.filter(job => job.status === 'active').length / Math.max(filteredJobs.length, 1)) * 100)}%
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Jobs Still Active</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {filteredJobs.filter(job => new Date(job.firstSeenAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">New Jobs This Week</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {filteredApplications.filter(app => ['interview', 'final_round'].includes(app.stage)).length}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">In Interview Process</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage