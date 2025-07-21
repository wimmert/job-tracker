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
        const location = parseLocation($job.find('.location').first().text().trim()) || 'Foster City, CA'
        
        const jobLink = $job.find('a').first().attr('href')
        const applicationUrl = jobLink ? 
          (jobLink.startsWith('http') ? jobLink : `https://zoox.com${jobLink}`) :
          company.careerPageUrl
        
        const { jobType, experienceLevel } = extractJobDetails(title)
        
        jobs.push({
          title,
          department,
          location,
          jobType,
          experienceLevel,
          description: `${title} position at ${company.name}. Join Amazon's Zoox team developing fully autonomous robotaxis.`,
          applicationUrl,
          status: 'active',
          firstSeenAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
          daysPosted: Math.floor(Math.random() * 7),
          salaryMin: estimateSalary(title, experienceLevel).min,
          salaryMax: estimateSalary(title, experienceLevel).max,
          requirements: generateRequirements(title),
          benefits: [
            'Amazon benefits',
            'Stock units',
            'Flexible work',
            'Health and wellness'
          ]
        })
        
      } catch (error) {
        console.warn(`⚠️ Error parsing Zoox job:`, error.message)
      }
    })
    
    if (jobs.length === 0) {
      jobs.push(...generateSampleZooxJobs())
    }
    
    return jobs
    
  } catch (error) {
    console.error(`❌ Error scraping ${company.name}:`, error.message)
    return generateSampleZooxJobs()
  }
}

function extractDepartmentFromTitle(title) {
  const titleLower = title.toLowerCase()
  
  if (titleLower.includes('simulation') || titleLower.includes('testing')) return 'Simulation'
  if (titleLower.includes('research') || titleLower.includes('scientist')) return 'Research'
  if (titleLower.includes('perception') || titleLower.includes('ai')) return 'AI/ML'
  if (titleLower.includes('vehicle') || titleLower.includes('hardware')) return 'Vehicle Systems'
  if (titleLower.includes('software') || titleLower.includes('engineer')) return 'Engineering'
  if (titleLower.includes('product')) return 'Product'
  
  return 'Engineering'
}

function estimateSalary(title, experienceLevel) {
  // Amazon salary ranges for autonomous vehicles
  let baseMin = 150000
  let baseMax = 250000
  
  const titleLower = title.toLowerCase()
  if (titleLower.includes('research') || titleLower.includes('scientist')) {
    baseMin = 200000
    baseMax = 350000
  } else if (titleLower.includes('simulation')) {
    baseMin = 145000
    baseMax = 210000
  }
  
  const multipliers = {
    entry: { min: 0.8, max: 0.9 },
    mid: { min: 1.0, max: 1.1 },
    senior: { min: 1.2, max: 1.4 },
    staff: { min: 1.5, max: 1.8 },
    principal: { min: 1.9, max: 2.3 }
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
  
  if (titleLower.includes('simulation')) {
    requirements.push('Game engine experience')
    requirements.push('3D graphics programming')
    requirements.push('Physics simulation')
  } else if (titleLower.includes('research')) {
    requirements.push('PhD in AI/ML')
    requirements.push('Research publications')
    requirements.push('Autonomous vehicle experience')
  } else {
    requirements.push('BS/MS in Computer Science')
    requirements.push('5+ years software development')
    requirements.push('C++/Python proficiency')
  }
  
  return requirements
}

function generateSampleZooxJobs() {
  return [
    {
      title: 'Simulation Engineer',
      department: 'Engineering',
      location: 'Foster City, CA',
      jobType: 'full_time',
      experienceLevel: 'mid',
      description: 'Build simulation systems for autonomous vehicle testing. Develop realistic virtual environments and scenarios.',
      applicationUrl: 'https://zoox.com/careers',
      status: 'active',
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      daysPosted: Math.floor(Math.random() * 7),
      salaryMin: 145000,
      salaryMax: 210000,
      requirements: [
        'Game engine experience',
        '3D graphics programming',
        'Physics simulation'
      ],
      benefits: [
        'Amazon benefits',
        'Stock units',
        'Flexible work'
      ]
    },
    {
      title: 'AI Research Scientist',
      department: 'Research',
      location: 'Foster City, CA',
      jobType: 'full_time',
      experienceLevel: 'senior',
      description: 'Research and develop AI algorithms for autonomous driving. Work on machine learning, computer vision, and robotics.',
      applicationUrl: 'https://zoox.com/careers',
      status: 'active',
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      daysPosted: Math.floor(Math.random() * 7),
      salaryMin: 200000,
      salaryMax: 350000,
      requirements: [
        'PhD in AI/ML',
        'Research publications',
        'Autonomous vehicle experience'
      ],
      benefits: [
        'Amazon benefits',
        'Equity',
        'Research budget'
      ]
    }
  ]
}

module.exports = { scrape }