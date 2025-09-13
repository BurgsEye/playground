'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

interface JiraConfig {
  jiraUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  clusteringStatus: string;
  clusterTicketType: string;
}

interface ConnectionTest {
  success: boolean;
  user?: {
    displayName: string;
    emailAddress: string;
  };
  error?: string;
}

export default function JiraConfigPage() {
  const { session } = useAuth();
  const [config, setConfig] = useState<JiraConfig>({
    jiraUrl: '',
    email: '',
    apiToken: '',
    projectKey: '',
    clusteringStatus: 'Ready For Clustering',
    clusterTicketType: 'Job Cluster'
  });

  const [connectionTest, setConnectionTest] = useState<ConnectionTest | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleInputChange = (field: keyof JiraConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear connection test when config changes
    setConnectionTest(null);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTest(null);

    try {
      const response = await fetch('/api/jira/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(config),
      });

      const result = await response.json();
      setConnectionTest(result);
    } catch (error) {
      setConnectionTest({
        success: false,
        error: 'Failed to connect to JIRA API'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveConfiguration = async () => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/jira-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(config),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('JIRA configuration saved successfully!');
      } else {
        throw new Error(result.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Load saved config on component mount
  useEffect(() => {
    const loadConfig = async () => {
      if (!session?.access_token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/jira-config', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();
        
        if (result.config) {
          setConfig({
            jiraUrl: result.config.jira_url || '',
            email: result.config.email || '',
            apiToken: result.config.api_token || '',
            projectKey: result.config.project_key || '',
            clusteringStatus: result.config.clustering_status || 'Ready For Clustering',
            clusterTicketType: result.config.cluster_ticket_type || 'Job Cluster'
          });
        }
      } catch (error) {
        console.error('Failed to load JIRA config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [session]);

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading JIRA configuration...</p>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-blue-600 hover:text-blue-700">Dashboard</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><span className="text-gray-900 font-medium">JIRA Configuration</span></li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">JIRA Integration Setup</h1>
          <p className="text-gray-600">Configure your JIRA connection to enable automatic ticket clustering</p>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Connection Settings</h2>
            <p className="text-sm text-gray-600 mt-1">
              Enter your JIRA instance details and API credentials
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* JIRA URL */}
            <div>
              <label htmlFor="jiraUrl" className="block text-sm font-medium text-gray-700 mb-2">
                JIRA URL
              </label>
              <input
                type="url"
                id="jiraUrl"
                value={config.jiraUrl}
                onChange={(e) => handleInputChange('jiraUrl', e.target.value)}
                placeholder="https://your-company.atlassian.net"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your JIRA Cloud instance URL (including https://)
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={config.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your-email@company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your JIRA account email address
              </p>
            </div>

            {/* API Token */}
            <div>
              <label htmlFor="apiToken" className="block text-sm font-medium text-gray-700 mb-2">
                API Token
              </label>
              <input
                type="password"
                id="apiToken"
                value={config.apiToken}
                onChange={(e) => handleInputChange('apiToken', e.target.value)}
                placeholder="ATATT3xFfGF0..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Generate an API token from your{' '}
                <a 
                  href="https://id.atlassian.com/manage-profile/security/api-tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Atlassian Account Settings
                </a>
              </p>
            </div>

            {/* Project Settings */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Project Configuration</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Project Key */}
                <div>
                  <label htmlFor="projectKey" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Key
                  </label>
                  <input
                    type="text"
                    id="projectKey"
                    value={config.projectKey}
                    onChange={(e) => handleInputChange('projectKey', e.target.value)}
                    placeholder="PROJ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The key of your JIRA project
                  </p>
                </div>

                {/* Clustering Status */}
                <div>
                  <label htmlFor="clusteringStatus" className="block text-sm font-medium text-gray-700 mb-2">
                    Clustering Status
                  </label>
                  <input
                    type="text"
                    id="clusteringStatus"
                    value={config.clusteringStatus}
                    onChange={(e) => handleInputChange('clusteringStatus', e.target.value)}
                    placeholder="Ready For Clustering"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Status name for tickets ready to be clustered
                  </p>
                </div>
              </div>

              {/* Cluster Ticket Type */}
              <div className="mt-6">
                <label htmlFor="clusterTicketType" className="block text-sm font-medium text-gray-700 mb-2">
                  Cluster Ticket Type
                </label>
                <input
                  type="text"
                  id="clusterTicketType"
                  value={config.clusterTicketType}
                  onChange={(e) => handleInputChange('clusterTicketType', e.target.value)}
                  placeholder="Job Cluster"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ticket type to create for job clusters
                </p>
              </div>
            </div>

            {/* Connection Test */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-gray-900">Test Connection</h3>
                <button
                  onClick={testConnection}
                  disabled={isTestingConnection || !config.jiraUrl || !config.email || !config.apiToken}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isTestingConnection ? 'Testing...' : 'Test Connection'}
                </button>
              </div>

              {connectionTest && (
                <div className={`p-4 rounded-md ${connectionTest.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  {connectionTest.success ? (
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-green-800 font-medium">Connection successful!</p>
                        <p className="text-green-700 text-sm mt-1">
                          Connected as: {connectionTest.user?.displayName} ({connectionTest.user?.emailAddress})
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-red-800 font-medium">Connection failed</p>
                        <p className="text-red-700 text-sm mt-1">{connectionTest.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="border-t border-gray-200 pt-6 flex justify-end">
              <button
                onClick={saveConfiguration}
                disabled={isSaving || !connectionTest?.success}
                className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Setup Instructions</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start">
              <span className="font-medium mr-2">1.</span>
              <div>
                <strong>Generate API Token:</strong> Visit your{' '}
                <a 
                  href="https://id.atlassian.com/manage-profile/security/api-tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  Atlassian Account Settings
                </a>{' '}
                and create a new API token.
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">2.</span>
              <div>
                <strong>Configure JIRA Project:</strong> Ensure your project has a "Ready For Clustering" status and "Job Cluster" ticket type.
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">3.</span>
              <div>
                <strong>Location Data:</strong> Tickets must have location information in a custom field for clustering to work.
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-medium mr-2">4.</span>
              <div>
                <strong>Permissions:</strong> Your account needs read/write access to the project and ability to create/link tickets.
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </AuthGuard>
  );
}
