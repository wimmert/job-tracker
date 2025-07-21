import PocketBase from 'pocketbase'

// PocketBase Integration Notes:
// - PocketBase connection only works in deployed environments (Netlify, Vercel, etc.)
// - In Bolt's development preview, PocketBase connections will fail due to CORS/network restrictions
// - Use Mock Data mode for development in Bolt, then test PocketBase after deployment
// - The dual-mode API automatically falls back to mock data when PocketBase is unavailable

// Basic PocketBase client setup
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090')

// Enable auto cancellation for duplicate requests
pb.autoCancellation(false)

// Detect if we're in a development environment (Bolt preview)
const isDevelopmentEnvironment = () => {
  // Check for Bolt-specific environment indicators
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('bolt.new') ||
    window.location.hostname.includes('stackblitz') ||
    window.location.port === '5173' ||
    import.meta.env.DEV
  )
}

// PocketBase connection test with development environment detection
export const testConnection = async () => {
  // Handle development environment gracefully
  if (isDevelopmentEnvironment()) {
    console.log('🔧 Development environment detected - PocketBase connections not available in Bolt preview')
    return { 
      success: false, 
      error: 'PocketBase connections are not available in development preview. Deploy to test PocketBase integration.',
      isDevelopment: true
    }
  }

  try {
    console.log('🔄 Testing PocketBase connection...')
    const response = await fetch(`${pb.baseUrl}/api/health`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const health = await response.json()
    console.log('✅ PocketBase connection successful:', health)
    return { success: true, data: health, isDevelopment: false }
  } catch (error: any) {
    console.log('❌ PocketBase connection failed:', error.message)
    return { 
      success: false, 
      error: error.message,
      isDevelopment: false
    }
  }
}

// Export the client as default
export default pb