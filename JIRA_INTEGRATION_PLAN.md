# JIRA Integration Plan

## 🎯 Overview
Integrate the existing ticket clustering system with JIRA to automatically fetch tickets with "Ready For Clustering" status and create "Job Cluster" tickets with linked assignments.

## 📋 Current Status: Phase 1 - Pull-Based MVP

**Last Updated**: September 13, 2025  
**Implementation Approach**: Option 1 - Pull-Based API Integration  
**Target Timeline**: 2-3 days for MVP

## 🏗️ Architecture Plan

### Phase 1: Pull-Based MVP ⏳ In Progress
**Goal**: Basic JIRA integration with manual sync and cluster creation

#### Components to Build:
1. **JIRA Configuration Management**
   - [ ] Environment variables for JIRA credentials
   - [ ] Configuration UI in web app
   - [ ] Connection testing functionality

2. **JIRA API Edge Function** 
   - [ ] `/supabase/functions/jira-integration/index.ts`
   - [ ] Authentication with JIRA API
   - [ ] Fetch tickets with "Ready For Clustering" status
   - [ ] Create "Job Cluster" tickets
   - [ ] Link tickets to clusters

3. **Web App Integration**
   - [ ] JIRA configuration page
   - [ ] Replace mock data with JIRA data
   - [ ] Add sync button to clustering pages
   - [ ] Show JIRA ticket details in UI

#### API Endpoints:
```typescript
// GET /jira-integration/tickets
// - Fetch tickets with "Ready For Clustering" status
// - Transform to internal ticket format

// POST /jira-integration/create-cluster  
// - Create Job Cluster ticket in JIRA
// - Link selected tickets to cluster
// - Update ticket statuses
```

### Phase 2: Enhanced Integration 📅 Future
**Goal**: Real-time updates and advanced features

#### Planned Enhancements:
- [ ] Webhook support for real-time ticket updates
- [ ] Ticket caching in Supabase database
- [ ] Automatic clustering triggers
- [ ] Conflict resolution for concurrent changes
- [ ] Enhanced error handling and retry logic

## 🔧 Technical Implementation Details

### JIRA API Integration

#### Authentication Strategy
**Chosen Approach**: API Tokens (Basic Auth)
- Simpler to implement than OAuth
- Sufficient for server-to-server communication
- User provides: JIRA URL, email, API token

#### Required JIRA Configuration
```json
{
  "jiraUrl": "https://company.atlassian.net",
  "email": "user@company.com", 
  "apiToken": "ATATT3xFfGF0...",
  "projectKey": "PROJ",
  "clusteringStatus": "Ready For Clustering",
  "clusterTicketType": "Job Cluster"
}
```

#### JIRA Field Mapping
| JIRA Field | Internal Field | Notes |
|------------|----------------|--------|
| `key` | `id` | Ticket identifier |
| `summary` | `title` | Ticket title |
| `description` | `description` | Full description |
| `priority.name` | `priority` | Critical/High/Medium/Low |
| `status.name` | `status` | Current status |
| `customfield_xxxxx` | `location` | Location data (TBD) |
| `assignee` | `assignee` | Current assignee |
| `created` | `createdAt` | Creation timestamp |

### Data Flow

#### Ticket Fetching Flow
```
1. User clicks "Sync with JIRA" 
2. Web app calls JIRA edge function
3. Edge function authenticates with JIRA API
4. Fetch tickets: status = "Ready For Clustering"
5. Transform JIRA tickets to internal format
6. Return tickets to web app
7. Web app displays tickets in clustering UI
```

#### Cluster Creation Flow  
```
1. User selects tickets and creates cluster
2. Web app calls create-cluster endpoint
3. Edge function creates "Job Cluster" ticket in JIRA
4. Link selected tickets to cluster ticket
5. Update selected tickets status (e.g., "In Cluster")
6. Return cluster details to web app
7. Web app shows confirmation and JIRA links
```

## 🎛️ Configuration Requirements

### Environment Variables
```bash
# Supabase Edge Functions
JIRA_URL=https://company.atlassian.net
JIRA_EMAIL=user@company.com  
JIRA_API_TOKEN=ATATT3xFfGF0...
JIRA_PROJECT_KEY=PROJ
```

### JIRA Setup Requirements
1. **API Token**: User must generate personal API token
2. **Custom Fields**: Location field for ticket clustering
3. **Ticket Types**: "Job Cluster" ticket type created
4. **Statuses**: "Ready For Clustering", "In Cluster" statuses
5. **Permissions**: API user needs read/write access to project

## 🚧 Implementation Progress

### ✅ Completed
- [x] Integration options analysis
- [x] Architecture planning
- [x] Documentation setup
- [x] JIRA integration plan document
- [x] JIRA configuration management
- [x] JIRA API edge function (`/supabase/functions/jira-integration/index.ts`)
- [x] JIRA UI components (`/web/src/app/jira-config/page.tsx`)
- [x] API routes for frontend-backend communication
- [x] Dashboard integration with JIRA config link
- [x] **Authentication system** - Supabase Auth with login/signup/password reset
- [x] **Secure JIRA config storage** - Database table with RLS policies
- [x] **User session management** - AuthContext and AuthGuard components
- [x] **Protected routes** - All pages secured with AuthGuard components
- [x] **Protected API routes** - All API endpoints require authentication
- [x] **Application middleware** - Route-level protection at Next.js middleware layer
- [x] **Comprehensive security** - Multi-layer authentication across frontend and backend

### 🏗️ In Progress
- [ ] Run database migrations and test authentication flow

### 📋 Next Steps
1. Deploy JIRA integration edge function
2. Test with real JIRA instance
3. Update clustering pages to use JIRA data instead of mock data
4. Handle error cases and edge scenarios
5. Add JIRA ticket sync functionality to clustering workflows

## 🔍 Key Decisions Made

### Why API Tokens over OAuth?
- Simpler implementation for MVP
- Server-to-server communication pattern
- Can upgrade to OAuth later if needed

### Why Pull-Based over Webhooks Initially?
- No JIRA admin access required
- Easier to test and debug
- Manual control over sync timing
- Can add webhooks in Phase 2

### Data Storage Strategy
- Phase 1: No local storage, fetch on-demand
- Phase 2: Cache in Supabase for performance
- Keeps Phase 1 simple and stateless

## 🚨 Risks & Mitigation

### Potential Issues
1. **JIRA API Rate Limits**: 10,000 requests/hour for Cloud
   - *Mitigation*: Implement caching in Phase 2
2. **Location Data Format**: Unknown how location is stored
   - *Mitigation*: Make field mapping configurable
3. **Authentication Failures**: API tokens can expire
   - *Mitigation*: Clear error messages and retry logic
4. **JIRA Permissions**: User may lack required access
   - *Mitigation*: Test connection during configuration

### Error Handling Strategy
- Graceful fallback to mock data if JIRA unavailable
- Clear error messages for configuration issues
- Retry logic for transient failures
- Logging for debugging integration issues

## 📚 Resources & References

### JIRA REST API Documentation
- [JIRA Cloud REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Authentication](https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/)
- [Issue Search](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/)
- [Issue Creation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/)

### Implementation Examples
```bash
# Test JIRA API connection
curl -u email@company.com:api_token \
  -X GET \
  -H "Content-Type: application/json" \
  "https://company.atlassian.net/rest/api/3/search?jql=project=PROJ+AND+status='Ready For Clustering'"
```

## 📁 Files Created

### Backend (Supabase Edge Functions)
- `/supabase/functions/jira-integration/index.ts` - Main JIRA API integration function
  - `GET /test-connection` - Test JIRA API connection
  - `POST /tickets` - Fetch tickets with "Ready For Clustering" status
  - `POST /create-cluster` - Create Job Cluster ticket and link tickets

### Frontend (Next.js Web App)
- `/web/src/app/jira-config/page.tsx` - JIRA configuration UI
- `/web/src/app/api/jira/test-connection/route.ts` - API route for connection testing
- `/web/src/app/api/jira/tickets/route.ts` - API route for fetching tickets
- `/web/src/app/api/jira/create-cluster/route.ts` - API route for cluster creation

### Authentication System
- `/web/src/contexts/AuthContext.tsx` - React context for authentication state
- `/web/src/components/AuthGuard.tsx` - Route protection component
- `/web/src/components/Header.tsx` - Header with user menu and sign out
- `/web/src/app/auth/signin/page.tsx` - Sign in page
- `/web/src/app/auth/signup/page.tsx` - Sign up page
- `/web/src/app/auth/forgot-password/page.tsx` - Password reset page
- `/web/src/app/api/jira-config/route.ts` - Secure JIRA config API

### Database
- `/supabase/migrations/20250913000001_create_jira_configs.sql` - JIRA config table with RLS

### Updated Files
- `/web/src/app/page.tsx` - Added JIRA config link, authentication, and Header component
- `/web/src/app/layout.tsx` - Added AuthProvider and updated metadata
- `/web/src/app/auto-clustering/page.tsx` - Added AuthGuard and Header components
- `/web/src/app/manual-clustering/page.tsx` - Added AuthGuard and Header components
- `/web/src/app/api/jira/test-connection/route.ts` - Added authentication middleware
- `/web/src/app/api/jira/tickets/route.ts` - Added authentication middleware
- `/web/src/app/api/jira/create-cluster/route.ts` - Added authentication middleware
- `/web/src/middleware.ts` - Application-level route protection

---

## 📝 Change Log

**2025-09-13**: Initial plan created, Phase 1 architecture defined  
**2025-09-13**: Phase 1 MVP implementation completed - JIRA integration foundation ready for testing  
**2025-09-13**: Authentication system implemented - Secure user management and JIRA config storage added  
**2025-09-13**: **EVERYTHING PROTECTED** - Comprehensive security implemented across all routes, pages, and API endpoints  
**Next Update**: After database migration and deployment testing
