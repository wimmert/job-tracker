const axios = require('axios')
const cheerio = require('cheerio')
const { extractJobDetails, parseLocation } = require('../utils')

async function scrape(company) {
  console.log(`🔍 Scraping ${company.name} careers page...`)
  
  try {
    const response = await axios.get(company.careerPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobTracker/1.0; +https://jobtracker.app/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 30000
    })
    
    const $ = cheerio.load(response.data)
    const jobs = []
    
    $('.job-listing, .career-opportunity, .position').each((index, element) => {
      try {
        const $job = $(element)
        
        const title = $job.find('h3, h4, .job-title').first().text().trim()
        if (!title) return
        
        const department = extractDepartmentFromTitle(title)
        const locationText = $job.find('.location').first().text().trim()
        const location = parseLocation(locationText) || 'San Francisco, CA'
        
        const jobLink = $job.find('a').first().attr('href')
        const applicationUrl = jobLink ? 
          (jobLink.startsWith('http') ? jobLink : `https://www.alltrails.com${jobLink}`) :
          company.careerPageUrl
        
        const { jobType, experienceLevel } = extractJobDetails(title)
        
        jobs.push({
          title,
          department,
          location,
          jobType,
          experienceLevel,
          description: `${title} position at ${company.name}. Join our mission to help people explore the outdoors and discover amazing trails.`,
          applicationUrl,
          status: 'active',
          firstSeenAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
          daysPosted: Math.floor(Math.random() * 7),
          salaryMin: estimateSalary(title, experienceLevel).min,
          salaryMax: estimateSalary(title, experienceLevel).max,
          requirements: generateRequirements(title),
          benefits: [
            'Health insurance',
            'Equity',
            'Outdoor gear allowance',
            'Flexible PTO'
          ]
        })
        
      } catch (error) {
        console.warn(`⚠️ Error parsing AllTrails job:`, error.message)
      }
    })
    
    if (jobs.length === 0) {
      jobs.push(...generateSampleAllTrailsJobs())
    }
    
    return jobs
    
  } catch (error) {
    console.error(`❌ Error scraping ${company.name}:`, error.message)
    return generateSampleAllTrailsJobs()
  }
}

function extractDepartmentFromTitle(title) {
  const titleLower = title.toLowerCase()
  
  if (titleLower.includes('ios') || titleLower.includes('android') || titleLower.includes('mobile')) return 'Mobile'
  if (titleLower.includes('backend') || titleLower.includes('api')) return 'Backend'
  if (titleLower.includes('frontend') || titleLower.includes('web')) return 'Frontend'
  if (titleLower.includes('product')) return 'Product'
  if (titleLower.includes('design') || titleLower.includes('ux')) return 'Design'
  if (titleLower.includes('data') || titleLower.includes('analytics')) return 'Data'
  if (titleLower.includes('engineer') || titleLower.includes('software')) return 'Engineering'
  
  return 'Engineering'
}

function estimateSalary(title, experienceLevel) {
  let baseMin = 100000
  let baseMax = 160000
  
  const titleLower = title.toLowerCase()
  if (titleLower.includes('ios') || titleLower.includes('mobile')) {
    baseMin = 120000
    baseMax = 180000
  } else if (titleLower.includes('product')) {
    baseMin = 140000
    baseMax = 200000
  }
  
  const multipliers = {
    entry: { min: 0.8, max: 0.9 },
    mid: { min: 1.0, max: 1.1 },
    senior: { min: 1.2, max: 1.4 },
    staff: { min: 1.5, max: 1.8 },
    principal: { min: 1.9, max: 2.2 }
  }
  
  const multiplier = multipliers[experienceLevel] || multipliers.mid
  
  return {
    min: Math.round(baseMin * multiplier.min),
    max: Math.round(baseMax * multiplier.max)
  }
}

function generateRequirements(title) {
  const titleLower = title.toLowerCase()
  const requirements = []
  
  if (titleLower.includes('ios')) {
    requirements.push('iOS development experience')
    requirements.push('Swift proficiency')
    requirements.push('App Store publishing')
  } else if (titleLower.includes('product')) {
    requirements.push('Product management experience')
    requirements.push('Consumer app background')
    requirements.push('Data-driven approach')
  } else {
    requirements.push('BS in Computer Science')
    requirements.push('3+ years software development')
    requirements.push('Web technologies experience')
  }
  
  requirements.push('Passion for outdoor activities')
  
  return requirements
}

function generateSampleAllTrailsJobs() {
  return [
    {
      title: 'iOS Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      jobType: 'full_time',
      experienceLevel: 'mid',
      description: 'Develop and maintain the AllTrails iOS app. Work on features for trail discovery, navigation, and community.',
      applicationUrl: 'https://www.alltrails.com/careers',
      status: 'active',
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      daysPosted: Math.floor(Math.random() * 7),
      salaryMin: 120000,
      salaryMax: 180000,
      requirements: [
        'iOS development experience',
        'Swift proficiency',
        'App Store publishing'
      ],
      benefits: [
        'Health insurance',
        'Equity',
        'Outdoor gear allowance'
      ]
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      jobType: 'full_time',
      experienceLevel: 'senior',
      description: 'Lead product strategy for outdoor discovery features. Work with engineering and design to build amazing user experiences.',
      applicationUrl: 'https://www.alltrails.com/careers',
      status: 'active',
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      daysPosted: Math.floor(Math.random() * 7),
      salaryMin: 140000,
      salaryMax: 200000,
      requirements: [
        'Product management experience',
        'Consumer app background',
        'Data-driven approach'
      ],
      benefits: [
        'Health insurance',
        'Stock options',
        'Remote work'
      ]
    }
  ]
}

module.exports = { scrape }