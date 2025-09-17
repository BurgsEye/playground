/**
 * Read-Only Integration tests for JIRA Edge Function
 * These test only safe operations that don't create or modify data
 */

import { createClient } from '@supabase/supabase-js';

// Test configuration - use environment variables only
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// JIRA test configuration (use environment variables only)
const JIRA_URL = process.env.NEXT_PUBLIC_JIRA_URL;
const JIRA_EMAIL = process.env.NEXT_PUBLIC_JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.NEXT_PUBLIC_JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = process.env.NEXT_PUBLIC_JIRA_PROJECT_KEY;

// Skip tests if credentials are not provided
const skipTests = !SUPABASE_URL || !SUPABASE_ANON_KEY || !JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN || !JIRA_PROJECT_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

describe('JIRA Edge Function Read-Only Integration Tests', () => {
  const baseUrl = `${SUPABASE_URL}/functions/v1/jira-integration`;
  
  // Helper function to make authenticated requests
  const makeRequest = async (endpoint: string, body: any) => {
    const response = await fetch(`${baseUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(body)
    });
    
    return {
      response,
      data: await response.json()
    };
  };

  describe('Connection Tests', () => {
    test('should test JIRA connection successfully', async () => {
      if (skipTests) {
        console.log('Skipping tests - credentials not provided');
        return;
      }
      const { response, data } = await makeRequest('test-connection', {
        jiraUrl: JIRA_URL,
        email: JIRA_EMAIL,
        apiToken: JIRA_API_TOKEN,
        projectKey: JIRA_PROJECT_KEY
      });

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.displayName).toBeDefined();
      expect(data.user.emailAddress).toBe(JIRA_EMAIL);
    }, 10000);

    test('should fail with invalid credentials', async () => {
      if (skipTests) {
        console.log('Skipping tests - credentials not provided');
        return;
      }
      const { response, data } = await makeRequest('test-connection', {
        jiraUrl: JIRA_URL,
        email: 'invalid@example.com',
        apiToken: 'invalid-token',
        projectKey: JIRA_PROJECT_KEY
      });

      expect(response.ok).toBe(false);
      expect(data.error).toBeDefined();
    }, 10000);
  });

  describe('Ticket Retrieval Tests', () => {
    test('should get tickets from JIRA project', async () => {
      if (skipTests) {
        console.log('Skipping tests - credentials not provided');
        return;
      }
      const { response, data } = await makeRequest('get-tickets', {
        jiraUrl: JIRA_URL,
        email: JIRA_EMAIL,
        apiToken: JIRA_API_TOKEN,
        projectKey: JIRA_PROJECT_KEY,
        clusteringStatus: 'Ready For Clustering'
      });

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.tickets).toBeDefined();
      expect(Array.isArray(data.tickets)).toBe(true);
      // Note: total might be undefined if no tickets match the status
      if (data.total !== undefined) {
        expect(typeof data.total).toBe('number');
      }
      
      // Log some sample tickets for verification
      if (data.tickets.length > 0) {
        console.log(`Found ${data.tickets.length} tickets ready for clustering:`);
        data.tickets.slice(0, 3).forEach((ticket: any) => {
          console.log(`  - ${ticket.key}: ${ticket.summary} (${ticket.status})`);
        });
      }
    }, 15000);

    test('should search tickets with custom JQL', async () => {
      if (skipTests) {
        console.log('Skipping tests - credentials not provided');
        return;
      }
      const { response, data } = await makeRequest('search-tickets', {
        config: {
          jiraUrl: JIRA_URL,
          email: JIRA_EMAIL,
          apiToken: JIRA_API_TOKEN
        },
        jql: `project = "${JIRA_PROJECT_KEY}"`,
        fields: ['key', 'summary', 'status'],
        maxResults: 5
      });

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.tickets).toBeDefined();
      expect(Array.isArray(data.tickets)).toBe(true);
      expect(data.tickets.length).toBeLessThanOrEqual(5);
      
      // Log some sample tickets for verification
      if (data.tickets.length > 0) {
        console.log(`Found ${data.tickets.length} tickets in project ${JIRA_PROJECT_KEY}:`);
        data.tickets.forEach((ticket: any) => {
          console.log(`  - ${ticket.key}: ${ticket.summary} (${ticket.status})`);
        });
      }
    }, 15000);

    test('should search tickets by status', async () => {
      if (skipTests) {
        console.log('Skipping tests - credentials not provided');
        return;
      }
      const { response, data } = await makeRequest('search-tickets', {
        config: {
          jiraUrl: JIRA_URL,
          email: JIRA_EMAIL,
          apiToken: JIRA_API_TOKEN
        },
        jql: `project = "${JIRA_PROJECT_KEY}" AND status = "Open"`,
        fields: ['key', 'summary', 'status', 'priority'],
        maxResults: 3
      });

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.tickets).toBeDefined();
      expect(Array.isArray(data.tickets)).toBe(true);
      
      // Log some sample tickets for verification
      if (data.tickets.length > 0) {
        console.log(`Found ${data.tickets.length} open tickets:`);
        data.tickets.forEach((ticket: any) => {
          console.log(`  - ${ticket.key}: ${ticket.summary} (${ticket.status})`);
        });
      }
    }, 15000);
  });

  describe('Error Handling Tests', () => {
    test('should return 404 for invalid endpoint', async () => {
      if (skipTests) {
        console.log('Skipping tests - credentials not provided');
        return;
      }
      const { response, data } = await makeRequest('invalid-endpoint', {});

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invalid endpoint');
      expect(data.availableEndpoints).toBeDefined();
    });

    test('should return 400 for missing required fields', async () => {
      if (skipTests) {
        console.log('Skipping tests - credentials not provided');
        return;
      }
      const { response, data } = await makeRequest('test-connection', {
        jiraUrl: JIRA_URL
        // Missing email, apiToken, projectKey
      });

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    test('should handle invalid JQL queries gracefully', async () => {
      if (skipTests) {
        console.log('Skipping tests - credentials not provided');
        return;
      }
      const { response, data } = await makeRequest('search-tickets', {
        config: {
          jiraUrl: JIRA_URL,
          email: JIRA_EMAIL,
          apiToken: JIRA_API_TOKEN
        },
        jql: 'invalid jql query syntax',
        fields: ['key', 'summary'],
        maxResults: 5
      });

      expect(response.ok).toBe(false);
      expect(data.error).toBeDefined();
    }, 15000);
  });

  describe('Performance Tests', () => {
    test('should handle large result sets efficiently', async () => {
      if (skipTests) {
        console.log('Skipping tests - credentials not provided');
        return;
      }
      const startTime = Date.now();
      
      const { response, data } = await makeRequest('search-tickets', {
        config: {
          jiraUrl: JIRA_URL,
          email: JIRA_EMAIL,
          apiToken: JIRA_API_TOKEN
        },
        jql: `project = "${JIRA_PROJECT_KEY}"`,
        fields: ['key', 'summary', 'status'],
        maxResults: 50
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      
      console.log(`Query completed in ${duration}ms, found ${data.tickets?.length || 0} tickets`);
    }, 15000);
  });
});
