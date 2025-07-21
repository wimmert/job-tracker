const PocketBase = require('pocketbase/cjs')

// Initialize PocketBase client
const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090')

async function authenticateAdmin() {
  try {
    await pb.admins.authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL || 'admin@example.com',
      process.env.POCKETBASE_ADMIN_PASSWORD || 'admin123456'
    )
    console.log('✅ PocketBase admin authenticated')
  } catch (error) {
    console.error('❌ PocketBase admin authentication failed:', error.message)
    throw error
  }
}

async function saveJobsToPocketBase(jobs) {
  console.log(`💾 [${new Date().toISOString()}] Starting database save operation...`)
  console.log(`📊 [${new Date().toISOString()}] Processing ${jobs.length} jobs for database insertion...`)
  
  try {
    await authenticateAdmin()
    console.log(`🔐 [${new Date().toISOString()}] PocketBase admin authentication successful`)
    
    let newJobs = 0
    let updatedJobs = 0
    let errors = 0
    
    // Process jobs in batches to avoid overwhelming the database
    const batchSize = 10
    for (let i = 0; i < jobs.length; i += batchSize) {
      console.log(`📦 [${new Date().toISOString()}] Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(jobs.length/batchSize)}...`)
      const batch = jobs.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (job) => {
        try {
          // First, ensure the company exists
          const company = await ensureCompanyExists(job.company, job.companySlug)
          
          console.log(`🔍 [${new Date().toISOString()}] Checking for existing job: ${job.title} at ${job.company}`)
          // Check if job already exists
          const existingJobs = await pb.collection('jobs').getList(1, 1, {
            filter: `title = "${job.title}" && company = "${company.id}" && location = "${job.location}"`
          })
          
          const jobData = {
            company: company.id,
            title: job.title,
            department: job.department,
            location: job.location,
            jobType: job.jobType,
            experienceLevel: job.experienceLevel,
            description: job.description,
            applicationUrl: job.applicationUrl,
            status: job.status,
            firstSeenAt: job.firstSeenAt,
            lastSeenAt: new Date().toISOString(),
            daysPosted: calculateDaysPosted(job.firstSeenAt),
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            requirements: job.requirements,
            benefits: job.benefits
          }
          
          if (existingJobs.items.length > 0) {
            // Update existing job
            const existingJob = existingJobs.items[0]
            await pb.collection('jobs').update(existingJob.id, {
              ...jobData,
              firstSeenAt: existingJob.firstSeenAt // Keep original first seen date
            })
            updatedJobs++
            console.log(`📝 [${new Date().toISOString()}] Updated: ${job.title} at ${job.company}`)
          } else {
            // Create new job
            await pb.collection('jobs').create(jobData)
            newJobs++
            console.log(`✨ [${new Date().toISOString()}] Created: ${job.title} at ${job.company}`)
          }
          
        } catch (error) {
          console.error(`❌ Error saving job "${job.title}" at ${job.company}:`, error.message)
          errors++
        }
      })
      
      await Promise.all(batchPromises)
      
      // Small delay between batches
      if (i + batchSize < jobs.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log(`⏳ [${new Date().toISOString()}] Waiting 500ms before next batch...`)
      }
    }
    
    console.log(`✅ [${new Date().toISOString()}] Database save completed: ${newJobs} new, ${updatedJobs} updated, ${errors} errors`)
    
    return {
      newJobs,
      updatedJobs,
      errors,
      total: jobs.length
    }
    
  } catch (error) {
    console.error('❌ Error saving jobs to PocketBase:', error.message)
    throw error
  }
}

async function ensureCompanyExists(companyName, companySlug) {
  try {
    // Check if company already exists
    const existingCompanies = await pb.collection('companies').getList(1, 1, {
      filter: `name = "${companyName}"`
    })
    
    if (existingCompanies.items.length > 0) {
      return existingCompanies.items[0]
    }
    
    // Create new company
    const companyData = {
      name: companyName,
      slug: companySlug || companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      careerPageUrl: getCompanyCareerUrl(companyName),
      industry: getCompanyIndustry(companyName),
      headquarters: getCompanyHeadquarters(companyName),
      status: 'active',
      scrapingConfig: {},
      logoUrl: null
    }
    
    const company = await pb.collection('companies').create(companyData)
    console.log(`🏢 Created company: ${companyName}`)
    
    return company
    
  } catch (error) {
    console.error(`❌ Error ensuring company exists for ${companyName}:`, error.message)
    throw error
  }
}

function getCompanyCareerUrl(companyName) {
  const urls = {
    'Anthropic': 'https://www.anthropic.com/careers',
    'Zipline': 'https://www.zipline.com/careers',
    'Wing': 'https://wing.com/careers',
    'Waymo': 'https://waymo.com/careers',
    'Zoox': 'https://zoox.com/careers',
    'AllTrails': 'https://www.alltrails.com/careers'
  }
  
  return urls[companyName] || `https://${companyName.toLowerCase()}.com/careers`
}

function getCompanyIndustry(companyName) {
  const industries = {
    'Anthropic': 'AI Safety',
    'Zipline': 'Drone Delivery',
    'Wing': 'Autonomous Delivery',
    'Waymo': 'Self-Driving Cars',
    'Zoox': 'Robotaxis',
    'AllTrails': 'Outdoor Recreation'
  }
  
  return industries[companyName] || 'Technology'
}

function getCompanyHeadquarters(companyName) {
  const headquarters = {
    'Anthropic': 'San Francisco, CA',
    'Zipline': 'South San Francisco, CA',
    'Wing': 'Palo Alto, CA',
    'Waymo': 'Mountain View, CA',
    'Zoox': 'Foster City, CA',
    'AllTrails': 'San Francisco, CA'
  }
  
  return headquarters[companyName] || 'San Francisco, CA'
}

function calculateDaysPosted(firstSeenAt) {
  const firstSeen = new Date(firstSeenAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - firstSeen.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

async function markJobsAsRemoved() {
  try {
    await authenticateAdmin()
    
    // Mark jobs as removed if they haven't been seen in 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const staleJobs = await pb.collection('jobs').getFullList({
      filter: `status = "active" && lastSeenAt < "${sevenDaysAgo.toISOString()}"`
    })
    
    let removedCount = 0
    
    for (const job of staleJobs) {
      await pb.collection('jobs').update(job.id, {
        status: 'closed',
        lastSeenAt: new Date().toISOString()
      })
      removedCount++
    }
    
    if (removedCount > 0) {
      console.log(`🗑️ Marked ${removedCount} jobs as removed`)
    }
    
    return removedCount
    
  } catch (error) {
    console.error('❌ Error marking jobs as removed:', error.message)
    return 0
  }
}

module.exports = {
  saveJobsToPocketBase,
  markJobsAsRemoved,
  ensureCompanyExists
}