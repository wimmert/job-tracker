import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useDataMode } from '../../hooks/useDataMode'
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
  const { dataMode, isUsingMockData, isUsingPocketBase } = useDataMode()
  const navigate = useNavigate()
  const [trackedCompanies, setTrackedCompanies] = useState<UserCompany[]>([])
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [companiesLoading, setCompaniesLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [notificationStates, setNotificationStates] = useState<{[key: string]: boolean}>({})
  const [dataSource, setDataSource] = useState<'mock' | 'real'>('mock')

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    setCompaniesLoading(true)
    
    // Determine data source based on mode and what actually gets returned
    const initialDataSource = isUsingMockData ? 'mock' : 'real'
    
    try {
      console.log(`🔄 Loading companies data in ${dataMode} mode...`)
      
      const [tracked, all] = await Promise.all([
        api.getTrackedCompanies(user.id),
        api.getAllCompanies()
      ])
      
      setTrackedCompanies(tracked)
      setAllCompanies(all)
      
      // Detect if we actually got real data or fell back to mock
      if (isUsingPocketBase && all.length > 0) {
        // Check if this looks like real PocketBase data (has PocketBase-style IDs)
        const hasRealData = all.some(company => 
          company.id && !company.id.startsWith('anthropic') && !company.id.startsWith('zipline')
        )
        setDataSource(hasRealData ? 'real' : 'mock')
        console.log(`📊 Data source detected: ${hasRealData ? 'real PocketBase data' : 'mock data fallback'}`)
      } else {
        setDataSource('mock')
        console.log('📝 Using mock data')
      }
      
      // Initialize notification states
      const initialStates: {[key: string]: boolean} = {}
      tracked.forEach(company => {
        initialStates[company.id] = company.notifications
      })
      setNotificationStates(initialStates)
      
      console.log(`✅ Companies data loaded successfully (${dataSource} data)`)
    } catch (error) {
      console.error('❌ Error loading companies:', error)
      setDataSource('mock') // Fallback to mock on error
      toast.error('Failed to load companies')
    } finally {
      setLoading(false)
      setCompaniesLoading(false)
    }
  }

  const handleAddCompany = async (companyId: string) => {
    if (!user) return

    try {
      await api.addTrackedCompany(user.id, companyId)
      await loadData()
      toast.success('Company added successfully!')
      // Keep modal open for adding more companies
      setSearchTerm('') // Clear search to show all companies again
    } catch (error: any) {
      toast.error(error.message || 'Failed to add company')
    }
  }

  const handleRemoveCompany = async (userCompanyId: string, companyName: string) => {
    if (!user) return

    const confirmed = window.confirm(`Are you sure you want to stop tracking ${companyName}?`)
    if (!confirmed) return

    console.log(`🗑️ Removing company: ${companyName} (ID: ${userCompanyId})`)

    try {
      await api.removeTrackedCompany(user.id, userCompanyId)
      console.log('✅ Company removal API call completed')
      await loadData()
      console.log('✅ Data reloaded after company removal')
      toast.success('Company removed successfully!')
    } catch (error: any) {
      console.error('❌ Error removing company:', error)
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

  const handleCloseModal = () => {
    setShowAddModal(false)
    setSearchTerm('')
  }

  const filteredAllCompanies = allCompanies.filter(company => 
    !trackedCompanies.some(tc => tc.company === company.id) &&
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const AddCompanyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle>Add Companies to Track</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Add multiple companies to track their job openings
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseModal}
          >
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
          
          {trackedCompanies.length > 0 && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-300">
                ✓ Currently tracking {trackedCompanies.length} companies
              </p>
            </div>
          )}
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAllCompanies.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  {searchTerm ? 'No companies found matching your search.' : 'All available companies are already being tracked.'}
                </p>
                {searchTerm && (
                  <Button variant="ghost" onClick={() => setSearchTerm('')} className="mt-2">
                    Show All Companies
                  </Button>
                )}
              </div>
            ) : (
              filteredAllCompanies.map((company) => (
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
              ))
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <Button onClick={handleCloseModal}>
              Done Adding Companies
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <Header 
        title="Companies" 
        subtitle={
          companiesLoading 
            ? "Loading companies..." 
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
                <>✓ Using Real Data from PocketBase</>
              ) : (
                <>📝 Using Mock Data{isUsingPocketBase ? ' (Connection Failed)' : ' (Development Mode)'}</>
              )}
            </div>
          </div>
        )}

        {/* Add Company Button */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
            
            {/* Debug Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (user && window.confirm('Clear all localStorage data? This will reset all tracked companies and applications.')) {
                    try {
                      await api.clearAllUserData(user.id)
                      toast.success('All data cleared')
                      window.location.reload()
                    } catch (error) {
                      toast.error('Failed to clear data')
                    }
                  }
                }}
                className="text-red-600 hover:text-red-700"
              >
                Clear All Data
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (user && window.confirm('Reset to original mock data? This will restore default companies and applications.')) {
                    try {
                      await api.resetUserData(user.id)
                      toast.success('Data reset to defaults')
                      window.location.reload()
                    } catch (error) {
                      toast.error('Failed to reset data')
                    }
                  }
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Reset to Defaults
              </Button>
            </div>
          </div>
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
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleToggleNotifications(userCompany.id, !notificationStates[userCompany.id])
                          }}
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
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleViewJobs(company.id, company.name)
                          }}
                          className="flex-shrink-0"
                        >
                          <Briefcase className="h-4 w-4 mr-1" />
                          Jobs
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            window.open(company.careerPageUrl, '_blank', 'noopener,noreferrer')
                          }}
                          className="flex-shrink-0"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Website
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleRemoveCompany(userCompany.id, company.name)
                          }}
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