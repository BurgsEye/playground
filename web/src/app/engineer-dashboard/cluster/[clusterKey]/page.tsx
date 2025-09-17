'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'
import { generateRealisticClusters } from '@/data/airbMockData'

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
    installationType?: string
    externalCPE?: string
    internalCPE?: string
    wifiMesh?: string
    clusterReady?: string
    jobCompleteStatus?: string
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

export default function ClusterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clusterKey = params.clusterKey as string
  
  const [cluster, setCluster] = useState<Cluster | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClusterDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      // For now, use mock data - in production this would fetch from JIRA
      const mockClusters = generateRealisticClusters()
      const foundCluster = mockClusters.find(c => c.key === clusterKey)
      
      if (foundCluster) {
        setCluster(foundCluster)
      } else {
        throw new Error('Cluster not found')
      }
    } catch (error: any) {
      console.error('❌ Error fetching cluster:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (clusterKey) {
      fetchClusterDetails()
    }
  }, [clusterKey])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'under review':
        return 'bg-purple-100 text-purple-800 border-purple-300'
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

  const handleJobClick = (job: Job) => {
    router.push(`/engineer-dashboard/job/${job.key}`)
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="animate-spin w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading cluster details...</h3>
              <p className="text-gray-600">Fetching jobs and equipment information</p>
            </div>
          </main>
        </div>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error loading cluster</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    )
  }

  if (!cluster) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cluster not found</h3>
              <p className="text-gray-600">The requested cluster could not be found.</p>
            </div>
          </main>
        </div>
      </AuthGuard>
    )
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
              <li><Link href="/engineer-dashboard" className="text-blue-600 hover:text-blue-700">Engineer Dashboard</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li><span className="text-gray-900 font-medium">{cluster.key}</span></li>
            </ol>
          </nav>

          {/* Cluster Header */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{cluster.summary}</h1>
                  <p className="text-sm text-gray-600 mt-1">{cluster.key}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(cluster.status)}`}>
                    {cluster.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Job Progress</h3>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${cluster.totalJobs > 0 ? (cluster.completedJobs / cluster.totalJobs) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {cluster.completedJobs}/{cluster.totalJobs}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                  <p className="text-sm text-gray-600">{cluster.location.address}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Scheduled</h3>
                  <p className="text-sm text-gray-600">
                    {cluster.scheduledDate ? new Date(cluster.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Jobs in this Cluster</h2>
              <p className="text-sm text-gray-600 mt-1">Click on a job to view details and update status</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {cluster.jobs.map((job) => (
                <div 
                  key={job.id} 
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleJobClick(job)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-gray-900">{job.summary}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(job.priority)}`}>
                          {job.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{job.key}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>📍 {job.location.address}</span>
                        <span>🏠 {job.airbFields.installationType}</span>
                        <span>📡 {job.airbFields.externalCPE}</span>
                        <span>🔄 {job.airbFields.internalCPE}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
