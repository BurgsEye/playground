# Engineer Portal - Clarifying Questions

## 🔐 Authentication & Access

### **Engineer Identification**
- How do we identify individual engineers? (Employee ID, email, phone number?)
- Do engineers have existing accounts in any system we can leverage?
- Should we create accounts for them, or do they self-register?
- Do we need to integrate with APC's existing systems?

### **Access Control**
- How do we determine which jobs belong to which engineer?
- Is this based on JIRA assignee field, custom field, or separate mapping?
- Do engineers need to see jobs for other engineers (team view)?
- Should there be different permission levels (engineer vs supervisor)?

## 📋 JIRA Integration

### **Data Mapping**
- What JIRA fields contain the job location information?
- Are there custom fields for engineer assignment, or do we use the standard assignee?
- What's the exact field name for job status (you mentioned "Scheduled")?
- Are there other statuses we need to handle (In Progress, Blocked, etc.)?

### **Job Details**
- What information from JIRA should we display to engineers?
- Do we need to show customer contact information, or just location?
- Are there specific fields for job priority, estimated duration, or special instructions?
- Should we display JIRA ticket numbers for reference?

### **Status Updates**
- When an engineer marks a job complete, what JIRA status should it transition to?
- When marked incomplete, what status and what fields should be updated?
- Do we need to add comments to JIRA tickets with engineer notes?
- Should we create subtasks for photo uploads or work forms?

## 📸 Photo & Documentation

### **Photo Requirements**
- How many photos are required per job?
- Are there specific photo requirements (before/after, equipment shots, etc.)?
- What's the maximum file size and format restrictions?
- Should photos be automatically resized/compressed for mobile upload?

### **Work Form**
- What information is currently captured in the Word document?
- Should this be a simple form or a complex multi-step process?
- Do we need digital signatures?
- Should the form be customizable per job type or customer?

## 🚫 Failure Reasons

### **Predefined Categories**
- What are the most common reasons jobs can't be completed?
- Should these be hierarchical (main category + subcategory)?
- Do different failure reasons trigger different workflows in JIRA?
- Should we track failure frequency for process improvement?

### **Custom Notes**
- Is there a character limit for custom failure notes?
- Should custom notes be required or optional?
- Do we need to notify anyone when a job fails?

## 🗺️ Location & Navigation

### **Address Handling**
- Are job locations stored as full addresses, postcodes, or coordinates in JIRA?
- Do we need to validate/standardize addresses?
- Should we show estimated travel time between jobs in a cluster?
- Do we need to handle international locations (outside UK)?

### **Google Maps Integration**
- Should we show all jobs in a cluster on one map?
- Do we need turn-by-turn navigation or just location display?
- Should we track engineer location for progress monitoring?

## 📱 Mobile Experience

### **Offline Capability**
- Do engineers work in areas with poor mobile coverage?
- Should the app work offline and sync when connection is restored?
- What's the minimum data requirement for photo uploads?

### **Device Requirements**
- What's the oldest mobile device we need to support?
- Do engineers use company phones or personal devices?
- Should this be a web app or native mobile app?

## 🔄 Workflow & Notifications

### **Job Assignment**
- How are jobs assigned to engineers? (Manual in JIRA, automatic, etc.)
- Should engineers get notified when new jobs are assigned?
- Do we need to handle job reassignment or handoffs?

### **Status Updates**
- Who needs to be notified when a job is completed?
- Should Freshwave staff get real-time updates?
- Do we need email/SMS notifications or just in-app?

### **SLA Tracking**
- How do we track the 7-day SLA for job clusters?
- Should engineers see SLA countdown timers?
- What happens when SLA is approaching or exceeded?

## 🏢 Multi-Vendor Considerations

### **Future Expansion**
- What other vendors besides APC might use this system?
- Should each vendor have separate portals or shared access?
- Do different vendors have different workflows or requirements?
- How do we handle vendor-specific customizations?

### **Vendor Management**
- Who manages engineer accounts for each vendor?
- Should vendors have admin access to their own engineers?
- Do we need vendor-specific branding or customization?

## 📊 Reporting & Analytics

### **Engineer Performance**
- What metrics should we track for individual engineers?
- Should engineers see their own performance data?
- Do we need productivity dashboards for supervisors?

### **Job Analytics**
- What reporting does Freshwave need from the system?
- Should we track job completion rates, average time, etc.?
- Do we need integration with existing Freshwave reporting systems?

## 🔧 Technical Constraints

### **Integration Requirements**
- Are there existing Freshwave systems we need to integrate with?
- Do we need to maintain data consistency with other systems?
- Are there specific security or compliance requirements?

### **Performance Requirements**
- How many engineers will use the system simultaneously?
- What's the expected volume of jobs per day?
- Are there peak usage times we need to consider?

---

**Please provide answers to these questions so we can refine the technical requirements and create a more detailed implementation plan.**
