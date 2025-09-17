'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'
import dynamic from 'next/dynamic'
import { generateRealisticClusters } from '@/data/airbMockData'

// Dynamic import for the map component to prevent SSR issues
const EngineerDashboardMap = dynamic(() => import('@/components/EngineerDashboardMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

interface Job {
  id: string
  key: string
  summary: string
  status: string
  priority: string
  assignee?: string
  location: {
    latitude: number
    longitude: number
    address: string
  }
  airbFields: {
    installationType: string
    externalCPE: string
    internalCPE: string
    wifiMesh: string
    clusterReady: string
    jobCompleteStatus: string
    preferredWindow?: string
    additionalNotes?: string
  }
  createdAt: string
}

interface Cluster {
  id: string
  key: string
  summary: string
  status: string
  jobs: Job[]
  location: {
    latitude: number
    longitude: number
    address: string
  }
  totalJobs: number
  completedJobs: number
  scheduledDate?: string
}

export default function EngineerDashboard() {
  const router = useRouter()
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [expandedMaps, setExpandedMaps] = useState<Set<string>>(new Set())

  const toggleMap = (clusterId: string) => {
    const newExpanded = new Set(expandedMaps)
    if (newExpanded.has(clusterId)) {
      newExpanded.delete(clusterId)
    } else {
      newExpanded.add(clusterId)
    }
    setExpandedMaps(newExpanded)
  }

  const handleClusterClick = (cluster: Cluster) => {
    router.push(`/engineer-dashboard/cluster/${cluster.key}`)
  }

  const fetchEngineerClusters = async () => {
    if (!user?.email) return

    setLoading(true)
    setError(null)

    try {
      // For now, always use mock data - in production this would fetch from JIRA
      // Generate realistic clusters with proper geographic distribution
      const mockClusters = generateRealisticClusters()
      setClusters(mockClusters)
    } catch (error: any) {
      console.error('❌ Error fetching clusters:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (user?.email) {
      fetchEngineerClusters()
    }
  }, [user?.email])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'under review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'not completed':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'highest':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

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
              <li><span className="text-gray-900 font-medium">Engineer Dashboard</span></li>
            </ol>
          </nav>

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Engineer Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.email}! Here are your assigned clusters and jobs.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Clusters</p>
                  <p className="text-2xl font-semibold text-gray-900">{clusters.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed Jobs</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {clusters.reduce((sum, cluster) => sum + cluster.completedJobs, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">In Progress</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {clusters.filter(c => c.status === 'In Progress').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Issues</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {clusters.filter(c => c.status === 'Not Completed').length}
                  </p>
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
                  <h3 className="text-sm font-medium text-red-800">Error loading clusters</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Clusters List */}
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="animate-spin w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading your clusters...</h3>
              <p className="text-gray-600">Fetching assigned work from JIRA</p>
            </div>
          ) : clusters.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clusters assigned</h3>
              <p className="text-gray-600">You don't have any assigned clusters at the moment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {clusters.map((cluster) => (
                <div key={cluster.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div 
                    className="px-6 py-4 border-b border-gray-200 cursor-pointer"
                    onClick={() => handleClusterClick(cluster)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{cluster.summary}</h3>
                        <p className="text-sm text-gray-600 mt-1">{cluster.key}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(cluster.status)}`}>
                          {cluster.status}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleMap(cluster.id)
                          }}
                          className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 font-medium transition-colors text-sm"
                        >
                          {expandedMaps.has(cluster.id) ? 'Hide Map' : 'Show Map'}
                        </button>
                        <Link
                          href={`/engineer-dashboard/cluster/${cluster.key}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Job Progress</h4>
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${cluster.totalJobs > 0 ? (cluster.completedJobs / cluster.totalJobs) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {cluster.completedJobs}/{cluster.totalJobs}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Location</h4>
                        <p className="text-sm text-gray-600">{cluster.location.address}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Scheduled</h4>
                        <p className="text-sm text-gray-600">
                          {cluster.scheduledDate ? new Date(cluster.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Collapsed Map Section */}
                  {expandedMaps.has(cluster.id) && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Cluster Map</h4>
                      <div className="h-64 rounded-lg overflow-hidden">
                        <EngineerDashboardMap
                          clusters={[cluster]}
                          selectedCluster={null}
                          onClusterClick={() => {}}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
