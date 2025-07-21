import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useDataMode } from '../../hooks/useDataMode'
import { dualModeAPI } from '../../lib/dualModeApi'
import pb, { testConnection } from '../../lib/pocketbase'
import ScrapingStatus from '../../components/ScrapingStatus'
import Header from '../../components/Layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Database, CheckCircle, XCircle, Settings, Wifi, WifiOff, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const SettingsPage = () => {
  const { user } = useAuth()
  const { dataMode, setDataMode, isUsingMockData, isUsingPocketBase } = useDataMode()
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'disconnected' | 'error'>('idle')
  const [connectionDetails, setConnectionDetails] = useState<any>(null)
  const [testingConnection, setTestingConnection] = useState(false)

  const handleScrapingComplete = () => {
    // Refresh data after scraping
    toast.success('Data refreshed after scraping')
  }

  // Sync data mode with dual API
  useEffect(() => {
    dualModeAPI.setDataMode(dataMode)
  }, [dataMode])

  // Test connection on component mount
  useEffect(() => {
    handleTestConnection()
  }, [])

  const handleTestConnection = async () => {
    console.log('🔄 Testing PocketBase connection...')
    setTestingConnection(true)
    setConnectionStatus('testing')
    
    try {
      const result = await testConnection()
      console.log('📊 Connection test result:', result)
      
      setConnectionDetails({
        url: pb.baseUrl,
        timestamp: new Date().toISOString(),
        ...result
      })
      
      if (result.success) {
        setConnectionStatus('connected')
        console.log('✅ PocketBase connection successful!')
        toast.success('PocketBase is reachable!')
      } else {
        setConnectionStatus('disconnected')
        console.log('❌ PocketBase connection failed:', result.error)
        toast.error('PocketBase is not reachable')
      }
    } catch (error: any) {
      console.error('❌ Connection test error:', error)
      setConnectionStatus('error')
      setConnectionDetails({
        url: pb.baseUrl,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      })
      toast.error('Connection test failed')
    } finally {
      setTestingConnection(false)
    }
  }

  const handleDataModeChange = (newMode: 'mock' | 'pocketbase') => {
    console.log(`🔄 Switching data mode to: ${newMode}`)
    
    handleSmartDataModeChange(newMode)
  }

  const handleForceDataModeChange = (newMode: 'mock' | 'pocketbase') => {
    console.log(`🔄 Force switching data mode to: ${newMode}`)
    
    setDataMode(newMode)
    dualModeAPI.setDataMode(newMode)
  }

  const handleSmartDataModeChange = async (newMode: 'mock' | 'pocketbase') => {
    console.log(`🔄 Smart switching data mode to: ${newMode}`)
    
    if (newMode === 'mock') {
      setDataMode(newMode)
      dualModeAPI.setDataMode(newMode)
      toast.success('Switched to Mock Data mode')
      return
    }
    
    // Switching to PocketBase mode - test connection first
    if (newMode === 'pocketbase') {
      console.log('🔄 Testing PocketBase connection before switching...')
      
      // Show loading state
      const loadingToast = toast.loading('Testing PocketBase connection...')
      
      try {
        const result = await testConnection()
        toast.dismiss(loadingToast)
        
        if (result.success) {
          // Connection successful - switch to real data mode
          console.log('✅ PocketBase connection successful, switching to real data mode')
          setDataMode(newMode)
          dualModeAPI.setDataMode(newMode)
          setConnectionStatus('connected')
          setConnectionDetails({
            url: pb.baseUrl,
            timestamp: new Date().toISOString(),
            ...result
          })
          toast.success('Connected to PocketBase - using real data!')
        } else {
          // Connection failed - stay in mock mode
          console.log('❌ PocketBase connection failed, staying in mock mode')
          toast.error('PocketBase not reachable - staying in mock data mode')
          setConnectionStatus('disconnected')
          setConnectionDetails({
            url: pb.baseUrl,
            timestamp: new Date().toISOString(),
            ...result
          })
          // Don't change the data mode - keep it as mock
        }
      } catch (error: any) {
        console.error('❌ Connection test error:', error)
        toast.dismiss(loadingToast)
        toast.error('Connection test failed - staying in mock data mode')
        setConnectionStatus('error')
        setConnectionDetails({
          url: pb.baseUrl,
          timestamp: new Date().toISOString(),
          success: false,
          error: error.message
        })
        // Don't change the data mode - keep it as mock
      }
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'disconnected':
        return <WifiOff className="h-5 w-5 text-red-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'testing':
        return <Wifi className="h-5 w-5 text-blue-600 animate-pulse" />
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected'
      case 'disconnected':
        return 'Not Running'
      case 'error':
        return 'Connection Error'
      case 'testing':
        return 'Testing...'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600'
      case 'disconnected':
        return 'text-red-600'
      case 'error':
        return 'text-red-600'
      case 'testing':
        return 'text-blue-600'
      default:
        return 'text-yellow-600'
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <Header 
        title="Settings" 
        subtitle="Manage your account settings and preferences"
      />
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* User Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">User Information</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Name: {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Email: {user?.email}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Subscription: {user?.subscriptionTier}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Mode Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Data Source Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Mode Display */}
                <div className={`p-4 rounded-lg ${isUsingMockData ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                  <div className="flex items-center mb-2">
                    <Database className={`h-5 w-5 mr-2 ${isUsingMockData ? 'text-blue-600' : 'text-green-600'}`} />
                    <span className={`font-medium ${isUsingMockData ? 'text-blue-900 dark:text-blue-300' : 'text-green-900 dark:text-green-300'}`}>
                      {isUsingMockData ? 'Development Mode (Mock Data)' : 'Production Mode (Real Data)'}
                    </span>
                  </div>
                  <p className={`text-sm ${isUsingMockData ? 'text-blue-800 dark:text-blue-300' : 'text-green-800 dark:text-green-300'}`}>
                    {isUsingMockData 
                      ? 'App is using mock authentication and sample data for development. All functionality works with simulated data.'
                      : 'App is connected to PocketBase and using real data. All changes are persisted to the database.'
                    }
                  </p>
                </div>

                {/* Data Mode Toggle */}
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Data Source</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Choose between mock data (development) or real data (PocketBase)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSmartDataModeChange('mock')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        isUsingMockData
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      Mock Data
                    </button>
                    <button
                      onClick={() => handleSmartDataModeChange('pocketbase')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        isUsingPocketBase
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      Real Data
                    </button>
                  </div>
                </div>

                {/* Warning for Real Data Mode */}
                {isUsingPocketBase && (
                  <div className={`p-3 rounded-lg border ${
                    connectionStatus === 'connected'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  }`}>
                    <div className="flex items-start">
                      {connectionStatus === 'connected' ? (
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="text-sm">
                        <p className={`font-medium mb-1 ${
                          connectionStatus === 'connected'
                            ? 'text-green-800 dark:text-green-300'
                            : 'text-yellow-800 dark:text-yellow-300'
                        }`}>
                          Real Data Mode Active {connectionStatus === 'connected' ? '(Connected)' : '(With Fallback)'}
                        </p>
                        <p className={`${
                          connectionStatus === 'connected'
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {connectionStatus === 'connected'
                            ? 'App is connected to PocketBase and using real data. All changes will be saved to the database.'
                            : 'App will attempt to use PocketBase data, but will fall back to mock data if connection fails.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* PocketBase Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                PocketBase Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center mb-2">
                  {getStatusIcon()}
                  <span className={`font-medium ml-2 ${getStatusColor()}`}>
                    PocketBase: {getStatusText()}
                  </span>
                </div>
                <Button 
                  onClick={handleTestConnection}
                  loading={testingConnection}
                  variant={connectionStatus === 'connected' ? 'secondary' : 'primary'}
                  disabled={testingConnection}
                >
                  {testingConnection ? (
                    <>
                      <Wifi className="h-4 w-4 mr-2 animate-pulse" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {connectionStatus === 'connected' 
                  ? 'PocketBase is reachable and ready for real data mode.'
                  : 'PocketBase connection required to use real data mode.'
                }
              </p>

              {connectionDetails && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Connection Details
                  </h4>
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <p><strong>URL:</strong> {connectionDetails.url}</p>
                    <p><strong>Status:</strong> {connectionDetails.success ? 'Reachable' : 'Not Reachable'}</p>
                    <p><strong>Last Tested:</strong> {new Date(connectionDetails.timestamp).toLocaleString()}</p>
                    {connectionDetails.error && (
                      <p><strong>Error:</strong> {connectionDetails.error}</p>
                    )}
                    {connectionDetails.data && (
                      <p><strong>Response:</strong> {JSON.stringify(connectionDetails.data)}</p>
                    )}
                  </div>
                </div>
              )}

              {!isUsingPocketBase && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start">
                    <Database className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                        Mock Data Mode Active
                      </p>
                      <p className="text-blue-700 dark:text-blue-400">
                        App currently uses mock data for development. Switch to "Real Data" mode 
                        to attempt PocketBase connection with automatic fallback to mock data.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Web Scraping Control */}
          <div className="space-y-6">
            <ScrapingStatus onManualScrape={handleScrapingComplete} />
          </div>

          {/* Migration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Migration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Companies Data</span>
                  <span className="text-sm font-medium text-green-600">✓ Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Jobs Data</span>
                  <span className="text-sm font-medium text-green-600">✓ Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Applications Data</span>
                  <span className="text-sm font-medium text-yellow-600">⚠ Partial</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">User Authentication</span>
                  <span className="text-sm font-medium text-yellow-600">⚠ Mock Only</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Companies and Jobs integration complete!</strong> You can now switch to "Real Data" mode 
                  to fetch companies and jobs from PocketBase. The system will automatically fall back to mock data if needed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage