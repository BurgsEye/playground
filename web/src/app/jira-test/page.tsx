'use client';

import React, { useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';

export default function JiraTestPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jql, setJql] = useState('project = "PROJ" AND status != Done');

  const testJiraFunction = async (functionName: string, data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/jira/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      setTestResults({ function: functionName, result, success: response.ok });
    } catch (error) {
      setTestResults({ function: functionName, error: error instanceof Error ? error.message : 'Unknown error', success: false });
    } finally {
      setIsLoading(false);
    }
  };

  const testSearchTickets = () => {
    testJiraFunction('search-tickets', {
      jql: jql,
      fields: ['key', 'summary', 'status', 'priority', 'assignee'],
      maxResults: 10
    });
  };

  const testCreateTicket = () => {
    testJiraFunction('create-ticket', {
      ticket: {
        summary: 'Test Ticket from Clustering App',
        description: 'This is a test ticket created by the clustering application.',
        issueType: 'Task',
        priority: 'Medium',
        labels: ['test', 'clustering']
      }
    });
  };

  const testUpdateTicket = () => {
    const ticketKey = prompt('Enter ticket key to update (e.g., PROJ-123):');
    if (ticketKey) {
      testJiraFunction('update-ticket', {
        ticketKey: ticketKey,
        updates: {
          summary: 'Updated Test Ticket',
          description: 'This ticket has been updated by the clustering app.',
          priority: 'High'
        }
      });
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">JIRA Functions Test</h1>
            
            <div className="space-y-6">
              {/* Search Tickets Test */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">1. Search Tickets (JQL)</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      JQL Query:
                    </label>
                    <input
                      type="text"
                      value={jql}
                      onChange={(e) => setJql(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="project = 'PROJ' AND status != Done"
                    />
                  </div>
                  <button
                    onClick={testSearchTickets}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Testing...' : 'Test Search Tickets'}
                  </button>
                </div>
              </div>

              {/* Create Ticket Test */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">2. Create Ticket</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Creates a test ticket in your JIRA project.
                </p>
                <button
                  onClick={testCreateTicket}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Test Create Ticket'}
                </button>
              </div>

              {/* Update Ticket Test */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">3. Update Ticket</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Updates an existing ticket. You'll be prompted for the ticket key.
                </p>
                <button
                  onClick={testUpdateTicket}
                  disabled={isLoading}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Test Update Ticket'}
                </button>
              </div>

              {/* Results */}
              {testResults && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Test Results</h3>
                  <div className={`p-3 rounded-md ${testResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="font-medium mb-2">
                      Function: {testResults.function}
                    </div>
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(testResults.result || testResults.error, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
