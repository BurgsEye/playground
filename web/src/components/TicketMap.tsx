'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Ticket } from '@/data/mockTickets'

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

interface ClusterResult {
  cluster_id: string
  tickets: Ticket[]
  center_point: { lat: number, lng: number }
  max_distance_km: number
  total_distance_km: number
}

interface TicketMapProps {
  tickets: Ticket[]
  clusters: ClusterResult[]
  selectedCluster: ClusterResult | null
  onTicketClick?: (ticket: Ticket) => void
}

// Component to handle zoom to fit all functionality
function ZoomToFitButton({ tickets }: { tickets: Ticket[] }) {
  const map = useMap()

  const handleZoomToFit = () => {
    if (tickets.length > 0) {
      const latLngs = tickets.map(t => [t.lat, t.lng] as L.LatLngTuple)
      const bounds = L.latLngBounds(latLngs)
      
      map.flyToBounds(bounds, {
        padding: [20, 20],
        duration: 1.5,
        easeLinearity: 0.25
      })
    }
  }

  return (
    <button
      onClick={handleZoomToFit}
      className="absolute top-4 left-4 bg-white border border-gray-300 rounded-lg shadow-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-all duration-200 z-[1000] flex items-center space-x-2"
      title="Zoom to show all tickets"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7m6 0V4" />
      </svg>
      <span>Fit All</span>
    </button>
  )
}

// Component to handle map updates (zoom, center)
function MapController({ selectedCluster }: { selectedCluster: ClusterResult | null }) {
  const map = useMap()

  useEffect(() => {
    if (selectedCluster && selectedCluster.tickets.length > 0) {
      // Calculate bounds for all tickets in the selected cluster
      const latLngs = selectedCluster.tickets.map(t => [t.lat, t.lng] as L.LatLngTuple)
      const bounds = L.latLngBounds(latLngs)
      
      // Add some padding and fly to the bounds
      map.flyToBounds(bounds, {
        padding: [20, 20],
        duration: 1.5,
        easeLinearity: 0.25
      })
    } else {
      // Default UK view when no cluster is selected
      map.flyTo([54.5, -2.0], 6, {
        duration: 1.5,
        easeLinearity: 0.25
      })
    }
  }, [selectedCluster, map])

  return null
}

export default function TicketMap({ tickets, clusters, selectedCluster, onTicketClick }: TicketMapProps) {
  const ukCenter: [number, number] = [54.5, -2.0]

  const getMarkerColor = (ticket: Ticket) => {
    if (selectedCluster) {
      // If a cluster is selected, highlight its tickets
      const isInSelectedCluster = selectedCluster.tickets.some(t => t.id === ticket.id)
      if (isInSelectedCluster) {
        return 'blue' // Selected cluster tickets
      } else {
        return 'gray' // Other tickets
      }
    } else {
      // Color by cluster when no specific cluster is selected
      const clusterIndex = clusters.findIndex(cluster => 
        cluster.tickets.some(t => t.id === ticket.id)
      )
      
      if (clusterIndex !== -1) {
        const colors = ['blue', 'green', 'red', 'purple', 'orange', 'yellow', 'pink', 'cyan']
        return colors[clusterIndex % colors.length]
      } else {
        return 'gray' // Unclustered tickets
      }
    }
  }

  const getMarkerIcon = (ticket: Ticket) => {
    const color = getMarkerColor(ticket)
    
    return L.divIcon({
      className: `custom-div-icon bg-${color}-500 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 border-white`,
      html: `<div style="width: 24px; height: 24px; line-height: 22px; text-align: center; border-radius: 50%; background-color: ${getColorHex(color)}; color: white; font-size: 10px; font-weight: bold;">${ticket.id.split('-')[1]}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    })
  }

  const getColorHex = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: '#3B82F6',
      green: '#10B981',
      red: '#EF4444',
      purple: '#8B5CF6',
      orange: '#F97316',
      yellow: '#EAB308',
      pink: '#EC4899',
      cyan: '#06B6D4',
      gray: '#6B7280'
    }
    return colorMap[color] || colorMap.gray
  }

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }

  const getTicketTypeColor = (ticketType: Ticket['ticketType']) => {
    switch (ticketType) {
      case 'Gold': return 'bg-yellow-500 text-yellow-900';
      case 'Silver': return 'bg-gray-400 text-gray-900';
      case 'Bronze': return 'bg-orange-600 text-orange-100';
      default: return 'bg-gray-500 text-white';
    }
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

        <MapController selectedCluster={selectedCluster} />
        <ZoomToFitButton tickets={tickets} />

        {/* Show cluster boundary circle if a cluster is selected */}
        {selectedCluster && (
          <Circle
            center={[selectedCluster.center_point.lat, selectedCluster.center_point.lng]}
            radius={selectedCluster.max_distance_km * 1000} // Convert km to meters
            fillColor="blue"
            fillOpacity={0.1}
            color="blue"
            weight={2}
            dashArray="5, 5"
          />
        )}

        {tickets.map((ticket) => (
          <Marker
            key={ticket.id}
            position={[ticket.lat, ticket.lng]}
            icon={getMarkerIcon(ticket)}
            eventHandlers={{
              click: () => onTicketClick?.(ticket)
            }}
          >
            <Popup>
              <div className="font-semibold text-gray-800">{ticket.title}</div>
              <div className="text-sm text-gray-600">{ticket.id}</div>
              <div className="text-xs text-gray-500">{ticket.address}, {ticket.city}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)} text-white`}>
                  {ticket.priority}
                </div>
                <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getTicketTypeColor(ticket.ticketType)}`}>
                  {ticket.ticketType}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Estimated: {ticket.estimatedHours}h
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 text-sm z-[1000] max-w-48">
        <h4 className="font-semibold mb-2">Map Legend</h4>
        {selectedCluster ? (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Selected Cluster</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Other Tickets</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Cluster 1</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Cluster 2</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Cluster 3</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Unclustered</span>
            </div>
          </div>
        )}
        
        {/* Ticket Type Legend */}
        <div className="mt-3 pt-2 border-t">
          <h5 className="font-medium mb-1 text-xs">Ticket Types</h5>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-2 bg-yellow-500 rounded"></div>
              <span className="text-xs">Gold</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-2 bg-gray-400 rounded"></div>
              <span className="text-xs">Silver</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-2 bg-orange-600 rounded"></div>
              <span className="text-xs">Bronze</span>
            </div>
          </div>
        </div>

        {selectedCluster && (
          <div className="mt-2 pt-2 border-t text-xs text-gray-600">
            Cluster: {selectedCluster.cluster_id}
            <br />
            {selectedCluster.tickets.length} tickets
            <br />
            Max spread: {selectedCluster.max_distance_km}km
          </div>
        )}
      </div>
    </div>
  )
}