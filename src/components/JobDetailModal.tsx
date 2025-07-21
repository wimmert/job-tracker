import React from 'react'
import { X, MapPin, Clock, DollarSign, ExternalLink, Building2, Users, Calendar } from 'lucide-react'
import { JobWithApplication, ApplicationStage } from '../types'
import { formatDate, formatSalary, getDaysAgo } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import Button from './ui/Button'

interface JobDetailModalProps {
  job: JobWithApplication
  onClose: () => void
  onStatusChange: (jobId: string, stage: ApplicationStage) => void
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose, onStatusChange }) => {
  const stageLabels = {
    not_applied: 'Not Applied',
    applied: 'Applied',
    phone_screen: 'Phone Screen',
    interview: 'Interview',
    final_round: 'Final Round',
    offer: 'Offer',
    rejected: 'Rejected'
  }

  const allStages: ApplicationStage[] = ['not_applied', 'applied', 'phone_screen', 'interview', 'final_round', 'offer', 'rejected']
  const currentStage = job.application?.stage || 'not_applied'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
              {job.expand?.company?.logoUrl ? (
                <img 
                  src={job.expand.company.logoUrl} 
                  alt={job.expand.company.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-8 w-8 text-slate-500" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{job.title}</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">{job.expand?.company?.name}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {getDaysAgo(job.firstSeenAt)}
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Description */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Job Description</h2>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Requirements</h2>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-slate-600 dark:text-slate-400">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Benefits</h2>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-slate-600 dark:text-slate-400">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Application Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Application Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {allStages.map((stage) => (
                      <button
                        key={stage}
                        onClick={() => onStatusChange(job.id, stage)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          stage === currentStage
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {stageLabels[stage]}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Job Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Department</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{job.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Job Type</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                      {job.jobType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Experience</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                      {job.experienceLevel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Posted</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {formatDate(job.firstSeenAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Company Info */}
              {job.expand?.company && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">About {job.expand.company.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Industry</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {job.expand.company.industry}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Size</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {job.expand.company.size || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Founded</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {job.expand.company.founded || 'Not specified'}
                      </span>
                    </div>
                    {job.expand.company.description && (
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                          {job.expand.company.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  className="w-full"
                  onClick={() => window.open(job.applicationUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
                {job.expand?.company?.careerPageUrl && (
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => window.open(job.expand?.company?.careerPageUrl, '_blank')}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    View All Jobs
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Application Notes */}
          {job.application?.notes && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Application Notes</h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">{job.application.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default JobDetailModal