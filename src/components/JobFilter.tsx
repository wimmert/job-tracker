import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Company, UserCompany } from '../../types'
import { api } from '../../lib/api'
import Header from '../../components/Layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Building2, Plus, X, ExternalLink, Bell, BellOff, Trash2, Users, Briefcase, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const CompaniesPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trackedCompanies, setTrackedCompanies] = useState<UserCompany[]>([])
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [notificationStates, setNotificationStates] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const [tracked, all] = await Promise.all([
        api.getTrackedCompanies(user.id),
        api.getAllCompanies()
      ])
      setTrackedCompanies(tracked)
      setAllCompanies(all)
      
      // Initialize notification states
      const initialStates: {[key: string]: boolean} = {}
      tracked.forEach(company => {
        initialStates[company.id] = company.notifications
      })
      setNotificationStates(initialStates)
      
      // Debug: Log the actual count
      console.log('Tracked companies count:', tracked.length)
      console.log('Tracked companies:', tracked.map(tc => tc.expand?.company?.name))
    } catch (error) {
      console.error('Error loading companies:', error)
      toast.error('Failed to load companies')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCompany = async (companyId: string) => {
    if (!user) return

    try {
      await api.addTrackedCompany(user.id, companyId)
      await loadData()
      toast.success('Company added successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to add company')
    }
  }

  const handleRemoveCompany = async (userCompanyId: string) => {
    if (!user) return

    try {
      await api.removeTrackedCompany(user.id, userCompanyId)
      await loadData()
      toast.success('Company removed successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove company')
    }
  }

  const handleToggleNotifications = async (userCompanyId: string, notifications: boolean) => {
    try {
      // Update local state immediately for responsive UI
      setNotificationStates(prev => ({
        ...prev,
        [userCompanyId]: notifications
      }))
      
      // In a real app, this would update the notifications setting via API
      // await api.updateCompanyNotifications(user.id, userCompanyId, notifications)
      
      toast.success(`Notifications ${notifications ? 'enabled' : 'disabled'}`)
    } catch (error: any) {
      // Revert state on error
      setNotificationStates(prev => ({
        ...prev,
        [userCompanyId]: !notifications
      }))
      toast.error('Failed to update notifications')
    }
  }

  const handleViewJobs = (companyId: string, companyName: string) => {
    // Navigate to Jobs page with company filter applied
    navigate('/jobs', { 
      state: { 
        companyId: companyId, 
        companyName: companyName 
      } 
    })
  }

  const filteredAllCompanies = allCompanies.filter(company => 
    !trackedCompanies.some(tc => tc.company === company.id) &&
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const AddCompanyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>Add Company to Track</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4">
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAllCompanies.map((company) => (
              <div key={company.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-6 w-6 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">{company.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{company.industry}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{company.headquarters}</p>
                  </div>
                </div>
                <Button onClick={() => handleAddCompany(company.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Track
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <Header title="Companies" />
      
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Add Company Button */}
        <div className="mb-6">
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : trackedCompanies.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No companies tracked yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Start tracking companies to see their job openings and get notified about new opportunities.
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Company
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trackedCompanies.map((userCompany) => {
              const company = userCompany.expand?.company
              if (!company) return null

              return (
                <Card key={userCompany.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Header with logo, name, and notification bell */}
                    <div className="flex items-start justify-between mb-4 relative">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                          {company.logoUrl ? (
                            <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
                          ) : (
                            <Building2 className="h-6 w-6 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{company.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{company.industry}</p>
                        </div>
                      </div>
                      
                      {/* Notification Bell */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleNotifications(userCompany.id, !notificationStates[userCompany.id])}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={notificationStates[userCompany.id] ? 'Disable notifications' : 'Enable notifications'}
                        >
                          {notificationStates[userCompany.id] ? (
                            <Bell className="h-5 w-5 text-blue-600 fill-current" />
                          ) : (
                            <BellOff className="h-5 w-5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Company Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{company.size || 'Size not specified'}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{company.headquarters}</span>
                      </div>
                    </div>

                    {/* Company Description */}
                    {company.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                        {company.description}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewJobs(company.id, company.name)}
                          className="flex-shrink-0"
                        >
                          <Briefcase className="h-4 w-4 mr-1" />
                          Jobs
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(company.careerPageUrl, '_blank', 'noopener,noreferrer')}
                          className="flex-shrink-0"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Website
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCompany(userCompany.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                          title="Remove company"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {showAddModal && <AddCompanyModal />}
    </div>
  )
}

export default CompaniesPage