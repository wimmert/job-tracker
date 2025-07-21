import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { JobApplication, JobWithApplication, ApplicationStage } from '../../types'
import { api } from '../../lib/api'
import Header from '../../components/Layout/Header'
import JobDetailModal from '../../components/JobDetailModal'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { 
  Target, 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  ExternalLink, 
  Edit3, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  Save,
  X,
  Filter,
  Briefcase
} from 'lucide-react'
import { formatDate, formatSalary, getDaysAgo } from '../../lib/utils'
import toast from 'react-hot-toast'

const ApplicationsPage = () => {
  const { user } = useAuth()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [jobs, setJobs] = useState<JobWithApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobWithApplication | null>(null)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesText, setNotesText] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [stageFilter, setStageFilter] = useState<ApplicationStage | 'all'>('all')
  const [dataSource, setDataSource] = useState<'mock' | 'real'>('mock')

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    setApplicationsLoading(true)
    
    try {
      console.log('🔄 Loading applications data...')
      
      const [applicationsData, jobsData] = await Promise.all([
        api.getApplications(user.id),
        api.getJobs(user.id)
      ])
      
      setApplications(applicationsData)
      setJobs(jobsData)
      
      // Detect if we got real data or fell back to mock
      if (applicationsData.length > 0) {
        // Check if this looks like real PocketBase data (has PocketBase-style IDs)
        const hasRealData = applicationsData.some(app => 
          app.id && !app.id.startsWith('app') && app.id.length > 10
        )
        setDataSource(hasRealData ? 'real' : 'mock')
        console.log(`📊 Applications data source detected: ${hasRealData ? 'real PocketBase data' : 'mock data fallback'}`)
      } else {
        setDataSource('mock')
        console.log('📝 Using mock applications data')
      }
      
      console.log('✅ Applications data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading applications:', error)
      setDataSource('mock') // Fallback to mock on error
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
      setApplicationsLoading(false)
    }
  }

  const handleStatusChange = async (jobId: string, stage: ApplicationStage) => {
    if (!user) return

    try {
      await api.updateApplicationStage(user.id, jobId, stage)
      await loadData()
      toast.success('Application status updated!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update application')
    }
  }

  const handleEditNotes = (applicationId: string, currentNotes: string) => {
    setEditingNotes(applicationId)
    setNotesText(currentNotes || '')
  }

  const handleSaveNotes = async (applicationId: string) => {
    if (!user) return

    try {
      await api.updateApplicationNotes(user.id, applicationId, notesText)
      await loadData()
      toast.success('Notes updated!')
      setEditingNotes(null)
      setNotesText('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update notes')
    }
  }

  const handleCancelEdit = () => {
    setEditingNotes(null)
    setNotesText('')
  }

  const handleViewJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (job) {
      setSelectedJob(job)
    }
  }

  const getJobForApplication = (application: JobApplication) => {
    return jobs.find(job => job.id === application.job)
  }

  const calculateDaysActive = (firstSeenAt: string, lastSeenAt: string, status: string) => {
    const firstSeen = new Date(firstSeenAt)
    const lastSeen = new Date(lastSeenAt)
    const now = new Date()
    
    if (status === 'active') {
      const diffTime = Math.abs(now.getTime() - firstSeen.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return `${diffDays}+ days`
    } else {
      const diffTime = Math.abs(lastSeen.getTime() - firstSeen.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return `${diffDays} days`
    }
  }

  const filteredApplications = applications.filter(app => 
    stageFilter === 'all' || app.stage === stageFilter
  )

  const stageLabels = {
    not_applied: 'Not Applied',
    applied: 'Applied',
    phone_screen: 'Phone Screen',
    interview: 'Interview',
    final_round: 'Final Round',
    offer: 'Offer',
    rejected: 'Rejected'
  }

  const stageColors = {
    not_applied: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    phone_screen: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    interview: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    final_round: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    offer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }

  const ApplicationCard = ({ application }: { application: JobApplication }) => {
    const job = getJobForApplication(application)
    const [showStatusDropdown, setShowStatusDropdown] = useState(false)
    
    if (!job) {
      return (
        <Card className="opacity-50">
          <CardContent className="p-6">
            <p className="text-slate-500 dark:text-slate-400">Job information not available</p>
          </CardContent>
        </Card>
      )
    }

    const allStages: ApplicationStage[] = ['not_applied', 'applied', 'phone_screen', 'interview', 'final_round', 'offer', 'rejected']

    const handleStatusUpdate = (newStage: ApplicationStage) => {
      handleStatusChange(job.id, newStage)
      setShowStatusDropdown(false)
    }

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          {/* Job Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1">
              <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {job.expand?.company?.logoUrl ? (
                  <img 
                    src={job.expand.company.logoUrl} 
                    alt={job.expand.company.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-6 w-6 text-slate-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {job.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {job.expand?.company?.name || 'Unknown Company'} • {job.department}
                </p>
                <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </div>
                </div>
              </div>
            </div>

            {/* Application Status */}
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${stageColors[application.stage]} hover:opacity-80 transition-opacity`}
              >
                <span>{stageLabels[application.stage]}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {showStatusDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-[140px]">
                  {allStages.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => handleStatusUpdate(stage)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg ${
                        stage === application.stage ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {stageLabels[stage]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Job Timeline */}
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Job Timeline</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                <div>
                  <p className="text-slate-500 dark:text-slate-400">First appeared</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{formatDate(job.firstSeenAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-green-600" />
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Days active</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {calculateDaysActive(job.firstSeenAt, job.lastSeenAt, job.status)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                {job.status === 'active' ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                )}
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Status</p>
                  <p className={`font-medium ${job.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {job.status === 'active' ? 'Active' : `Disappeared ${formatDate(job.lastSeenAt)}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Application Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Applied on</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {application.appliedAt ? formatDate(application.appliedAt) : 'Not applied yet'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Current stage</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {stageLabels[application.stage]}
                </p>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Notes</h4>
              {editingNotes !== application.id && (
                <button
                  onClick={() => handleEditNotes(application.id, application.notes || '')}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs flex items-center"
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit Notes
                </button>
              )}
            </div>
            
            {editingNotes === application.id ? (
              <div className="space-y-2">
                <Input
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Add your notes..."
                  className="text-sm"
                />
                <div className="flex items-center space-x-2">
                  <Button size="sm" onClick={() => handleSaveNotes(application.id)}>
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {application.notes || 'No notes added yet'}
              </p>
            )}
          </div>

          {/* Stage History */}
          {application.stageHistory && application.stageHistory.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Progress Timeline</h4>
              <div className="space-y-2">
                {application.stageHistory.map((entry, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 flex-shrink-0"></div>
                    <div className="flex-1">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {stageLabels[entry.stage as ApplicationStage]}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 ml-2">
                        {formatDate(entry.date)}
                      </span>
                      {entry.notes && (
                        <p className="text-slate-600 dark:text-slate-400 mt-1">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleViewJob(job.id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Job
            </Button>
            {job.status === 'active' && (
              <Button
                size="sm"
                onClick={() => window.open(job.applicationUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Apply Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Applications" subtitle="Loading applications data..." />
        <div className="flex-1 p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
        title="Applications" 
        subtitle={
          applicationsLoading 
            ? "Loading applications..." 
            : `Tracking ${applications.length} job applications • ${
                dataSource === 'real' ? 'Real Data' : 'Mock Data'
              }`
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
                <>✓ Using Real Applications Data from PocketBase</>
              ) : (
                <>📝 Using Mock Applications Data (Development Mode)</>
              )}
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant={showFilters ? "primary" : "secondary"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter by Stage
            </Button>
            
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredApplications.length} of {applications.length} applications
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStageFilter('all')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      stageFilter === 'all'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    All Stages ({applications.length})
                  </button>
                  {Object.entries(stageLabels).map(([stage, label]) => {
                    const count = applications.filter(app => app.stage === stage).length
                    return (
                      <button
                        key={stage}
                        onClick={() => setStageFilter(stage as ApplicationStage)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          stageFilter === stage
                            ? stageColors[stage as ApplicationStage]
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        {label} ({count})
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                {stageFilter === 'all' ? 'No applications yet' : `No applications in ${stageLabels[stageFilter as ApplicationStage]} stage`}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {stageFilter === 'all' 
                  ? 'Start applying to jobs from your tracked companies to see them here.'
                  : 'Try selecting a different stage filter to see more applications.'
                }
              </p>
              {stageFilter !== 'all' && (
                <Button onClick={() => setStageFilter('all')}>
                  Show All Applications
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
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

export default ApplicationsPage