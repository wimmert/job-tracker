# Job Tracker Application

A modern, fully-functional job tracking application built with React, TypeScript, and Tailwind CSS. Currently running with comprehensive mock data for immediate testing and demonstration.

## 🕷️ Web Scraping System

**Automated Job Discovery:**
- **Scheduled scraping** runs daily at 6 AM UTC via Netlify Functions
- **Manual scraping** available through Settings page
- **Company-specific scrapers** for Anthropic, Zipline, Wing, Waymo, Zoox, AllTrails
- **Intelligent deduplication** prevents duplicate job entries
- **Error handling** with retry mechanisms and graceful fallbacks

**Scraping Features:**
- **Real-time job discovery** from company career pages
- **Automatic data normalization** (titles, locations, salaries)
- **Job status tracking** (active/removed detection)
- **PocketBase integration** for persistent storage
- **Respectful scraping** with delays and rate limiting

## 🚀 Features

- **Complete Authentication System**: Mock authentication that accepts any email/password
- **Company Tracking**: Add and manage companies you want to track (6 sample companies included)
- **Job Monitoring**: 30+ realistic job listings across different companies and departments
- **Application Pipeline**: Track your application status through different stages with notes
- **Advanced Filtering**: Filter by company, location, department, job type, and experience level
- **Smart Search**: Full-text search across job titles, descriptions, and companies
- **Dashboard Analytics**: View hiring trends, application stats, and progress metrics
- **Dark/Light Mode**: Toggle between themes with localStorage persistence
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Loading States**: Realistic loading animations and smooth transitions
- **Data Persistence**: All user data persists in localStorage

## 🏢 Sample Companies & Jobs

**Included Companies:**
- **Anthropic** (AI Safety) - 5 jobs including AI Safety Researcher, Infrastructure Engineer
- **Zipline** (Drone Delivery) - 5 jobs including Robotics Engineer, Flight Software Engineer  
- **Wing** (Autonomous Delivery) - 5 jobs including Autonomy Engineer, Hardware Engineer
- **Waymo** (Self-Driving Cars) - 5 jobs including Perception Engineer, Motion Planning Engineer
- **Zoox** (Robotaxis) - 5 jobs including Simulation Engineer, AI Research Scientist
- **AllTrails** (Outdoor Recreation) - 5 jobs including iOS Engineer, Product Manager

**Job Variety:**
- **Departments**: Engineering, Product, Design, Data Science, Research, Operations
- **Locations**: San Francisco, Mountain View, Palo Alto, Remote, New York, International
- **Experience Levels**: Entry, Mid, Senior, Staff, Principal
- **Salary Ranges**: $80K - $550K with realistic compensation data
- **Job Types**: Full-time, Part-time, Contract, Internship

## 🎯 Demo Features

### Authentication
- Sign in with **any email/password combination**
- Try: `demo@example.com` / `password` or create your own account
- Automatic user creation with realistic profile data
- Session persistence across browser refreshes

### Job Application Tracking
- Update application status: Not Applied → Applied → Phone Screen → Interview → Final Round → Offer/Rejected
- Add notes to track your progress
- View application history and stage transitions
- Realistic application data with 4 sample applications in different stages

### Advanced Filtering & Search
- **Company Filter**: Filter by tracked companies
- **Location Filter**: Remote, San Francisco, Mountain View, etc.
- **Department Filter**: Engineering, Product, Design, Data Science, Research
- **Job Type Filter**: Full-time, Part-time, Contract, Internship
- **Experience Level**: Entry, Mid, Senior, Staff, Principal
- **Smart Search**: Search job titles, descriptions, company names, departments

### Dashboard Analytics
- **Job Stats**: Total jobs, new this week, applications, companies tracked
- **Response Rate**: Track your application success rate
- **Subscription Tier**: Free vs Premium user simulation
- **Progress Tracking**: Applications in progress, interview pipeline

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Netlify Functions, PocketBase
- **Web Scraping**: Axios, Cheerio, scheduled functions
- **State Management**: React Context + localStorage
- **Routing**: React Router v7
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with dark mode support
- **Build Tool**: Vite

## 🚀 Getting Started

### Web Scraping Setup

1. **Configure Environment Variables**
   ```bash
   # In netlify.toml or Netlify dashboard
   POCKETBASE_URL=https://your-pocketbase-instance.com
   POCKETBASE_ADMIN_EMAIL=admin@yourapp.com
   POCKETBASE_ADMIN_PASSWORD=your-secure-password
   ```

2. **Deploy to Netlify**
   ```bash
   # Functions will be automatically deployed
   # Scheduled scraping will run daily at 6 AM UTC
   ```

3. **Manual Scraping**
   - Go to Settings page in the app
   - Use "Scrape All Companies" or individual company buttons
   - Monitor scraping results and database updates

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd job-tracker
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Sign in with any email/password (e.g., `demo@example.com` / `password`)

## 📱 Usage Guide

### Web Scraping Control
1. **Automatic Scraping**: Runs daily at 6 AM UTC via Netlify Functions
2. **Manual Scraping**: Use Settings page to trigger immediate scraping
3. **Company-Specific**: Scrape individual companies for targeted updates
4. **Results Monitoring**: View scraping statistics and success rates
5. **Database Integration**: All scraped jobs automatically saved to PocketBase

### Getting Started
1. **Sign In**: Use any email/password combination to access the demo
2. **Explore Dashboard**: View sample jobs from 6 tracked companies
3. **Filter Jobs**: Use the filter button to narrow down opportunities
4. **Search**: Try searching for "frontend", "AI", "remote", etc.
5. **Track Applications**: Click on job cards to update application status
6. **Add Notes**: Track your progress with application notes

### Key Features to Test
- **Job Status Updates**: Change application stages and see real-time updates
- **Advanced Filtering**: Combine multiple filters (company + location + department)
- **Search Functionality**: Search across job titles, descriptions, and companies
- **Dark Mode**: Toggle theme using the moon/sun icon in the sidebar
- **Responsive Design**: Test on different screen sizes
- **Data Persistence**: Refresh the page and see your data preserved

### Sample Data Highlights
- **Realistic Job Descriptions**: Detailed, industry-specific job descriptions
- **Accurate Salary Ranges**: Market-rate compensation data
- **Diverse Locations**: Mix of on-site, remote, and hybrid positions
- **Career Progression**: Jobs from entry-level to principal/executive roles
- **Industry Variety**: AI, autonomous vehicles, delivery, outdoor recreation

## 🎨 Design Features

- **Modern UI**: Clean, professional interface with attention to detail
- **Smooth Animations**: Loading states, hover effects, and transitions
- **Accessibility**: Proper contrast ratios, keyboard navigation, screen reader support
- **Mobile-First**: Responsive design that works on all devices
- **Dark Mode**: Complete dark theme with proper color schemes
- **Visual Hierarchy**: Clear information architecture and typography

## 📊 Mock Data Architecture

### Data Persistence
- **localStorage Integration**: All user actions persist across sessions
- **Realistic Delays**: Mock API calls with realistic loading times (300-800ms)
- **Error Handling**: Proper error states and user feedback
- **Data Relationships**: Proper linking between users, companies, jobs, and applications

### Sample Analytics
- **Job Trends**: 20 days of hiring activity data
- **Company Growth**: Hiring growth percentages for each company
- **Location Distribution**: Geographic breakdown of opportunities
- **Department Breakdown**: Role distribution across departments

## 🔧 Development

### Web Scraping Architecture
```
netlify/functions/
├── scheduled-scraper.js     # Daily automated scraping
├── manual-scraper.js        # On-demand scraping endpoint
├── lib/
│   ├── scrapers.js         # Main scraping orchestration
│   ├── database.js         # PocketBase integration
│   ├── utils.js           # Scraping utilities
│   └── scrapers/          # Company-specific scrapers
│       ├── anthropic.js   # Anthropic career page scraper
│       ├── zipline.js     # Zipline career page scraper
│       ├── wing.js        # Wing career page scraper
│       ├── waymo.js       # Waymo career page scraper
│       ├── zoox.js        # Zoox career page scraper
│       └── alltrails.js   # AllTrails career page scraper
```

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, Input)
│   ├── Layout/         # Layout components (Header, Sidebar)
│   ├── JobCard.tsx     # Enhanced job card with status updates
│   └── JobFilter.tsx   # Advanced filtering component
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Authentication context
│   └── useTheme.tsx    # Theme management
├── lib/                # Utilities and API
│   ├── mockData.ts     # Comprehensive sample data
│   ├── mockAuth.ts     # Mock authentication system
│   ├── mockApi.ts      # Mock API with localStorage
│   └── utils.ts        # Helper functions
├── pages/              # Page components
│   ├── Auth/           # Authentication pages
│   └── Dashboard/      # Main dashboard
├── types/              # TypeScript definitions
└── App.tsx             # Main application
```

### Key Components
- **ScrapingStatus**: Web scraping control interface in Settings
- **JobCard**: Enhanced with dropdown status updates, expandable descriptions, notes
- **JobFilter**: Advanced filtering with real-time counts and clear visual feedback
- **Dashboard**: Comprehensive stats, loading states, and empty state handling
- **MockAPI**: Full CRUD operations with localStorage persistence

## 🚀 Production Readiness

### Web Scraping Production Features
- **Scheduled automation** via Netlify Functions cron jobs
- **Error handling** with retry mechanisms and fallbacks
- **Rate limiting** to respect website terms of service
- **Data deduplication** to prevent duplicate entries
- **Monitoring** with detailed logging and success tracking
- **Scalable architecture** supporting additional company scrapers

This application demonstrates production-level features:

- **Performance**: Optimized rendering, lazy loading, efficient state management
- **User Experience**: Smooth interactions, loading states, error handling
- **Data Management**: Proper state management, persistence, and synchronization
- **Code Quality**: TypeScript, proper component architecture, reusable utilities
- **Accessibility**: WCAG compliance, keyboard navigation, screen reader support
- **Testing Ready**: Modular architecture suitable for unit and integration testing

## 📈 Future Enhancements

### Web Scraping Enhancements
- **AI-powered job parsing** for better data extraction
- **Dynamic scraper adaptation** to handle website changes
- **Advanced filtering** during scraping process
- **Real-time notifications** for new job discoveries
- **Scraping analytics** and success rate monitoring

Ready for real backend integration:
- **Database Integration**: Easy switch from mock to real API
- **Authentication**: Replace mock auth with real authentication service
- **Real-time Updates**: WebSocket integration for live job updates
- **Email Notifications**: Job alert system
- **Advanced Analytics**: More detailed reporting and insights
- **Team Features**: Collaboration and sharing capabilities

## 📄 License

MIT License - see LICENSE file for details

---

**Ready to explore?** Start the development server and sign in with any credentials to experience a fully functional job tracking application with realistic data and smooth user experience!