# JIRA Ticket Clustering System

A production-ready application for geographic clustering of JIRA tickets using Supabase Edge Functions and Next.js. Automatically groups tickets by location and priority to optimize engineer assignment and route planning.

## 🌐 Live Demo
**Production App**: https://web-ixdehb4p6-tonys-projects-ac038d67.vercel.app

## 🚀 Quick Deploy
This app is configured for automatic deployment:
1. **Fork this repository**
2. **Connect to Vercel** - automatic builds on every push
3. **Deploy Edge Functions** - `supabase functions deploy auto-cluster`
4. **Done!** - Your app is live with global CDN

📋 **For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

## 🎯 Features

- **Auto-Clustering**: Intelligent geographic grouping with priority weighting
- **Manual Clustering**: Interactive map-based ticket selection
- **Real-time Maps**: React-Leaflet integration with UK-wide coverage
- **Edge Computing**: Supabase Edge Functions for global performance
- **Modern UI**: Next.js 14 with Tailwind CSS
- **Production Ready**: Deployed on Vercel with auto-deploy from GitHub

## Project Structure

```
playground/
├── supabase/                 # Backend services
│   ├── functions/           # Edge Functions
│   │   ├── auto-cluster/    # Clustering algorithm
│   │   ├── find-nearby-tickets/ # Geographic search
│   │   └── _shared/         # Shared utilities
│   └── config.toml         # Supabase configuration
├── web/                     # Next.js frontend
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   ├── data/           # Mock data (250 UK tickets)
│   │   └── utils/          # Utilities & Supabase client
│   └── package.json
├── DEPLOYMENT_GUIDE.md      # Comprehensive deployment docs
└── vercel.json             # Deployment configuration
```

## Getting Started

### 1. Install Dependencies

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Install Vercel CLI (optional)
npm install -g vercel
```

### 2. Start Local Development

```bash
# Start Supabase backend
supabase start

# Install and run frontend
cd web
npm install
npm run dev
```

Visit `http://localhost:3000` to see your app!

### 3. Deploy to Production

```bash
# Deploy Edge Functions
supabase functions deploy auto-cluster
supabase functions deploy find-nearby-tickets

# Deploy Frontend (one-time setup)
vercel --prod

# Or connect GitHub for auto-deploy (recommended)
# See DEPLOYMENT_GUIDE.md for details
```

## 🚀 Deployment

### Current Production Status
- **Branch**: `main` (auto-deploy enabled)
- **Frontend**: Vercel hosting with global CDN
- **Backend**: Supabase Edge Functions deployed
- **Domain**: https://web-ixdehb4p6-tonys-projects-ac038d67.vercel.app

### Auto-Deploy Workflow
1. Make changes locally
2. Commit: `git add -A && git commit -m "Description"`
3. Push: `git push origin main`
4. Vercel automatically builds and deploys (~30 seconds)

### Manual Deployment
```bash
# Deploy Edge Functions
supabase functions deploy auto-cluster

# Deploy Frontend
vercel --prod
```

📋 **For complete deployment instructions, troubleshooting, and production setup, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

## 🧪 Testing Edge Functions

```bash
# Test auto-clustering locally
curl -X POST http://localhost:54321/functions/v1/auto-cluster \
  -H "Content-Type: application/json" \
  -d '{
    "tickets": [],
    "radius_km": 20,
    "cluster_size": 3,
    "prioritize_high_priority": true
  }'

# Test nearby tickets search
curl -X POST http://localhost:54321/functions/v1/find-nearby-tickets \
  -H "Content-Type: application/json" \
  -d '{
    "center_lat": 51.5074,
    "center_lng": -0.1278,
    "radius_km": 10,
    "tickets": []
  }'
```

## Database

### Creating Migrations

```bash
# Create a new migration
supabase migration new create_users_table

# Apply migrations
supabase db push
```

### Database Schema

Add your SQL files to `supabase/migrations/` for version control.

## Useful Commands

```bash
# View logs
supabase functions logs

# Stop local environment
supabase stop

# Reset local database
supabase db reset

# Generate types for TypeScript
supabase gen types typescript --local > web/src/types/supabase.ts
```

## 🎯 Next Steps & Roadmap

### Phase 1: JIRA Integration (In Progress)
- [ ] **CSV/JSON Import**: Manual ticket import for testing
- [ ] **JIRA REST API**: Pull tickets from JIRA instances  
- [ ] **Webhook Integration**: Real-time ticket updates
- [ ] **User Authentication**: Role-based access control

### Phase 2: Advanced Features
- [ ] **Route Optimization**: TSP solver for engineer routes
- [ ] **Time Constraints**: Schedule-based clustering
- [ ] **Mobile App**: React Native companion app
- [ ] **Analytics Dashboard**: Performance metrics and insights

### Phase 3: Enterprise Features  
- [ ] **Multi-tenant**: Support multiple organizations
- [ ] **Custom Fields**: Configurable ticket attributes
- [ ] **API Integration**: Third-party service connections
- [ ] **Advanced Reporting**: Export and scheduling

## 📚 Resources & Documentation

### Project Documentation
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) - Detailed project context and decisions

### Technical Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)

### Live Examples
- **Production App**: https://web-ixdehb4p6-tonys-projects-ac038d67.vercel.app
- **Auto-Clustering**: https://web-ixdehb4p6-tonys-projects-ac038d67.vercel.app/auto-clustering
- **Manual Clustering**: https://web-ixdehb4p6-tonys-projects-ac038d67.vercel.app/manual-clustering

---

*Built with ❤️ using Supabase, Next.js, and Vercel*
