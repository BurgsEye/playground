'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'
import { generateMockAirbInstallationRequests, REAL_AIRB_13_DATA, AIRB_FIELD_OPTIONS } from '@/data/airbMockData'

export default function AirbMockTestPage() {
  const [mockData, setMockData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Generate mock data
    const requests = generateMockAirbInstallationRequests(5)
    setMockData(requests)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading mock data...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">AIRB Mock Data Test</h1>
            <p className="text-gray-600">Testing mock data generation based on real JIRA field options</p>
          </div>

          {/* Real AIRB-13 Data */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Real AIRB-13 Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Key:</strong> {REAL_AIRB_13_DATA.key}</p>
                <p><strong>Summary:</strong> {REAL_AIRB_13_DATA.summary}</p>
                <p><strong>Status:</strong> {REAL_AIRB_13_DATA.status}</p>
                <p><strong>Priority:</strong> {REAL_AIRB_13_DATA.priority}</p>
              </div>
              <div>
                <p><strong>Installation Type:</strong> {REAL_AIRB_13_DATA.customFields.installationType}</p>
                <p><strong>External CPE:</strong> {REAL_AIRB_13_DATA.customFields.externalCPE}</p>
                <p><strong>Internal CPE:</strong> {REAL_AIRB_13_DATA.customFields.internalCPE}</p>
                <p><strong>Wi-Fi Mesh:</strong> {REAL_AIRB_13_DATA.customFields.wifiMeshAddon}</p>
              </div>
            </div>
            <div className="mt-4">
              <p><strong>Address:</strong> {REAL_AIRB_13_DATA.customFields.installationAddress}</p>
              <p><strong>Coordinates:</strong> {REAL_AIRB_13_DATA.customFields.geoData.coordinates.join(', ')}</p>
            </div>
          </div>

          {/* Field Options */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Available Field Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Installation Type</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {AIRB_FIELD_OPTIONS.installationType.map(option => (
                    <li key={option}>• {option}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">External CPE</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {AIRB_FIELD_OPTIONS.externalCPE.map(option => (
                    <li key={option}>• {option}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Internal CPE</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {AIRB_FIELD_OPTIONS.internalCPE.map(option => (
                    <li key={option}>• {option}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Wi-Fi Mesh Add-on</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {AIRB_FIELD_OPTIONS.wifiMeshAddon.map(option => (
                    <li key={option}>• {option}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Generated Mock Data */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Generated Mock Data (5 samples)</h2>
            <div className="space-y-4">
              {mockData.map((request, index) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{request.key} - {request.summary}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      request.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Priority:</strong> {request.priority}</p>
                      <p><strong>Assignee:</strong> {request.assignee || 'Unassigned'}</p>
                      <p><strong>Installation Type:</strong> {request.customFields.installationType}</p>
                      <p><strong>External CPE:</strong> {request.customFields.externalCPE}</p>
                    </div>
                    <div>
                      <p><strong>Internal CPE:</strong> {request.customFields.internalCPE}</p>
                      <p><strong>Wi-Fi Mesh:</strong> {request.customFields.wifiMeshAddon}</p>
                      <p><strong>Address:</strong> {request.customFields.installationAddress}</p>
                      <p><strong>Coordinates:</strong> {request.customFields.geoData.coordinates.join(', ')}</p>
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
