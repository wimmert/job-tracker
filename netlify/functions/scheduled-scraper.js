const { schedule } = require('@netlify/functions')
const { scrapeAllCompanies } = require('./lib/scrapers')
const { saveJobsToPocketBase } = require('./lib/database')

// Scheduled function that runs daily at 6 AM UTC
const handler = schedule('0 6 * * *', async (event, context) => {
  console.log(`🚀 [${new Date().toISOString()}] Starting scheduled job scraping...`)
  console.log(`📅 [${new Date().toISOString()}] Scheduled run: Daily at 6:00 AM UTC`)
  
  try {
    const startTime = Date.now()
    console.log(`⏰ [${new Date().toISOString()}] Scraping session started`)
    
    // Scrape all companies
    console.log(`🌐 [${new Date().toISOString()}] Initiating company scraping...`)
    const allJobs = await scrapeAllCompanies()
    
    // Save to PocketBase
    console.log(`💾 [${new Date().toISOString()}] Saving results to database...`)
    const results = await saveJobsToPocketBase(allJobs)
    
    const duration = Date.now() - startTime
    console.log(`✅ [${new Date().toISOString()}] Scheduled scraping completed successfully`)
    console.log(`📊 [${new Date().toISOString()}] Results: ${results.newJobs} new jobs, ${results.updatedJobs} updated`)
    console.log(`⏱️ [${new Date().toISOString()}] Total duration: ${duration}ms`)
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Scheduled scraping completed successfully`,
        stats: {
          ...results,
          duration,
          timestamp: new Date().toISOString()
        }
      })
    }
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Scheduled scraping failed:`, error)
    console.error(`🔍 [${new Date().toISOString()}] Error details:`, error.stack)
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
})

module.exports = { handler }