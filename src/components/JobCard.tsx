import React, { useState } from 'react'
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Building2, 
  Calendar,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react'
import { JobWithApplication, ApplicationStage } from '../types'
import { formatDate, formatSalary, getDaysAgo } from '../lib/utils'
import { Card, CardContent } from './ui/Card'
import Button from './ui/Button'

interface JobCardProps {
  job: JobWithApplication
  isNew?: boolean
  onStatusChange: (jobId: string, stage: ApplicationStage) => void
  onHide: (jobId: string) => void
  onViewDetails: (job: JobWithApplication) => void
  isSelected?: boolean
  onSelect?: (jobId: string, selected: boolean) => void
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  isNew = false, 
  onStatusChange, 
  onHide, 
  onViewDetails,
  isSelected = false,
  onSelect
}) => {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

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

  const allStages: ApplicationStage[] = ['not_applied', 'applied', 'phone_screen', 'interview', 'final_round', 'offer', 'rejected']
  const currentStage = job.application?.stage || 'not_applied'

  const handleStatusUpdate = (newStage: ApplicationStage) => {
    onStatusChange(job.id, newStage)
    setShowStatusDropdown(false)
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

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 relative ${
      isNew ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
    } ${isSelected ? 'ring-2 ring-blue-600' : ''}`}>
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-white dark:bg-slate-800 rounded-md p-1 shadow-sm border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(job.id, e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* New Job Badge */}
      {isNew && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
            New
          </span>
        </div>
      )}

      <CardContent className="p-6">
        {/* Job Header */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {job.expand?.company?.logoUrl ? (
              <img 
                src={job.expand.company.logoUrl} 
                alt={job.expand?.company?.name || 'Company'}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-6 w-6 text-slate-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {/* Job Title - Make it prominent and visible */}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1 leading-tight">
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
                <DollarSign className="h-4 w-4 mr-1" />
                {formatSalary(job.salaryMin, job.salaryMax)}
              </div>
            </div>
          </div>
        </div>

        {/* Job Status and Timeline */}
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Job Status</h4>
            <div className="flex items-center space-x-2">
              {job.status === 'active' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                job.status === 'active' ? 'text-green-600' : 'text-red-600'
              }`}>
                {job.status === 'active' ? 'Active' : 'Removed'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-500 dark:text-slate-400">First seen</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{formatDate(job.firstSeenAt)}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Days active</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {calculateDaysActive(job.firstSeenAt, job.lastSeenAt, job.status)}
              </p>
            </div>
          </div>
        </div>

        {/* Application Status */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Application Status
            </span>
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${stageColors[currentStage]} hover:opacity-80 transition-opacity`}
              >
                <span>{stageLabels[currentStage]}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {showStatusDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 min-w-[140px]">
                  {allStages.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => handleStatusUpdate(stage)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg ${
                        stage === currentStage ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {stageLabels[stage]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Description Preview */}
        <div className="mb-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetails(job)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
          
          {job.status === 'active' && (
            <Button
              size="sm"
              onClick={() => window.open(job.applicationUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Apply
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onHide(job.id)}
            className="text-slate-500 hover:text-slate-700"
          >
            <EyeOff className="h-4 w-4 mr-1" />
            Hide
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default JobCard