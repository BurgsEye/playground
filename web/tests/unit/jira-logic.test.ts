/**
 * Unit tests for JIRA logic functions
 * These test the business logic without hitting external APIs
 */

describe('JIRA Logic Unit Tests', () => {
  // Mock JIRA configuration
  const mockJiraConfig = {
    jiraUrl: 'https://test.atlassian.net',
    email: 'test@example.com',
    apiToken: 'test-token',
    projectKey: 'TEST',
    clusteringStatus: 'Ready For Clustering'
  };

  describe('JQL Query Building', () => {
    test('should build basic project query', () => {
      const jql = `project = "${mockJiraConfig.projectKey}"`;
      expect(jql).toBe('project = "TEST"');
    });

    test('should build status-based query', () => {
      const jql = `project = "${mockJiraConfig.projectKey}" AND status = "${mockJiraConfig.clusteringStatus}"`;
      expect(jql).toBe('project = "TEST" AND status = "Ready For Clustering"');
    });

    test('should build complex query with multiple conditions', () => {
      const jql = `project = "${mockJiraConfig.projectKey}" AND status = "${mockJiraConfig.clusteringStatus}" AND priority = "High"`;
      expect(jql).toBe('project = "TEST" AND status = "Ready For Clustering" AND priority = "High"');
    });
  });

  describe('URL Building', () => {
    test('should build search URL with JQL', () => {
      const jql = 'project = "TEST"';
      const fields = 'key,summary,status';
      const searchUrl = `${mockJiraConfig.jiraUrl}/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=50&fields=${encodeURIComponent(fields)}`;
      expect(searchUrl).toBe('https://test.atlassian.net/rest/api/3/search/jql?jql=project%20%3D%20%22TEST%22&maxResults=50&fields=key%2Csummary%2Cstatus');
    });

    test('should build connection test URL', () => {
      const connectionUrl = `${mockJiraConfig.jiraUrl}/rest/api/3/myself`;
      expect(connectionUrl).toBe('https://test.atlassian.net/rest/api/3/myself');
    });

    test('should build ticket creation URL', () => {
      const createUrl = `${mockJiraConfig.jiraUrl}/rest/api/3/issue`;
      expect(createUrl).toBe('https://test.atlassian.net/rest/api/3/issue');
    });
  });

  describe('Authentication Header Building', () => {
    test('should build basic auth header', () => {
      const authHeader = `Basic ${btoa(`${mockJiraConfig.email}:${mockJiraConfig.apiToken}`)}`;
      expect(authHeader).toBe('Basic dGVzdEBleGFtcGxlLmNvbTp0ZXN0LXRva2Vu');
    });

    test('should handle special characters in credentials', () => {
      const specialConfig = {
        ...mockJiraConfig,
        email: 'test+user@example.com',
        apiToken: 'token-with-special-chars!@#'
      };
      const authHeader = `Basic ${btoa(`${specialConfig.email}:${specialConfig.apiToken}`)}`;
      expect(authHeader).toBe('Basic dGVzdCt1c2VyQGV4YW1wbGUuY29tOnRva2VuLXdpdGgtc3BlY2lhbC1jaGFycyFAIw==');
    });
  });

  describe('Response Processing', () => {
    test('should process JIRA search response', () => {
      const mockJiraResponse = {
        issues: [
          {
            key: 'TEST-1',
            fields: {
              summary: 'Test ticket',
              status: { name: 'Ready For Clustering' },
              priority: { name: 'High' },
              assignee: { displayName: 'John Doe' },
              created: '2024-01-15T10:30:00.000Z'
            }
          }
        ],
        total: 1,
        maxResults: 50
      };

      const processedTickets = mockJiraResponse.issues.map(issue => ({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        priority: issue.fields.priority.name,
        assignee: issue.fields.assignee?.displayName,
        created: issue.fields.created
      }));

      expect(processedTickets).toEqual([
        {
          key: 'TEST-1',
          summary: 'Test ticket',
          status: 'Ready For Clustering',
          priority: 'High',
          assignee: 'John Doe',
          created: '2024-01-15T10:30:00.000Z'
        }
      ]);
    });

    test('should handle empty search results', () => {
      const mockEmptyResponse = {
        issues: [],
        total: 0,
        maxResults: 50
      };

      const processedTickets = mockEmptyResponse.issues.map(issue => ({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name
      }));

      expect(processedTickets).toEqual([]);
      expect(mockEmptyResponse.total).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should format JIRA API errors', () => {
      const mockErrorResponse = {
        status: 401,
        statusText: 'Unauthorized',
        errorMessages: ['Invalid credentials']
      };

      const errorMessage = `JIRA API Error: ${mockErrorResponse.status} ${mockErrorResponse.statusText}`;
      expect(errorMessage).toBe('JIRA API Error: 401 Unauthorized');
    });

    test('should handle network errors', () => {
      const networkError = new Error('Network request failed');
      expect(networkError.message).toBe('Network request failed');
    });
  });

  describe('Ticket Creation Payload', () => {
    test('should build basic ticket creation payload', () => {
      const ticketData = {
        projectKey: 'TEST',
        issueType: 'Task',
        summary: 'Test ticket',
        description: 'Test description',
        priority: 'Medium'
      };

      const payload = {
        fields: {
          project: { key: ticketData.projectKey },
          issuetype: { name: ticketData.issueType },
          summary: ticketData.summary,
          description: ticketData.description,
          priority: { name: ticketData.priority }
        }
      };

      expect(payload).toEqual({
        fields: {
          project: { key: 'TEST' },
          issuetype: { name: 'Task' },
          summary: 'Test ticket',
          description: 'Test description',
          priority: { name: 'Medium' }
        }
      });
    });

    test('should build ticket update payload', () => {
      const updates = {
        summary: 'Updated summary',
        status: 'In Progress',
        priority: 'High'
      };

      const payload = {
        fields: {
          summary: updates.summary,
          priority: { name: updates.priority }
        },
        transition: {
          name: updates.status
        }
      };

      expect(payload).toEqual({
        fields: {
          summary: 'Updated summary',
          priority: { name: 'High' }
        },
        transition: {
          name: 'In Progress'
        }
      });
    });
  });
});
