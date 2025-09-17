'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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
  scheduledDate?: string
}

interface EngineerDashboardMapProps {
  clusters: Cluster[]
  selectedCluster: Cluster | null
  onClusterClick: (cluster: Cluster) => void
}

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Component to handle map updates (zoom, center)
function MapController({ selectedCluster, clusters }: { selectedCluster: Cluster | null, clusters: Cluster[] }) {
  const map = useMap()

  useEffect(() => {
    if (selectedCluster) {
      // Zoom to selected cluster
      map.flyTo([selectedCluster.location.latitude, selectedCluster.location.longitude], 14, {
        duration: 1.5,
        easeLinearity: 0.25
      })
    } else if (clusters.length > 0) {
      // Calculate bounds to fit all clusters
      const bounds = L.latLngBounds(
        clusters.map(cluster => [cluster.location.latitude, cluster.location.longitude] as L.LatLngTuple)
      )
      map.flyToBounds(bounds, {
        padding: [20, 20],
        duration: 1.5,
        easeLinearity: 0.25
      })
    } else {
      // Default UK view
      map.flyTo([54.5, -2.0], 6, {
        duration: 1.5,
        easeLinearity: 0.25
      })
    }
  }, [selectedCluster, clusters, map])

  return null
}

export default function EngineerDashboardMap({ clusters, selectedCluster, onClusterClick }: EngineerDashboardMapProps) {
  const ukCenter: [number, number] = [54.5, -2.0]

  const getClusterColor = (cluster: Cluster) => {
    switch (cluster.status.toLowerCase()) {
      case 'completed':
        return '#10B981' // green
      case 'in progress':
        return '#3B82F6' // blue
      case 'scheduled':
        return '#F59E0B' // yellow
      case 'not completed':
        return '#EF4444' // red
      default:
        return '#6B7280' // gray
    }
  }

  const getClusterIcon = (cluster: Cluster) => {
    const color = getClusterColor(cluster)
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="width: 32px; height: 32px; line-height: 30px; text-align: center; border-radius: 50%; background-color: ${color}; color: white; font-size: 12px; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${cluster.totalJobs}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    })
  }

  if (clusters.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-gray-600 text-sm">No clusters to display</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={ukCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapController selectedCluster={selectedCluster} clusters={clusters} />

        {clusters.map((cluster) => (
          <Marker
            key={cluster.id}
            position={[cluster.location.latitude, cluster.location.longitude]}
            icon={getClusterIcon(cluster)}
            eventHandlers={{
              click: () => onClusterClick(cluster)
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900 text-sm">{cluster.name}</h3>
                <p className="text-xs text-gray-600">{cluster.key}</p>
                <p className="text-xs text-gray-600">{cluster.totalJobs} jobs</p>
                <p className="text-xs text-gray-600">{cluster.completedJobs} completed</p>
                <p className="text-xs text-gray-600">{cluster.location.address}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    cluster.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    cluster.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    cluster.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                    cluster.status === 'Not Completed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {cluster.status}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 text-sm z-[1000] max-w-48">
        <h4 className="font-semibold mb-2">Cluster Status</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs">In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs">Scheduled</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs">Not Completed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
