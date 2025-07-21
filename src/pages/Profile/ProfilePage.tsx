import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import Header from '../../components/Layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { User, Crown, Calendar, Target, Briefcase, Building2, TrendingUp, Clock } from 'lucide-react'
import { formatDate, getInitials } from '../../lib/utils'

const ProfilePage = () => {
  const { user } = useAuth()

  if (!user) return null

  const stats = {
    totalApplications: 12,
    companiesTracked: 4,
    jobsViewed: 156,
    responseRate: 25,
    avgResponseTime: '3.2 days',
    accountAge: '2 months'
  }

  const recentActivity = [
    { action: 'Applied to Senior Frontend Engineer at Anthropic', date: '2024-01-19T10:30:00Z' },
    { action: 'Added Waymo to tracked companies', date: '2024-01-18T15:45:00Z' },
    { action: 'Updated application status for Zipline position', date: '2024-01-17T09:15:00Z' },
    { action: 'Viewed 8 new job postings', date: '2024-01-16T14:20:00Z' },
    { action: 'Applied to Product Manager role at Wing', date: '2024-01-15T11:00:00Z' }
  ]

  const StatCard = ({ icon: Icon, title, value, subtitle }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <Header title="Profile" subtitle="Your account information and activity" />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {getInitials(user.firstName, user.lastName)}
                  </span>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
                  <div className="flex items-center mt-2">
                    <Crown className={`h-4 w-4 mr-2 ${user.subscriptionTier === 'premium' ? 'text-yellow-500' : 'text-slate-400'}`} />
                    <span className={`text-sm font-medium capitalize ${user.subscriptionTier === 'premium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {user.subscriptionTier} Member
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Member since</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {formatDate(user.created)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              icon={Target}
              title="Applications"
              value={stats.totalApplications}
              subtitle={`${stats.responseRate}% response rate`}
            />
            <StatCard
              icon={Building2}
              title="Companies Tracked"
              value={stats.companiesTracked}
              subtitle="Active tracking"
            />
            <StatCard
              icon={Briefcase}
              title="Jobs Viewed"
              value={stats.jobsViewed}
              subtitle="All time"
            />
            <StatCard
              icon={TrendingUp}
              title="Success Rate"
              value={`${stats.responseRate}%`}
              subtitle="Interview rate"
            />
            <StatCard
              icon={Clock}
              title="Avg Response"
              value={stats.avgResponseTime}
              subtitle="From application"
            />
            <StatCard
              icon={Calendar}
              title="Account Age"
              value={stats.accountAge}
              subtitle="Active member"
            />
          </div>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <p className="text-slate-900 dark:text-slate-100">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <p className="text-slate-900 dark:text-slate-100">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Subscription Tier
                  </label>
                  <p className="text-slate-900 dark:text-slate-100 capitalize">
                    {user.subscriptionTier}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Timezone
                  </label>
                  <p className="text-slate-900 dark:text-slate-100">{user.timezone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Account Created
                  </label>
                  <p className="text-slate-900 dark:text-slate-100">
                    {formatDate(user.created)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Last Updated
                  </label>
                  <p className="text-slate-900 dark:text-slate-100">
                    {formatDate(user.updated)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        {activity.action}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {formatDate(activity.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="h-5 w-5 mr-2" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    {user.subscriptionTier === 'premium' ? 'Premium Plan' : 'Free Plan'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {user.subscriptionTier === 'premium' 
                      ? 'Unlimited job tracking and advanced analytics'
                      : 'Track up to 5 companies and 50 applications'
                    }
                  </p>
                  {user.subscriptionTier === 'premium' && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ Premium features enabled
                    </p>
                  )}
                </div>
                {user.subscriptionTier === 'free' && (
                  <Button>
                    Upgrade to Premium
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage