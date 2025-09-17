'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { supabase } from '@/utils/supabase'
import mockTickets, { Ticket } from '@/data/mockTickets'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'

// Dynamic import for the map component to prevent SSR issues
const TicketMap = dynamic(() => import('@/components/TicketMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

interface ClusterResult {
  cluster_id: string
  tickets: Ticket[]
  center_point: { lat: number, lng: number }
  max_distance_km: number
  total_distance_km: number
}

interface AutoClusteringResult {
  clusters: ClusterResult[]
  unclustered_tickets: Ticket[]
  total_clusters: number
  total_tickets_clustered: number
  clustering_efficiency: number
  algorithm_stats: {
    execution_time_ms: number
    iterations: number
    method: string
  }
}

export default function AutoClusteringPage() {
  const [clusteringResult, setClusteringResult] = useState<AutoClusteringResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [radius, setRadius] = useState(20)
  const [clusterSize, setClusterSize] = useState(3)
  const [selectedCluster, setSelectedCluster] = useState<ClusterResult | null>(null)
  
  // New state for data source toggle and JIRA inputs
  const [useLiveData, setUseLiveData] = useState(false)
  const [jiraProject, setJiraProject] = useState('AIRB')
  const [jiraStatus, setJiraStatus] = useState('Not Completed')
  const [jiraTickets, setJiraTickets] = useState<Ticket[]>([])
  const [jiraLoading, setJiraLoading] = useState(false)

  // Clear all results and data when switching sources
  const clearResults = () => {
    setClusteringResult(null)
    setSelectedCluster(null)
    setError(null)
  }

  // Fetch JIRA tickets
  const fetchJiraTickets = async () => {
    setJiraLoading(true)
    setError(null)
    clearResults() // Clear previous results when fetching new data
    
    try {
      const { data, error } = await supabase.functions.invoke('jira-integration/tickets', {
        body: {
          jiraUrl: 'https://westbase.atlassian.net',
          email: 'tf@westbase.io',
          apiToken: 'REMOVED',
          projectKey: jiraProject,
          clusteringStatus: jiraStatus
        }
      })

      if (error) {
        throw new Error(`JIRA API error: ${error.message}`)
      }

      if (data.success && data.tickets) {
        // Transform JIRA tickets to our Ticket format
        const transformedTickets: Ticket[] = data.tickets.map((ticket: any) => ({
          id: ticket.id,
          title: ticket.title,
          description: ticket.description || '',
          lat: ticket.location.latitude,
          lng: ticket.location.longitude,
          priority: ticket.priority,
          status: ticket.status,
          ticketType: 'JIRA', // Mark as JIRA ticket
          createdAt: ticket.createdAt
        }))
        
        setJiraTickets(transformedTickets)
        console.log(`✅ Fetched ${transformedTickets.length} JIRA tickets`)
      } else {
        throw new Error('No tickets returned from JIRA')
      }
    } catch (error: any) {
      console.error('❌ JIRA Error:', error)
      setError(error.message)
    } finally {
      setJiraLoading(false)
    }
  }

  const runClustering = async () => {
    setIsRunning(true)
    setError(null)
    setClusteringResult(null) // Clear previous results

    try {
      console.log('🚀 Calling Edge Function...')
      
      // Use live JIRA data if toggle is on, otherwise use mock data
      const ticketsToUse = useLiveData ? jiraTickets : mockTickets
      
      if (useLiveData && jiraTickets.length === 0) {
        throw new Error('No JIRA tickets loaded. Please fetch tickets first.')
      }
      
      const { data, error } = await supabase.functions.invoke('auto-cluster', {
        body: {
          tickets: ticketsToUse,
          radius_km: radius,
          precise_cluster_size: clusterSize, // Use precise clustering as default
          prioritize_high_priority: true
        }
      })

      if (error) {
        throw new Error(`Edge Function error: ${error.message}`)
      }

      console.log('✅ Success:', data)
      setClusteringResult(data)
    } catch (error: any) {
      console.error('❌ Error:', error)
      setError(error.message)
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    runClustering()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-blue-600 hover:text-blue-700">Projects</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><Link href="/" className="text-blue-600 hover:text-blue-700">Ticket Clustering</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><span className="text-gray-900 font-medium">Auto Clustering</span></li>
          </ol>
        </nav>

        {/* Data Source Toggle - Inline with page header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Auto Clustering</h1>
            <p className="text-gray-600">Automatically group tickets using intelligent algorithms based on geographic proximity and priority</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Data Source:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setUseLiveData(false)
                    clearResults() // Clear results when switching
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    !useLiveData 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mock Data
                </button>
                <button
                  onClick={() => {
                    setUseLiveData(true)
                    clearResults() // Clear results when switching
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    useLiveData 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Live JIRA
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Clustering Parameters</h2>
          </div>
          <div className="p-6">
            {/* JIRA Configuration - Show when using live data */}
            {useLiveData && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-3">JIRA Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Key
                    </label>
                    <input
                      type="text"
                      value={jiraProject}
                      onChange={(e) => setJiraProject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., AIRB"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <input
                      type="text"
                      value={jiraStatus}
                      onChange={(e) => setJiraStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Not Completed"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={fetchJiraTickets}
                      disabled={jiraLoading}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      {jiraLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        'Fetch Tickets'
                      )}
                    </button>
                  </div>
                </div>
                {jiraTickets.length > 0 && (
                  <div className="mt-3 text-sm text-green-700">
                    ✅ Loaded {jiraTickets.length} tickets from JIRA
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Radius
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">km</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cluster Size
                </label>
                <input
                  type="number"
                  value={clusterSize}
                  onChange={(e) => setClusterSize(parseInt(e.target.value))}
                  min="2"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Weighting
                </label>
                <div className="flex items-center h-10 px-3 bg-green-50 border border-green-200 rounded-md">
                  <span className="text-green-700 text-sm font-medium">Enabled</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={runClustering}
                  disabled={isRunning}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isRunning ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Run Clustering'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error occurred</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {clusteringResult && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Clusters List - Left Side */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Generated Clusters ({clusteringResult.total_clusters})
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {clusteringResult.total_tickets_clustered} tickets clustered • {clusteringResult.clustering_efficiency}% efficiency
                  </p>
                </div>
                <div className="p-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {clusteringResult.clusters.map((cluster, index) => (
                      <div 
                        key={cluster.cluster_id} 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedCluster?.cluster_id === cluster.cluster_id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedCluster(cluster)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {cluster.cluster_id}
                          </h3>
                          <div className="text-sm text-gray-500">
                            {cluster.tickets.length} tickets
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Max spread: {cluster.max_distance_km}km
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {cluster.tickets.map((ticket) => {
                            const getTicketTypeStyle = (ticketType: string) => {
                              switch (ticketType) {
                                case 'Gold': return 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                case 'Silver': return 'bg-gray-100 text-gray-800 border border-gray-300'
                                case 'Bronze': return 'bg-orange-100 text-orange-800 border border-orange-300'
                                case 'JIRA': return 'bg-blue-100 text-blue-800 border border-blue-300'
                                default: return 'bg-gray-100 text-gray-700 border border-gray-300'
                              }
                            }
                            
                            return (
                              <span
                                key={ticket.id}
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTicketTypeStyle(ticket.ticketType)}`}
                                title={`${ticket.ticketType} ticket: ${ticket.title}`}
                              >
                                {ticket.id}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {clusteringResult.unclustered_tickets.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h4 className="font-medium text-yellow-800 text-sm">
                          Unclustered ({clusteringResult.unclustered_tickets.length})
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {clusteringResult.unclustered_tickets.map((ticket) => {
                          const getTicketTypeStyle = (ticketType: string) => {
                            switch (ticketType) {
                              case 'Gold': return 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                              case 'Silver': return 'bg-gray-100 text-gray-800 border border-gray-300'
                              case 'Bronze': return 'bg-orange-100 text-orange-800 border border-orange-300'
                              case 'JIRA': return 'bg-blue-100 text-blue-800 border border-blue-300'
                              default: return 'bg-gray-100 text-gray-700 border border-gray-300'
                            }
                          }
                          
                          return (
                            <span
                              key={ticket.id}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTicketTypeStyle(ticket.ticketType)}`}
                              title={`${ticket.ticketType} ticket: ${ticket.title}`}
                            >
                              {ticket.id}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Map - Right Side */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Map View</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedCluster 
                      ? `Showing cluster: ${selectedCluster.cluster_id} (${selectedCluster.tickets.length} tickets)`
                      : 'Click a cluster to highlight and zoom to it'
                    }
                  </p>
                </div>
                <div className="p-4">
                  <div className="h-96">
                    <TicketMap
                      tickets={useLiveData ? jiraTickets : mockTickets}
                      clusters={clusteringResult.clusters}
                      selectedCluster={selectedCluster}
                      onTicketClick={(ticket) => {
                        // Find which cluster this ticket belongs to and select it
                        const cluster = clusteringResult.clusters.find(c => 
                          c.tickets.some(t => t.id === ticket.id)
                        )
                        if (cluster) {
                          setSelectedCluster(cluster)
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!clusteringResult && !error && !isRunning && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Process</h3>
            <p className="text-gray-600">Click "Run Clustering" to start analyzing your tickets</p>
          </div>
        )}
      </main>
      </div>
    </AuthGuard>
  )
}
