# JIRA Clustering Application - Deployment Guide

## ✅ Completed Deployments

### 1. Supabase Edge Functions (DEPLOYED)
- **Project**: playground (uofwzjsokfuigryetnle)
- **Region**: West EU (London)
- **Functions Deployed**:
  - `auto-cluster` - Automatic ticket clustering algorithm
  - `find-nearby-tickets` - Find tickets within radius
  - `hello-world` - Test function
- **Dashboard**: https://supabase.com/dashboard/project/uofwzjsokfuigryetnle/functions

### 2. Production Configuration (READY)
- **Supabase URL**: `https://uofwzjsokfuigryetnle.supabase.co`
- **API Key**: Configured in `src/utils/supabase.ts`
- **Build Status**: ✅ Production build successful

## 🚀 Web Application Deployment Options

### Option 1: Vercel (Recommended)
1. Create a Vercel account at https://vercel.com
2. Connect your GitHub repository
3. Set environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://uofwzjsokfuigryetnle.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvZnd6anNva2Z1aWdyeWV0bmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MTMyNDksImV4cCI6MjA3MzE4OTI0OX0.akyFdpQY3ozE7-EemXxAXgScvduMzUpItEqwiqzuK2M
   ```
4. Deploy automatically

### Option 2: Netlify
1. Create a Netlify account at https://netlify.com
2. Connect your repository
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Set the same environment variables as above

### Option 3: Manual Static Export
```bash
cd web
npm run build
npm run export  # If you add this script
# Upload the 'out' folder to any static hosting
```

## 🧪 Testing the Production Build Locally

The production build is currently running locally at:
- **URL**: http://localhost:3000
- **Configuration**: Uses production Supabase URLs
- **Status**: Ready for testing

## 📱 Application Features

### Auto-Clustering Page (`/auto-clustering`)
- Automatic ticket clustering algorithm
- Interactive map with cluster visualization  
- Zoom to fit functionality
- Ticket type filtering (Gold, Silver, Bronze)

### Manual Clustering Page (`/manual-clustering`)
- Interactive ticket selection
- Radius-based nearby ticket finding
- Manual cluster creation
- Real-time Edge Function integration

## 🔧 Environment Variables

The application automatically uses production Supabase URLs but can be overridden with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uofwzjsokfuigryetnle.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvZnd6anNva2Z1aWdyeWV0bmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MTMyNDksImV4cCI6MjA3MzE4OTI0OX0.akyFdpQY3ozE7-EemXxAXgScvduMzUpItEqwiqzuK2M
```

## 🎯 Next Steps

1. **Choose a deployment platform** (Vercel recommended)
2. **Create account and connect repository**
3. **Set environment variables**
4. **Deploy and test**

The application is production-ready with:
- ✅ Supabase Edge Functions deployed
- ✅ Production build working
- ✅ Environment variables configured
- ✅ All features functional
