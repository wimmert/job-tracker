const { scrapeAllCompanies, scrapeCompany } = require('./lib/scrapers')
const { saveJobsToPocketBase } = require('./lib/database')

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const { company } = event.queryStringParameters || {}
    
    console.log(`🔄 [${new Date().toISOString()}] Manual scraping triggered${company ? ` for ${company}` : ' for all companies'}`)
    console.log(`👤 [${new Date().toISOString()}] Triggered by user request`)
    
    const startTime = Date.now()
    let jobs = []
    
    if (company) {
      // Scrape specific company
      console.log(`🎯 [${new Date().toISOString()}] Targeting specific company: ${company}`)
      jobs = await scrapeCompany(company)
    } else {
      // Scrape all companies
      console.log(`🌐 [${new Date().toISOString()}] Scraping all companies`)
      jobs = await scrapeAllCompanies()
    }
    
    // Save to PocketBase
    console.log(`💾 [${new Date().toISOString()}] Saving ${jobs.length} jobs to database...`)
    const results = await saveJobsToPocketBase(jobs)
    
    const duration = Date.now() - startTime
    console.log(`✅ [${new Date().toISOString()}] Manual scraping completed successfully`)
    console.log(`📊 [${new Date().toISOString()}] Results: ${results.newJobs} new jobs, ${results.updatedJobs} updated`)
    console.log(`⏱️ [${new Date().toISOString()}] Total duration: ${duration}ms`)
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Manual scraping completed successfully`,
        stats: {
          ...results,
          duration,
          timestamp: new Date().toISOString()
        },
        jobs: jobs.length,
        target: company || 'all companies'
      })
    }
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Manual scraping failed:`, error)
    console.error(`🔍 [${new Date().toISOString()}] Error details:`, error.stack)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
}