'use client'

import { useEffect, useRef, useState } from 'react'

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

export default function EngineerDashboardMap({ clusters, selectedCluster, onClusterClick }: EngineerDashboardMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (!mapRef.current || clusters.length === 0) return

    // Add a small delay to ensure the DOM element is fully rendered
    const timer = setTimeout(() => {
      // Load Google Maps script if not already loaded
      if (!window.google) {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey) {
          console.warn('Google Maps API key not found. Map will not be displayed.')
          setMapError(true)
          return
        }
        
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = initializeMap
        script.onerror = () => {
          console.error('Failed to load Google Maps script')
          setMapError(true)
        }
        document.head.appendChild(script)
      } else {
        initializeMap()
      }
    }, 100)

    return () => clearTimeout(timer)

    function initializeMap() {
      if (!mapRef.current || !window.google || !mapRef.current.offsetParent) return

      // Calculate bounds to fit all clusters
      const bounds = new window.google.maps.LatLngBounds()
      clusters.forEach(cluster => {
        bounds.extend(new window.google.maps.LatLng(cluster.location.latitude, cluster.location.longitude))
      })

      // Create map
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: bounds.getCenter(),
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      // Fit map to bounds
      mapInstanceRef.current.fitBounds(bounds)

      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []

      // Add markers for each cluster
      clusters.forEach((cluster, index) => {
        const marker = new window.google.maps.Marker({
          position: { lat: cluster.location.latitude, lng: cluster.location.longitude },
          map: mapInstanceRef.current,
          title: cluster.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: getClusterColor(cluster),
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        })

        // Add click listener
        marker.addListener('click', () => {
          onClusterClick(cluster)
        })

        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold text-gray-900">${cluster.name}</h3>
              <p class="text-sm text-gray-600">${cluster.key}</p>
              <p class="text-sm text-gray-600">${cluster.totalJobs} jobs</p>
              <p class="text-sm text-gray-600">${cluster.completedJobs} completed</p>
              <p class="text-sm text-gray-600">${cluster.location.address}</p>
            </div>
          `
        })

        // Add hover listeners
        marker.addListener('mouseover', () => {
          infoWindow.open(mapInstanceRef.current, marker)
        })

        marker.addListener('mouseout', () => {
          infoWindow.close()
        })

        markersRef.current.push(marker)
      })

      // Highlight selected cluster
      if (selectedCluster) {
        const selectedMarker = markersRef.current.find((_, index) => clusters[index].id === selectedCluster.id)
        if (selectedMarker) {
          selectedMarker.setIcon({
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 16,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
          })
        }
      }
    }

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => marker.setMap(null))
    }
  }, [clusters, selectedCluster, onClusterClick])

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

  if (mapError) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-gray-600 text-sm">Map unavailable</p>
          <p className="text-gray-500 text-xs mt-1">Google Maps API key required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  )
}
