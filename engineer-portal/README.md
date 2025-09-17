# Engineer Portal - Freshwave Installation Management

A mobile-first web portal for APC engineers to manage Freshwave installation jobs without requiring JIRA access.

## 🎯 Project Overview

**Problem**: Freshwave logs installation requests in JIRA, clusters them into groups of 3 jobs per engineer per day, and assigns them to APC engineers. Engineers need a simple way to update job status without JIRA licenses.

**Solution**: A clean, mobile-optimized portal that allows engineers to:
- View assigned jobs (status: "Scheduled" in JIRA)
- Mark jobs as complete/incomplete
- Upload photos and complete work forms
- Provide failure reasons when jobs can't be completed
- Access Google Maps links for job locations

## 🏗️ Technical Architecture

### **Data Flow**
```
JIRA (Scheduled Tickets) → Supabase Edge Function → Engineer Portal
                                    ↓
                            Mobile Web Interface
                                    ↓
                            Job Updates → JIRA (via API)
```

### **Key Requirements**
- **No Customer Data Storage**: All customer data remains in JIRA
- **Mobile-First Design**: Optimized for phone usage
- **Simple Authentication**: Engineer-specific access
- **JIRA Integration**: Read scheduled tickets, update status
- **Photo Upload**: Job completion evidence
- **Work Form**: Digital completion form (replaces Word doc)

## 📱 Core Features

### **Job Management**
- List all assigned jobs for engineer
- Job details (location, description, priority)
- Google Maps integration for navigation
- Status updates (Complete/Incomplete)

### **Completion Workflow**
- **Complete Jobs**:
  - Photo upload (multiple images)
  - Digital work form completion
  - Submit for review
- **Incomplete Jobs**:
  - Select reason from predefined list
  - Add custom notes
  - Reschedule if needed

### **Engineer Experience**
- Clean, simple interface
- Fast loading on mobile networks
- Offline capability for form completion
- Push notifications for new assignments

## 🛠️ Technical Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Mobile**: PWA capabilities
- **Maps**: Google Maps API
- **Forms**: React Hook Form
- **File Upload**: Supabase Storage

### **Backend**
- **Database**: Supabase (PostgreSQL)
- **Edge Functions**: JIRA API integration
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **API**: JIRA REST API

### **Integration**
- **JIRA API**: Read scheduled tickets, update status
- **Google Maps**: Location services
- **Push Notifications**: Service Worker

## 📁 Project Structure

```
engineer-portal/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Engineer dashboard
│   │   ├── jobs/              # Job management
│   │   ├── complete/          # Job completion flow
│   │   └── auth/              # Authentication
│   ├── components/
│   │   ├── JobCard.tsx        # Individual job display
│   │   ├── PhotoUpload.tsx    # Image upload component
│   │   ├── WorkForm.tsx       # Digital work form
│   │   └── StatusUpdate.tsx   # Complete/incomplete flow
│   ├── lib/
│   │   ├── jira.ts           # JIRA API client
│   │   ├── supabase.ts       # Supabase client
│   │   └── auth.ts           # Authentication helpers
│   └── types/
│       └── job.ts            # TypeScript interfaces
├── public/
│   └── icons/                # PWA icons
└── package.json
```

## 🔐 Security & Privacy

### **Data Protection**
- No customer data stored in portal database
- All sensitive data remains in JIRA
- Engineer authentication required
- Photo uploads encrypted
- HTTPS only

### **Access Control**
- Engineer-specific login
- Job visibility limited to assigned engineer
- Admin dashboard for Freshwave staff
- Audit trail for all updates

## 🚀 Development Phases

### **Phase 1: MVP (2-3 weeks)**
- [ ] Basic authentication system
- [ ] Job listing from JIRA
- [ ] Simple complete/incomplete workflow
- [ ] Mobile-responsive design

### **Phase 2: Enhanced Features (2-3 weeks)**
- [ ] Photo upload functionality
- [ ] Digital work form
- [ ] Google Maps integration
- [ ] Push notifications

### **Phase 3: Advanced Features (2-3 weeks)**
- [ ] Offline capability
- [ ] PWA installation
- [ ] Advanced reporting
- [ ] Multi-vendor support

## 📋 Questions & Clarifications Needed

See [QUESTIONS.md](./QUESTIONS.md) for detailed clarification questions about:
- Engineer authentication method
- JIRA field mapping
- Photo requirements
- Work form structure
- Failure reason categories
- Multi-vendor considerations

## 🎯 Success Metrics

- **Adoption**: 90%+ of engineers using portal within 30 days
- **Efficiency**: 50% reduction in job completion time
- **Data Quality**: 95%+ jobs have required photos/forms
- **User Satisfaction**: 4.5+ star rating from engineers

---

*Built for Freshwave by the development team*
