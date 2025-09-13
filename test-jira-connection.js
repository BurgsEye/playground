// Simple JIRA connection test script
// Run with: node test-jira-connection.js

const JIRA_URL = process.env.JIRA_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY;

if (!JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN || !JIRA_PROJECT_KEY) {
  console.error('❌ Missing environment variables!');
  console.log('Required: JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY');
  process.exit(1);
}

async function testJiraConnection() {
  console.log('🧪 Testing JIRA Connection...');
  console.log(`URL: ${JIRA_URL}`);
  console.log(`Email: ${JIRA_EMAIL}`);
  console.log(`Project: ${JIRA_PROJECT_KEY}`);
  console.log('');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const response = await fetch(`${JIRA_URL}/rest/api/3/myself`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const user = await response.json();
    console.log('✅ Connection successful!');
    console.log(`User: ${user.displayName} (${user.emailAddress})`);
    console.log('');

    // Test 2: Search for tickets
    console.log('2️⃣ Testing ticket search...');
    const searchResponse = await fetch(`${JIRA_URL}/rest/api/3/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jql: `project = "${JIRA_PROJECT_KEY}"`,
        fields: ['key', 'summary', 'status', 'priority'],
        maxResults: 5
      })
    });

    if (!searchResponse.ok) {
      throw new Error(`Search failed: ${searchResponse.status}`);
    }

    const searchResult = await searchResponse.json();
    console.log('✅ Search successful!');
    console.log(`Found ${searchResult.total} tickets in project ${JIRA_PROJECT_KEY}`);
    
    if (searchResult.issues.length > 0) {
      console.log('Sample tickets:');
      searchResult.issues.forEach(issue => {
        console.log(`  - ${issue.key}: ${issue.fields.summary} (${issue.fields.status.name})`);
      });
    }
    console.log('');

    // Test 3: Test our Edge Function
    console.log('3️⃣ Testing Supabase Edge Function...');
    const edgeFunctionResponse = await fetch('https://uofwzjsokfuigryetnle.supabase.co/functions/v1/jira-integration/test-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jiraUrl: JIRA_URL,
        email: JIRA_EMAIL,
        apiToken: JIRA_API_TOKEN,
        projectKey: JIRA_PROJECT_KEY
      })
    });

    const edgeResult = await edgeFunctionResponse.json();
    if (edgeFunctionResponse.ok) {
      console.log('✅ Edge Function test successful!');
      console.log(`User: ${edgeResult.user.displayName}`);
    } else {
      console.log('❌ Edge Function test failed:', edgeResult.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testJiraConnection();
