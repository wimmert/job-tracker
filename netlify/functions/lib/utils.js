// Utility functions for web scraping

function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  return new Promise((resolve, reject) => {
    let retries = 0
    
    function attempt() {
      fn()
        .then(resolve)
        .catch(error => {
          retries++
          if (retries >= maxRetries) {
            reject(error)
          } else {
            const delay = baseDelay * Math.pow(2, retries - 1) + Math.random() * 1000
            console.log(`⏳ Retry ${retries}/${maxRetries} in ${Math.round(delay)}ms...`)
            setTimeout(attempt, delay)
          }
        })
    }
    
    attempt()
  })
}

function normalizeJobData(job) {
  return {
    id: generateJobId(job),
    title: job.title?.trim() || '',
    department: job.department?.trim() || 'Engineering',
    location: job.location?.trim() || 'Remote',
    jobType: job.jobType || 'full_time',
    experienceLevel: job.experienceLevel || 'mid',
    description: job.description?.trim() || '',
    applicationUrl: job.applicationUrl || '',
    status: job.status || 'active',
    firstSeenAt: job.firstSeenAt || new Date().toISOString(),
    lastSeenAt: job.lastSeenAt || new Date().toISOString(),
    daysPosted: job.daysPosted || 0,
    salaryMin: job.salaryMin || null,
    salaryMax: job.salaryMax || null,
    requirements: job.requirements || [],
    benefits: job.benefits || []
  }
}

function generateJobId(job) {
  // Create a consistent ID based on company, title, and location
  const key = `${job.company}-${job.title}-${job.location}`.toLowerCase()
  return key.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function extractJobDetails(title) {
  const titleLower = title.toLowerCase()
  
  // Determine job type
  let jobType = 'full_time'
  if (titleLower.includes('intern') || titleLower.includes('internship')) {
    jobType = 'internship'
  } else if (titleLower.includes('contract') || titleLower.includes('contractor')) {
    jobType = 'contract'
  } else if (titleLower.includes('part-time') || titleLower.includes('part time')) {
    jobType = 'part_time'
  }
  
  // Determine experience level
  let experienceLevel = 'mid'
  if (titleLower.includes('junior') || titleLower.includes('entry') || titleLower.includes('intern')) {
    experienceLevel = 'entry'
  } else if (titleLower.includes('senior') || titleLower.includes('sr.') || titleLower.includes('sr ')) {
    experienceLevel = 'senior'
  } else if (titleLower.includes('staff') || titleLower.includes('lead')) {
    experienceLevel = 'staff'
  } else if (titleLower.includes('principal') || titleLower.includes('architect') || titleLower.includes('director')) {
    experienceLevel = 'principal'
  }
  
  return { jobType, experienceLevel }
}

function parseLocation(locationText) {
  if (!locationText) return null
  
  const text = locationText.trim()
  
  // Handle common location formats
  if (text.toLowerCase().includes('remote')) {
    return 'Remote'
  }
  
  // Extract city, state format
  const match = text.match(/([^,]+),\s*([A-Z]{2})/i)
  if (match) {
    return `${match[1].trim()}, ${match[2].toUpperCase()}`
  }
  
  // Return as-is if no pattern matches
  return text
}

function parseSalary(salaryText) {
  if (!salaryText) return { min: null, max: null }
  
  const text = salaryText.replace(/[,$]/g, '')
  
  // Look for range pattern like "120000-180000" or "120k-180k"
  const rangeMatch = text.match(/(\d+)k?\s*[-–]\s*(\d+)k?/i)
  if (rangeMatch) {
    let min = parseInt(rangeMatch[1])
    let max = parseInt(rangeMatch[2])
    
    // Handle k notation
    if (text.includes('k') || text.includes('K')) {
      min *= 1000
      max *= 1000
    }
    
    return { min, max }
  }
  
  // Look for single value
  const singleMatch = text.match(/(\d+)k?/i)
  if (singleMatch) {
    let value = parseInt(singleMatch[1])
    if (text.includes('k') || text.includes('K')) {
      value *= 1000
    }
    return { min: value, max: value }
  }
  
  return { min: null, max: null }
}

function cleanText(text) {
  if (!text) return ''
  
  return text
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/[^\w\s.,!?()-]/g, '')  // Remove special characters
    .trim()
}

function isValidJob(job) {
  return job.title && 
         job.title.length > 3 && 
         job.applicationUrl && 
         job.company
}

module.exports = {
  retryWithBackoff,
  normalizeJobData,
  generateJobId,
  extractJobDetails,
  parseLocation,
  parseSalary,
  cleanText,
  isValidJob
}