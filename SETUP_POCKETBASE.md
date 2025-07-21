# Setting Up PocketBase Locally

This guide will help you set up PocketBase on your local machine to run the Job Tracker application with a real backend.

## Prerequisites

- Download PocketBase from https://pocketbase.io/docs/
- Extract the executable to a folder on your machine

## Step 1: Start PocketBase

1. **Navigate to your PocketBase folder**
   ```bash
   cd /path/to/your/pocketbase/folder
   ```

2. **Start PocketBase**
   ```bash
   ./pocketbase serve
   ```
   
   On Windows:
   ```cmd
   pocketbase.exe serve
   ```

3. **Access Admin Interface**
   - Open your browser and go to: `http://127.0.0.1:8090/_/`
   - Create your admin account (first time setup)

## Step 2: Create Database Collections

Create the following collections in the PocketBase admin interface:

### 1. Users Collection (extends auth)
- Go to Collections → Create Collection
- Choose "Auth collection" type
- Name: `users`
- Add these additional fields:
  - `firstName` (Text, Required)
  - `lastName` (Text, Required)
  - `subscriptionTier` (Select: free, premium, Default: free)
  - `preferences` (JSON)
  - `timezone` (Text)

### 2. Companies Collection
- Name: `companies`
- Fields:
  - `name` (Text, Required)
  - `slug` (Text, Required, Unique)
  - `careerPageUrl` (URL, Required)
  - `industry` (Text, Required)
  - `headquarters` (Text, Required)
  - `status` (Select: active, inactive, Default: active)
  - `scrapingConfig` (JSON)
  - `logoUrl` (URL)

### 3. Jobs Collection
- Name: `jobs`
- Fields:
  - `company` (Relation to companies, Required, Single)
  - `title` (Text, Required)
  - `department` (Text, Required)
  - `location` (Text, Required)
  - `jobType` (Select: full_time, part_time, contract, internship, Required)
  - `experienceLevel` (Select: entry, mid, senior, lead, executive, Required)
  - `description` (Text, Required)
  - `applicationUrl` (URL, Required)
  - `status` (Select: active, closed, filled, Default: active)
  - `firstSeenAt` (Date, Required)
  - `lastSeenAt` (Date, Required)
  - `daysPosted` (Number, Default: 0)
  - `salaryMin` (Number)
  - `salaryMax` (Number)

### 4. UserCompanies Collection
- Name: `userCompanies`
- Fields:
  - `user` (Relation to users, Required, Single)
  - `company` (Relation to companies, Required, Single)
  - `priority` (Number, Default: 1)
  - `notifications` (Bool, Default: true)
  - `addedAt` (Date, Required)

### 5. JobApplications Collection
- Name: `jobApplications`
- Fields:
  - `user` (Relation to users, Required, Single)
  - `job` (Relation to jobs, Required, Single)
  - `stage` (Select: not_applied, applied, phone_screen, interview, final_round, offer, rejected, Default: not_applied)
  - `appliedAt` (Date)
  - `notes` (Text)
  - `stageHistory` (JSON)

## Step 3: Add Sample Data

You can manually add some sample companies and jobs through the admin interface, or use the API to import data.

### Sample Companies:
1. **TechCorp**
   - Slug: techcorp
   - Career Page: https://techcorp.com/careers
   - Industry: Technology
   - Headquarters: San Francisco, CA

2. **DataFlow Inc**
   - Slug: dataflow
   - Career Page: https://dataflow.com/jobs
   - Industry: Data Analytics
   - Headquarters: New York, NY

## Step 4: Update Your Application

1. **Set Environment Variable**
   Create a `.env` file in your project root:
   ```
   VITE_POCKETBASE_URL=http://127.0.0.1:8090
   ```

2. **Switch to Real API**
   In `src/lib/api.ts`, change:
   ```typescript
   // From:
   export { mockApi as api } from './mockApi'
   
   // To:
   export { api } from './pocketbaseApi'
   ```

3. **Restart Your Development Server**
   ```bash
   npm run dev
   ```

## Step 5: Test the Application

1. **Create an Account**
   - Go to your React app
   - Sign up with a new account
   - The account will be created in PocketBase

2. **Add Companies**
   - Use the "Add Company" button in the sidebar
   - Track companies you're interested in

3. **View Jobs**
   - Jobs from tracked companies will appear on the dashboard
   - You can apply filters and search

4. **Track Applications**
   - Click on job cards to update application status
   - Track your progress through the hiring pipeline

## Troubleshooting

### Common Issues:

1. **Connection Refused**
   - Make sure PocketBase is running on port 8090
   - Check that no firewall is blocking the port

2. **CORS Errors**
   - PocketBase handles CORS automatically for localhost
   - Make sure you're accessing from `http://localhost:5173`

3. **Collection Not Found**
   - Verify all collections are created with correct names
   - Check that field types match the schema

4. **Authentication Issues**
   - Make sure the users collection extends the auth collection
   - Verify email/password requirements are met

### Useful PocketBase Commands:

```bash
# Start with custom port
./pocketbase serve --http=127.0.0.1:8090

# Start with custom data directory
./pocketbase serve --dir=/path/to/data

# Enable debug mode
./pocketbase serve --debug
```

## Production Deployment

For production deployment, consider:

1. **PocketBase Cloud** - Official hosted solution
2. **Self-hosted** - Deploy on your own server
3. **Docker** - Use the official PocketBase Docker image

Refer to the [PocketBase documentation](https://pocketbase.io/docs/) for detailed deployment instructions.