import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { JobWithApplication, ApplicationStage } from '../../types'
import { api } from '../../lib/api'
import Header from '../../components/Layout/Header'
import JobCard from '../../components/JobCard'
import JobDetailModal from '../../components/JobDetailModal'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { 
  Briefcase, 
  Building2, 
  Target, 
  TrendingUp, 
  Calendar,
  Plus,
  ArrowRight,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react'
import { formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<JobWithApplication[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<JobWithApplication | null>(null)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const [jobsData, statsData] = await Promise.all([
        api.getJobs(user.id),
        api.getDashboardStats(user.id)
      ])
      
      setJobs(jobsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

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

  const handleNavigateToPage = (path: string) => {
    navigate(path)
  }

  // Get recent jobs (last 7 days)
  const recentJobs = jobs
    .filter(job => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(job.firstSeenAt) > weekAgo
    })
    .slice(0, 6)

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', onClick }: any) => (
    <Card className={`hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-3 bg-${color}-100 dark:bg-${color}-900 rounded-lg`}>
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Dashboard" subtitle="Loading your job tracking overview..." />
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
        title="Dashboard" 
        subtitle={`Welcome back, ${user?.firstName}! Here's your job tracking overview.`}
      />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Briefcase}
              title="Total Jobs"
              value={stats?.totalJobs || 0}
              subtitle={`${stats?.newThisWeek || 0} new this week`}
              color="blue"
              onClick={() => handleNavigateToPage('/jobs')}
            />
            <StatCard
              icon={Target}
              title="Applications"
              value={stats?.applications || 0}
              subtitle={`${stats?.inProgress || 0} in progress`}
              color="green"
              onClick={() => handleNavigateToPage('/applications')}
            />
            <StatCard
              icon={Building2}
              title="Companies"
              value={stats?.companies || 0}
              subtitle="Tracked companies"
              color="purple"
              onClick={() => handleNavigateToPage('/companies')}
            />
            <StatCard
              icon={TrendingUp}
              title="Response Rate"
              value={`${stats?.responseRate || 0}%`}
              subtitle="Interview rate"
              color="orange"
              onClick={() => handleNavigateToPage('/analytics')}
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Quick Actions
                <Button size="sm" variant="ghost" onClick={() => handleNavigateToPage('/companies')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Company
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="secondary" 
                  className="justify-start h-auto p-4"
                  onClick={() => handleNavigateToPage('/jobs')}
                >
                  <div className="text-left">
                    <div className="font-medium">Browse Jobs</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      View all available positions
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
                
                <Button 
                  variant="secondary" 
                  className="justify-start h-auto p-4"
                  onClick={() => handleNavigateToPage('/applications')}
                >
                  <div className="text-left">
                    <div className="font-medium">Track Applications</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Update application status
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
                
                <Button 
                  variant="secondary" 
                  className="justify-start h-auto p-4"
                  onClick={() => handleNavigateToPage('/analytics')}
                >
                  <div className="text-left">
                    <div className="font-medium">View Analytics</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Analyze job market trends
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Recent Jobs
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleNavigateToPage('/jobs')}>
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No recent jobs
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Add companies to start tracking job opportunities.
                  </p>
                  <Button onClick={() => handleNavigateToPage('/companies')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Companies
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isNew={true}
                      onStatusChange={handleStatusChange}
                      onHide={handleHideJob}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Application Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.applications > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {stats?.applications || 0}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Total Applications</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {stats?.inProgress || 0}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {stats?.responseRate || 0}%
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Response Rate</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      No applications yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      Start applying to jobs to track your progress here.
                    </p>
                    <Button onClick={() => handleNavigateToPage('/jobs')}>
                      <Briefcase className="h-4 w-4 mr-2" />
                      Browse Jobs
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
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

export default Dashboard