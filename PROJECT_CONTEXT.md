# JIRA Ticket Clustering Project - Context Summary

## 🎯 Project Overview
Built a complete JIRA ticket clustering system using Supabase Edge Functions and Next.js. The system automatically groups geographically-located tickets into clusters for optimal engineer assignment and route planning.

## 🏗️ Current Architecture

### **Supabase Backend (Local Development)**
- **Port Configuration**: Custom ports to avoid conflicts (55321-55323 range)
- **Resource Optimization**: Docker limits applied, minimal services enabled
- **Edge Functions**: 
  - `find-nearby-tickets`: Geographic search within radius
  - `auto-cluster`: Intelligent clustering algorithm
  - `hello-world`: Basic test function

### **Next.js Web Application**
- **Framework**: Next.js 14.0.0 with App Router
- **Styling**: Tailwind CSS
- **Map Integration**: React-Leaflet with OpenStreetMap
- **Mock Data**: 250 UK-based tickets with realistic geographic spread

## 📁 Key Files & Status

### **✅ Working Files:**
```
supabase/
├── config.toml                              # Custom ports, minimal services
├── functions/
│   ├── find-nearby-tickets/index.ts        # Geographic search function
│   ├── auto-cluster/index.ts               # Clustering algorithm
│   ├── auto-cluster/README.md              # Comprehensive documentation
│   ├── _shared/cors.ts                      # CORS headers utility
│   └── hello-world/index.ts                # Test function

web/
├── src/
│   ├── app/
│   │   ├── page.tsx                         # Landing page with navigation
│   │   ├── clustering/page.tsx              # Manual clustering GUI
│   │   └── auto-clustering/page.tsx         # Auto-clustering visualization
│   ├── components/
│   │   └── TicketMap.tsx                    # Leaflet map component
│   ├── data/
│   │   └── mockTickets.ts                   # 250 UK tickets dataset
│   └── utils/
│       ├── supabase.ts                      # Supabase client config
│       └── autoClustering.ts                # Client-side clustering logic
├── docker-compose.override.yml             # Docker resource limits
└── start-minimal.sh                        # Custom Supabase startup script
```

### **🚨 Current Issues (Need Fixing):**
1. **`web/src/app/auto-clustering/page.tsx`** - `maxHours` undefined error (lines 147-148)
2. **`web/src/data/mockTickets.ts`** - `majorCities` undefined error (line 450)

## 🎮 Current Features

### **Manual Clustering GUI (`/clustering`)**
- **Layout**: Two-column design
  - Left: Complete ticket list with search/filters
  - Right: Interactive map + nearby tickets with checkboxes
- **Map Features**: 
  - Auto-zoom to selected ticket
  - Radius visualization
  - Priority-based markers
  - Legend overlay
- **Interaction**: Click ticket → show nearby → select for cluster → create assignment

### **Auto-Clustering System (`/auto-clustering`)**
- **Algorithm**: Greedy geographic clustering with priority weighting
- **Parameters**: Radius (km), cluster size, priority weighting
- **Visualization**: Results display with map, metrics, unclustered tickets
- **Backend**: Calls Supabase Edge Function with client-side fallback

## 🔧 Technical Implementation

### **Clustering Algorithm**
```typescript
// Core logic in supabase/functions/auto-cluster/index.ts
- Priority-based seeding (Critical/High tickets first)
- Haversine distance calculation for accuracy
- Greedy selection within radius
- Cluster size constraints
- No time-based limitations (simplified from original)
```

### **Geographic Features**
- **Distance Calculation**: Haversine formula for earth curvature
- **UK-Focused**: Coordinates span major UK cities
- **Realistic Spread**: 250 tickets across 21+ cities
- **Address Data**: Postcodes, cities, street addresses

### **Performance Optimizations**
- **Docker Resource Limits**: Prevents system overload
- **Minimal Supabase Services**: Only essential services enabled
- **Client-Side Fallback**: Edge Function failures gracefully handled
- **Deterministic Mock Data**: Prevents React hydration errors

## 🚀 Setup Instructions

### **Prerequisites**
- Docker Desktop running
- Homebrew (for Supabase CLI)
- Node.js 18+

### **Quick Start**
```bash
# 1. Install Supabase CLI
brew install supabase/tap/supabase

# 2. Start Supabase (from project root)
./start-minimal.sh

# 3. Start web app
cd web && npm install && npm run dev

# 4. Deploy Edge Functions
supabase functions deploy auto-cluster
supabase functions deploy find-nearby-tickets
```

### **URLs**
- **Web App**: http://localhost:3000
- **Supabase Studio**: http://localhost:55323
- **API**: http://localhost:55321

## 🎯 Next Steps & Discussion Points

### **Immediate Fixes Needed**
1. Fix `maxHours` undefined error in auto-clustering page
2. Fix `majorCities` undefined error in mock data
3. Deploy Edge Functions to test full integration

### **JIRA Integration Planning** 
**Last Discussion**: Exploring integration approaches
- **Options Considered**: 
  - Pull model (JIRA API → App)
  - Push model (JIRA Webhooks → Supabase)
  - Hybrid sync (scheduled updates)
- **Key Questions**:
  - Where is location data stored in JIRA?
  - What triggers clustering?
  - What gets created back in JIRA?
  - User permissions and workflow?

### **Recommended Integration Approach**
```
Phase 1: Manual CSV/JSON import → Test with real data
Phase 2: JIRA REST API integration → On-demand sync
Phase 3: Webhook integration → Real-time updates
```

## 🔍 Key Technical Decisions Made

### **Architecture Choices**
- **Supabase Edge Functions**: Server-side clustering for performance
- **Geographic-Only Clustering**: Removed time constraints for simplicity  
- **Client-Side Fallback**: Resilient to Edge Function failures
- **Two-GUI Approach**: Manual clustering + auto-clustering visualization

### **UI/UX Decisions**
- **Map Integration**: Right-side panel above nearby tickets
- **Auto-Zoom**: Dynamic zoom based on radius selection
- **Removed Controls**: Simplified map interface (no manual zoom controls)
- **Priority Visualization**: Color-coded markers and legends

### **Data Decisions**
- **UK Geographic Focus**: Realistic for target market
- **250 Ticket Dataset**: Large enough for meaningful clustering
- **Deterministic Generation**: Prevents hydration errors
- **Priority Distribution**: Realistic mix of ticket urgencies

## 💡 Context for New Assistant

This project is a **working prototype** with a solid foundation. The core clustering logic is implemented and documented. The main remaining work is:

1. **Bug fixes** (2 JavaScript errors preventing app from running)
2. **JIRA integration** planning and implementation
3. **Production deployment** considerations

The user has been learning Supabase while building a practical business tool. They're technical but new to the Supabase ecosystem. The project demonstrates real-world geographic algorithms with a clean, modern UI.

**Current Status**: Ready for JIRA integration planning once the immediate bugs are resolved.
