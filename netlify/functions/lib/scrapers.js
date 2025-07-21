const axios = require('axios')
const cheerio = require('cheerio')
const { retryWithBackoff, normalizeJobData, generateJobId } = require('./utils')

// Company-specific scrapers
const scrapers = {
  anthropic: require('./scrapers/anthropic'),
  zipline: require('./scrapers/zipline'),
  wing: require('./scrapers/wing'),
  waymo: require('./scrapers/waymo'),
  zoox: require('./scrapers/zoox'),
  alltrails: require('./scrapers/alltrails')
}

// Company configurations
const companies = {
  anthropic: {
    name: 'Anthropic',
    slug: 'anthropic',
    careerPageUrl: 'https://www.anthropic.com/careers',
    industry: 'AI Safety',
    headquarters: 'San Francisco, CA'
  },
  zipline: {
    name: 'Zipline',
    slug: 'zipline',
    careerPageUrl: 'https://www.zipline.com/careers',
    industry: 'Drone Delivery',
    headquarters: 'South San Francisco, CA'
  },
  wing: {
    name: 'Wing',
    slug: 'wing',
    careerPageUrl: 'https://wing.com/careers',
    industry: 'Autonomous Delivery',
    headquarters: 'Palo Alto, CA'
  },
  waymo: {
    name: 'Waymo',
    slug: 'waymo',
    careerPageUrl: 'https://waymo.com/careers',
    industry: 'Self-Driving Cars',
    headquarters: 'Mountain View, CA'
  },
  zoox: {
    name: 'Zoox',
    slug: 'zoox',
    careerPageUrl: 'https://zoox.com/careers',
    industry: 'Robotaxis',
    headquarters: 'Foster City, CA'
  },
  alltrails: {
    name: 'AllTrails',
    slug: 'alltrails',
    careerPageUrl: 'https://www.alltrails.com/careers',
    industry: 'Outdoor Recreation',
    headquarters: 'San Francisco, CA'
  }
}

async function scrapeCompany(companySlug) {
  const company = companies[companySlug]
  const scraper = scrapers[companySlug]
  
  if (!company || !scraper) {
    throw new Error(`Unknown company: ${companySlug}`)
  }
  
  console.log(`🔄 [${new Date().toISOString()}] Starting ${company.name} scraper...`)
  console.log(`🌐 [${new Date().toISOString()}] Fetching ${company.careerPageUrl}...`)
  
  try {
    const startTime = Date.now()
    
    const jobs = await retryWithBackoff(async () => {
      return await scraper.scrape(company)
    }, 3, 1000)
    
    const duration = Date.now() - startTime
    
    // Normalize and add metadata
    const normalizedJobs = jobs.map(job => ({
      ...normalizeJobData(job),
      company: company.name,
      companySlug: company.slug,
      scrapedAt: new Date().toISOString(),
      source: 'scraper'
    }))
    
    console.log(`📊 [${new Date().toISOString()}] ${company.name}: Found ${normalizedJobs.length} jobs`)
    console.log(`⏱️ [${new Date().toISOString()}] ${company.name}: Completed in ${duration}ms`)
    console.log(`💾 [${new Date().toISOString()}] ${company.name}: Saving to database...`)
    return normalizedJobs
    
  } catch (error) {
    console.error(`❌ Failed to scrape ${company.name}:`, error.message)
    return []
  }
}

async function scrapeAllCompanies() {
  console.log(`🚀 [${new Date().toISOString()}] Starting scheduled scraping for all companies...`)
  console.log(`📋 [${new Date().toISOString()}] Companies to scrape: ${Object.keys(companies).join(', ')}`)
  
  const allJobs = []
  const companyResults = []
  
  // Scrape companies in parallel with concurrency limit
  const concurrency = 3
  const companyKeys = Object.keys(companies)
  
  for (let i = 0; i < companyKeys.length; i += concurrency) {
    const batch = companyKeys.slice(i, i + concurrency)
    
    const batchPromises = batch.map(async (companySlug) => {
      console.log(`🔄 [${new Date().toISOString()}] Processing ${companySlug} in batch ${Math.floor(i/concurrency) + 1}...`)
      try {
        const jobs = await scrapeCompany(companySlug)
        companyResults.push({
          company: companies[companySlug].name,
          jobs: jobs.length,
          success: true
        })
        console.log(`✅ [${new Date().toISOString()}] ${companySlug}: Batch completed successfully`)
        return jobs
      } catch (error) {
        console.error(`❌ Batch scraping failed for ${companySlug}:`, error.message)
        companyResults.push({
          company: companies[companySlug].name,
          jobs: 0,
          success: false,
          error: error.message
        })
        return []
      }
    })
    
    const batchResults = await Promise.all(batchPromises)
    allJobs.push(...batchResults.flat())
    
    // Small delay between batches to be respectful
    if (i + concurrency < companyKeys.length) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log(`⏳ [${new Date().toISOString()}] Waiting 2s before next batch...`)
    }
  }
  
  console.log('📊 Scraping summary:')
  companyResults.forEach(result => {
    const status = result.success ? '✅' : '❌'
    console.log(`  ${status} ${result.company}: ${result.jobs} jobs${result.error ? ` (${result.error})` : ''}`)
  })
  
  console.log(`🎯 [${new Date().toISOString()}] Scraping completed!`)
  console.log(`📊 [${new Date().toISOString()}] Total jobs found: ${allJobs.length}`)
  return allJobs
}

module.exports = {
  scrapeCompany,
  scrapeAllCompanies,
  companies
}