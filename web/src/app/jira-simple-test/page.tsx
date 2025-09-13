'use client';

import React, { useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';

export default function JiraSimpleTestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/jira/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          jiraUrl: process.env.NEXT_PUBLIC_JIRA_URL,
          email: process.env.NEXT_PUBLIC_JIRA_EMAIL,
          apiToken: process.env.NEXT_PUBLIC_JIRA_API_TOKEN,
          projectKey: process.env.NEXT_PUBLIC_JIRA_PROJECT_KEY
        })
      });

      const result = await response.json();
      setTestResult({ success: response.ok, data: result });
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Simple JIRA Connection Test</h1>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Environment Variables</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>JIRA URL:</strong> {process.env.NEXT_PUBLIC_JIRA_URL || 'Not set'}</div>
                  <div><strong>Email:</strong> {process.env.NEXT_PUBLIC_JIRA_EMAIL || 'Not set'}</div>
                  <div><strong>Project Key:</strong> {process.env.NEXT_PUBLIC_JIRA_PROJECT_KEY || 'Not set'}</div>
                  <div><strong>API Token:</strong> {process.env.NEXT_PUBLIC_JIRA_API_TOKEN ? '***' + process.env.NEXT_PUBLIC_JIRA_API_TOKEN.slice(-4) : 'Not set'}</div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={testConnection}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 text-lg font-medium"
                >
                  {isLoading ? 'Testing Connection...' : 'Test JIRA Connection'}
                </button>
              </div>

              {testResult && (
                <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className={`text-lg font-semibold mb-2 ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                    {testResult.success ? '✅ Connection Successful!' : '❌ Connection Failed'}
                  </h3>
                  <pre className="text-sm overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(testResult.data || testResult.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
