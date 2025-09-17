'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
  name: string
  status: string
  jobs: Job[]
  location: {
    latitude: number
    longitude: number
    address: string
  }
  totalJobs: number
  completedJobs: number
  progress: number
  scheduledDate: string
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobKey = params.jobKey as string
  
  const [job, setJob] = useState<Job | null>(null)
  const [cluster, setCluster] = useState<Cluster | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  
  // Form states
  const [newStatus, setNewStatus] = useState('')
  const [completionReason, setCompletionReason] = useState('')
  const [completionNotes, setCompletionNotes] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [formAnswers, setFormAnswers] = useState<Record<string, string>>({})

  const fetchJobDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      // For now, use mock data - in production this would fetch from JIRA
      const mockClusters = generateRealisticClusters()
      
      // Find the job across all clusters
      let foundJob: Job | null = null
      let foundCluster: Cluster | null = null
      
      for (const cluster of mockClusters) {
        const job = cluster.jobs.find(j => j.key === jobKey)
        if (job) {
          foundJob = job
          foundCluster = cluster
          break
        }
      }
      
      if (foundJob && foundCluster) {
        setJob(foundJob)
        setCluster(foundCluster)
        setNewStatus(foundJob.status)
      } else {
        throw new Error('Job not found')
      }
    } catch (error: any) {
      console.error('❌ Error fetching job:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (jobKey) {
      fetchJobDetails()
    }
  }, [jobKey])

  const handleStatusUpdate = async () => {
    if (!job || !newStatus) return
    
    setUpdating(true)
    try {
      // In production, this would update JIRA
      console.log('Updating job status:', {
        jobKey: job.key,
        newStatus,
        completionReason,
        completionNotes
      })
      
      // Update local state
      setJob({
        ...job,
        status: newStatus,
        airbFields: {
          ...job.airbFields,
          jobCompleteStatus: newStatus
        }
      })
      
      setShowStatusModal(false)
      setCompletionReason('')
      setCompletionNotes('')
    } catch (error: any) {
      console.error('❌ Error updating status:', error)
      setError(error.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleFileUpload = async () => {
    if (uploadedFiles.length === 0) return
    
    setUpdating(true)
    try {
      // In production, this would upload to JIRA
      console.log('Uploading files:', {
        jobKey: job?.key,
        files: uploadedFiles.map(f => f.name)
      })
      
      setUploadedFiles([])
      setShowUploadModal(false)
    } catch (error: any) {
      console.error('❌ Error uploading files:', error)
      setError(error.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleFormSubmit = async () => {
    if (!job) return
    
    setUpdating(true)
    try {
      // In production, this would submit to JIRA
      console.log('Submitting form:', {
        jobKey: job.key,
        answers: formAnswers
      })
      
      setFormAnswers({})
      setShowFormModal(false)
    } catch (error: any) {
      console.error('❌ Error submitting form:', error)
      setError(error.message)
    } finally {
      setUpdating(false)
    }
  }

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
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading Job Details...</p>
          </div>
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">Error: {error}</p>
            </div>
          </main>
        </div>
      </AuthGuard>
    )
  }

  if (!job || !cluster) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">Job details not available.</p>
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li><Link href="/" className="text-blue-600 hover:text-blue-700">Projects</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li><Link href="/engineer-dashboard" className="text-blue-600 hover:text-blue-700">Engineer Dashboard</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li><Link href={`/engineer-dashboard/cluster/${cluster.key}`} className="text-blue-600 hover:text-blue-700">{cluster.name}</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li><span className="text-gray-900 font-medium">{job.key}</span></li>
            </ol>
          </nav>

          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">{job.key} - {job.summary}</h1>
                <p className="text-gray-600">Job details and completion management</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(job.priority)}`}>
                  {job.priority}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Job Details - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Information */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Job Information</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Installation Details</h3>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm text-gray-600">Installation Type:</dt>
                          <dd className="text-sm font-medium text-gray-900">{job.airbFields.installationType}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-600">External CPE:</dt>
                          <dd className="text-sm font-medium text-gray-900">{job.airbFields.externalCPE}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-600">Internal CPE:</dt>
                          <dd className="text-sm font-medium text-gray-900">{job.airbFields.internalCPE}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-600">Wi-Fi Mesh:</dt>
                          <dd className="text-sm font-medium text-gray-900">{job.airbFields.wifiMesh}</dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Location & Assignment</h3>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm text-gray-600">Address:</dt>
                          <dd className="text-sm font-medium text-gray-900">{job.location.address}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-600">Coordinates:</dt>
                          <dd className="text-sm font-medium text-gray-900">{job.location.latitude}, {job.location.longitude}</dd>
                          <a
                            href={`https://www.google.com/maps?q=${job.location.latitude},${job.location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Open in Google Maps
                          </a>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-600">Assigned Engineer:</dt>
                          <dd className="text-sm font-medium text-gray-900">{job.assignee || 'Unassigned'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-600">Preferred Window:</dt>
                          <dd className="text-sm font-medium text-gray-900">{job.airbFields.preferredWindow || 'Not specified'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  {job.airbFields.additionalNotes && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Notes</h3>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{job.airbFields.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Job Actions</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setShowStatusModal(true)}
                      className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Update Status
                    </button>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Files
                    </button>
                    <button
                      onClick={() => setShowFormModal(true)}
                      className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Complete Form
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cluster Info - Right Side */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Cluster Information</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Cluster Name</h3>
                      <p className="text-sm font-medium text-gray-900">{cluster.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Progress</h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${cluster.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{cluster.progress.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Jobs in Cluster</h3>
                      <p className="text-sm font-medium text-gray-900">{cluster.completedJobs} of {cluster.totalJobs} completed</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Cluster Status</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cluster.status)}`}>
                        {cluster.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link
                      href={`/engineer-dashboard/cluster/${cluster.key}`}
                      className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Cluster
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Update Modal */}
          {showStatusModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Update Job Status</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Completed">Completed</option>
                        <option value="Not Completed">Not Completed</option>
                      </select>
                    </div>
                    {(newStatus === 'Not Completed' || newStatus === 'Under Review') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                        <textarea
                          value={completionReason}
                          onChange={(e) => setCompletionReason(e.target.value)}
                          placeholder="Enter reason for status change..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        value={completionNotes}
                        onChange={(e) => setCompletionNotes(e.target.value)}
                        placeholder="Additional notes..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={updating || !newStatus}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {updating ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Files</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Files</label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => setUploadedFiles(Array.from(e.target.files || []))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        accept="image/*,.pdf,.doc,.docx"
                      />
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {uploadedFiles.map((file, index) => (
                            <li key={index}>• {file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFileUpload}
                      disabled={updating || uploadedFiles.length === 0}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {updating ? 'Uploading...' : 'Upload Files'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Completion Modal */}
          {showFormModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Job Form</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Installation completed successfully?</label>
                      <select
                        value={formAnswers.installationSuccess || ''}
                        onChange={(e) => setFormAnswers({...formAnswers, installationSuccess: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer satisfaction rating</label>
                      <select
                        value={formAnswers.customerSatisfaction || ''}
                        onChange={(e) => setFormAnswers({...formAnswers, customerSatisfaction: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select...</option>
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Average</option>
                        <option value="2">2 - Poor</option>
                        <option value="1">1 - Very Poor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional comments</label>
                      <textarea
                        value={formAnswers.comments || ''}
                        onChange={(e) => setFormAnswers({...formAnswers, comments: e.target.value})}
                        placeholder="Any additional comments..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowFormModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFormSubmit}
                      disabled={updating}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {updating ? 'Submitting...' : 'Submit Form'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
