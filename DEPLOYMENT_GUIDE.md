# 🚀 JIRA Clustering App - Deployment Guide

## 📋 Overview

This guide covers deploying the JIRA Ticket Clustering application, which consists of:
- **Frontend**: Next.js 14 web application
- **Backend**: Supabase Edge Functions
- **Database**: Supabase PostgreSQL
- **Hosting**: Vercel (Frontend) + Supabase Cloud (Backend)

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Supabase       │    │   GitHub        │
│   (Frontend)    │◄──►│   (Backend)      │    │   (Source)      │
│                 │    │                  │    │                 │
│ • Next.js App   │    │ • Edge Functions │    │ • Auto-deploy  │
│ • Static Assets │    │ • PostgreSQL DB  │    │ • Version Ctrl  │
│ • Global CDN    │    │ • Authentication │    │ • Collaboration │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🎯 Current Deployment Status

### ✅ **Production Environment**
- **Frontend URL**: https://web-ixdehb4p6-tonys-projects-ac038d67.vercel.app
- **Supabase Project**: `uofwzjsokfuigryetnle`
- **GitHub Repository**: https://github.com/BurgsEye/playground
- **Deployment Branch**: `main`

### 🔧 **Configuration Files**
- `vercel.json` - Vercel build configuration for subdirectory
- `supabase/config.toml` - Supabase project configuration
- `web/package.json` - Frontend dependencies and scripts

---

## 🚀 Deployment Process

### **1. Prerequisites**

#### Local Development Tools
```bash
# Required installations
brew install supabase/tap/supabase  # Supabase CLI
npm install -g vercel               # Vercel CLI
```

#### Accounts Required
- [GitHub](https://github.com) - Source code repository
- [Vercel](https://vercel.com) - Frontend hosting (free tier)
- [Supabase](https://supabase.com) - Backend services (free tier)

### **2. Initial Setup (One-time)**

#### A. Supabase Backend Setup
```bash
# 1. Start local Supabase (for development)
cd /path/to/playground
supabase start

# 2. Deploy Edge Functions to production
supabase functions deploy auto-cluster
supabase functions deploy find-nearby-tickets

# 3. Get production credentials
supabase status
# Note: Copy the production URL and anon key
```

#### B. Frontend Configuration
```bash
# 1. Navigate to web directory
cd web

# 2. Install dependencies
npm install

# 3. Test local build
npm run build
npm run start
```

#### C. Vercel Deployment Setup
```bash
# 1. Login to Vercel
vercel login

# 2. Link project (from root directory)
cd /path/to/playground
vercel link

# 3. Initial deployment
vercel --prod
```

### **3. Continuous Deployment (Automated)**

#### Auto-Deploy Workflow
1. **Make Changes** - Edit code locally
2. **Commit Changes** - `git add -A && git commit -m "Description"`
3. **Push to GitHub** - `git push origin main`
4. **Automatic Build** - Vercel detects push and builds
5. **Live Deployment** - New version goes live in ~30 seconds

#### Manual Deployment (if needed)
```bash
# Force redeploy current state
vercel --prod

# Deploy specific branch
vercel --prod --branch feature-branch
```

---

## ⚙️ Configuration Details

### **Vercel Configuration (`vercel.json`)**
```json
{
  "buildCommand": "cd web && npm run build",
  "devCommand": "cd web && npm run dev",
  "installCommand": "cd web && npm install",
  "outputDirectory": "web/.next"
}
```

### **Environment Variables**
The app uses hardcoded production values in `web/src/utils/supabase.ts`:
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uofwzjsokfuigryetnle.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJ...'
```

**For production with custom environment variables:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🧪 Testing Deployments

### **Pre-Deployment Checklist**
```bash
# 1. Test local build
cd web && npm run build && npm run start

# 2. Test Supabase functions locally
supabase functions serve auto-cluster
curl -X POST http://localhost:54321/functions/v1/auto-cluster \
  -H "Content-Type: application/json" \
  -d '{"tickets": [], "radius_km": 20}'

# 3. Verify all pages load
# - http://localhost:3000
# - http://localhost:3000/auto-clustering
# - http://localhost:3000/manual-clustering

# 4. Check for TypeScript errors
cd web && npm run type-check
```

### **Post-Deployment Verification**
1. **Frontend Health Check**
   ```bash
   curl -I https://your-app.vercel.app
   # Should return: HTTP/2 200
   ```

2. **Edge Functions Test**
   - Visit `/auto-clustering` page
   - Click "Run Clustering" button
   - Verify results display correctly

3. **Map Integration Test**
   - Visit `/manual-clustering` page
   - Verify map loads with markers
   - Test ticket selection and radius visualization

---

## 🐛 Troubleshooting

### **Common Issues**

#### Build Failures
```bash
# Check build logs
vercel logs

# Common fixes:
cd web && npm install  # Update dependencies
npm run build          # Test build locally
```

#### Edge Function Errors
```bash
# Check function logs
supabase functions logs auto-cluster

# Redeploy functions
supabase functions deploy auto-cluster --no-verify-jwt
```

#### Environment Issues
```bash
# Verify Supabase connection
cd web && npm run dev
# Check browser console for connection errors
```

### **Debug Commands**
```bash
# Vercel debugging
vercel inspect <deployment-url> --logs

# Supabase debugging
supabase status
supabase functions logs

# Local testing
cd web && npm run dev
```

---

## 🔄 Rollback Process

### **Vercel Rollback**
```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### **Supabase Rollback**
```bash
# Redeploy previous function version
git checkout <previous-commit>
supabase functions deploy auto-cluster
git checkout main
```

---

## 📊 Monitoring & Analytics

### **Vercel Analytics**
- **Performance**: Automatic Core Web Vitals tracking
- **Usage**: Page views and unique visitors
- **Errors**: Build failures and runtime errors
- **Access**: https://vercel.com/tonys-projects-ac038d67/web/analytics

### **Supabase Monitoring**
- **Function Invocations**: Edge function usage stats
- **Database Performance**: Query performance metrics
- **Error Logs**: Function execution errors
- **Access**: https://supabase.com/dashboard/project/uofwzjsokfuigryetnle

---

## 🔒 Security Considerations

### **API Keys**
- ✅ **Supabase Anon Key**: Safe for frontend (RLS protected)
- ✅ **Public URLs**: All endpoints are public-safe
- ❌ **Service Role Key**: Never expose in frontend code

### **CORS Configuration**
Edge functions include proper CORS headers:
```typescript
// In supabase/functions/_shared/cors.ts
return new Response(JSON.stringify(data), {
  headers: {
    ...corsHeaders,
    'Content-Type': 'application/json',
  },
})
```

---

## 📈 Scaling Considerations

### **Vercel Free Tier Limits**
- **Bandwidth**: 100GB/month
- **Build Minutes**: 6,000/month
- **Function Executions**: 100GB-hours/month
- **Upgrade Path**: Pro plan at $20/month

### **Supabase Free Tier Limits**
- **Database**: 500MB storage
- **Bandwidth**: 5GB/month
- **Edge Function Invocations**: 500K/month
- **Upgrade Path**: Pro plan at $25/month

### **Performance Optimization**
- **Static Generation**: Most pages are statically generated
- **Edge Functions**: Globally distributed for low latency
- **CDN**: Vercel's global CDN for asset delivery
- **Caching**: Automatic caching of API responses

---

## 🎯 Production Best Practices

### **Branch Strategy**
```bash
main        # Production deployments
develop     # Integration testing
feature/*   # Feature development
hotfix/*    # Emergency fixes
```

### **Deployment Workflow**
1. **Feature Development**: Create feature branch
2. **Testing**: Deploy to preview URL via PR
3. **Code Review**: Team reviews changes
4. **Merge**: Merge to main triggers production deploy
5. **Monitoring**: Watch metrics for issues

### **Release Process**
```bash
# 1. Create release branch
git checkout -b release/v1.2.0

# 2. Update version
npm version patch

# 3. Test deployment
vercel --prod

# 4. Tag release
git tag v1.2.0

# 5. Push to main
git push origin main --tags
```

---

## 📞 Support & Resources

### **Documentation**
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

### **Community**
- [Vercel Discord](https://vercel.com/discord)
- [Supabase Discord](https://supabase.com/discord)
- [Next.js Discord](https://nextjs.org/discord)

### **Emergency Contacts**
- **Repository Owner**: BurgsEye
- **Vercel Team**: tonys-projects-ac038d67
- **Supabase Project**: uofwzjsokfuigryetnle

---

*Last Updated: September 13, 2025*
*Deployment Guide Version: 1.0*