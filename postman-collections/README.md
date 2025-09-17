# Postman Collections for Playground API

This directory contains Postman collections for testing the Playground API in both development and production environments.

## 📁 Files

- `playground-api-dev.postman_collection.json` - Development environment collection
- `playground-api-prod.postman_collection.json` - Production environment collection

## 🚀 Quick Start

1. **Import Collections**: Import both JSON files into Postman
2. **Set Environment Variables**: Update the variables in each collection with your actual values
3. **Start Testing**: Run the requests to test your API endpoints

## 🔧 Environment Variables

### Development Collection Variables
- `baseUrl`: `http://localhost:3001` (or your local dev port)
- `supabaseUrl`: `https://uofwzjsokfuigryetnle.supabase.co`
- `supabaseAnonKey`: Your Supabase anonymous key
- `jiraUrl`: `https://westbase.atlassian.net`
- `jiraEmail`: `tf@westbase.io`
- `jiraApiToken`: **YOUR_JIRA_API_TOKEN_HERE** (replace with actual token)
- `jiraProjectKey`: `AIRB`

### Production Collection Variables
- `baseUrl`: Your Vercel production URL
- `supabaseUrl`: `https://uofwzjsokfuigryetnle.supabase.co`
- `supabaseAnonKey`: Your Supabase anonymous key
- `jiraUrl`: `https://westbase.atlassian.net`
- `jiraEmail`: `tf@westbase.io`
- `jiraApiToken`: **YOUR_JIRA_API_TOKEN_HERE** (replace with actual token)
- `jiraProjectKey`: `AIRB`

## 📋 Available Endpoints

### Authentication
- **Sign Up** - Create new user account
- **Sign In** - Authenticate existing user

### Auto-Clustering
- **Precise Clustering** - Create exactly N clusters
- **Min/Max Clustering** - Create clusters with size constraints
- **Legacy Mode** - Original fixed-size clustering

### JIRA Integration
- **Test Connection** - Verify JIRA credentials
- **Get Tickets** - Fetch tickets from JIRA project
- **Search Tickets** - Search using JQL queries
- **Create Ticket** - Create new JIRA ticket
- **Update Ticket** - Update existing JIRA ticket

### Web App API Routes
- **JIRA Test Connection** - Test via web app API
- **JIRA Get Tickets** - Get tickets via web app API
- **JIRA Search Tickets** - Search via web app API
- **JIRA Create Ticket** - Create via web app API
- **JIRA Update Ticket** - Update via web app API

## 🧪 Sample Data

Each request includes realistic sample data for testing:

### Auto-Clustering Sample Data
- **6 sample tickets** with coordinates in New York area
- **Different priorities** (High, Medium, Low)
- **Various clustering modes** to test all functionality

### JIRA Sample Data
- **Real JIRA project** (AIRB)
- **JQL queries** for searching tickets
- **Complete ticket creation** with all required fields
- **Ticket updates** with field modifications

## 🔐 Security Notes

- **Never commit real API tokens** to version control
- **Use environment variables** for sensitive data
- **Test with read-only operations** first
- **Verify permissions** before running write operations

## 🚨 Important

1. **Replace `YOUR_JIRA_API_TOKEN_HERE`** with your actual JIRA API token
2. **Update production URL** when you deploy to Vercel
3. **Test authentication** before running other requests
4. **Start with read-only tests** to verify connectivity

## 📖 Usage Tips

1. **Import both collections** for comprehensive testing
2. **Set up environment variables** in Postman for easy switching
3. **Use the "Tests" tab** to add response validation
4. **Save successful requests** as examples for your team
5. **Use the "Runner"** to execute multiple requests in sequence

Happy testing! 🎯
