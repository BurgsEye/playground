'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Ticket } from '@/data/mockTickets'

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

interface ManualCluster {
  id: string
  name: string
  tickets: Ticket[]
  color: string
  created: Date
}

interface ManualClusteringMapProps {
  tickets: Ticket[]
  clusters: ManualCluster[]
  selectedTickets: Set<string>
  centerTicket: Ticket | null
  radius: number
  nearbyTickets: Ticket[]
  onTicketClick: (ticket: Ticket) => void
  onTicketSelect: (ticketId: string, selected: boolean) => void
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
function MapController({ centerTicket }: { centerTicket: Ticket | null }) {
  const map = useMap()

  useEffect(() => {
    if (centerTicket) {
      map.flyTo([centerTicket.lat, centerTicket.lng], 10, {
        duration: 1.5,
        easeLinearity: 0.25
      })
    }
  }, [centerTicket, map])

  return null
}

export default function ManualClusteringMap({
  tickets,
  clusters,
  selectedTickets,
  centerTicket,
  radius,
  nearbyTickets,
  onTicketClick,
  onTicketSelect
}: ManualClusteringMapProps) {
  const ukCenter: [number, number] = [54.5, -2.0]

  const getMarkerIcon = (ticket: Ticket) => {
    let backgroundColor = '#6B7280' // gray-500 default
    let borderColor = '#374151' // gray-700 default
    
    // Check if ticket is selected
    if (selectedTickets.has(ticket.id)) {
      backgroundColor = '#3B82F6' // blue-500
      borderColor = '#1D4ED8' // blue-700
    }
    // Check if ticket is center ticket
    else if (centerTicket && ticket.id === centerTicket.id) {
      backgroundColor = '#EF4444' // red-500
      borderColor = '#DC2626' // red-600
    }
    // Check if ticket is nearby (within radius)
    else if (nearbyTickets.some(t => t.id === ticket.id)) {
      backgroundColor = '#10B981' // green-500
      borderColor = '#059669' // green-600
    }

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 24px; 
          height: 24px; 
          background-color: ${backgroundColor}; 
          border: 2px solid ${borderColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 10px;
          cursor: pointer;
        ">
          ${ticket.id.split('-')[1]}
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    })
  }

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500'
      case 'High': return 'bg-orange-500'
      case 'Medium': return 'bg-yellow-500'
      case 'Low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTicketTypeColor = (ticketType: Ticket['ticketType']) => {
    switch (ticketType) {
      case 'Gold': return 'bg-yellow-500 text-yellow-900'
      case 'Silver': return 'bg-gray-400 text-gray-900'
      case 'Bronze': return 'bg-orange-600 text-orange-100'
      default: return 'bg-gray-500 text-white'
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

        <MapController centerTicket={centerTicket} />
        <ZoomToFitButton tickets={tickets} />

        {/* Show radius circle if center ticket is selected */}
        {centerTicket && (
          <Circle
            center={[centerTicket.lat, centerTicket.lng]}
            radius={radius * 1000} // Convert km to meters
            fillColor="blue"
            fillOpacity={0.1}
            color="blue"
            weight={2}
            dashArray="5, 5"
          />
        )}

        {/* Show tickets */}
        {tickets.map((ticket) => (
          <Marker
            key={ticket.id}
            position={[ticket.lat, ticket.lng]}
            icon={getMarkerIcon(ticket)}
            eventHandlers={{
              click: () => onTicketClick(ticket)
            }}
          >
            <Popup>
              <div className="min-w-[250px]">
                <div className="font-semibold text-gray-800 mb-2">{ticket.title}</div>
                <div className="text-sm text-gray-600 mb-1">{ticket.id}</div>
                <div className="text-xs text-gray-500 mb-2">{ticket.address}, {ticket.city}</div>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)} text-white`}>
                    {ticket.priority}
                  </div>
                  <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getTicketTypeColor(ticket.ticketType)}`}>
                    {ticket.ticketType}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mb-3">
                  Estimated: {ticket.estimatedHours}h
                </div>

                {/* Selection checkbox */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTickets.has(ticket.id)}
                      onChange={(e) => onTicketSelect(ticket.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Select for cluster</span>
                  </label>
                  <button
                    onClick={() => onTicketClick(ticket)}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                  >
                    Set as Center
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Show clustered tickets */}
        {clusters.map((cluster) =>
          cluster.tickets.map((ticket) => (
            <Marker
              key={`clustered-${ticket.id}`}
              position={[ticket.lat, ticket.lng]}
              icon={L.divIcon({
                className: 'custom-marker',
                html: `
                  <div style="
                    width: 24px; 
                    height: 24px; 
                    background-color: ${cluster.color === 'blue' ? '#3B82F6' : 
                                       cluster.color === 'green' ? '#10B981' :
                                       cluster.color === 'red' ? '#EF4444' :
                                       cluster.color === 'purple' ? '#8B5CF6' :
                                       cluster.color === 'orange' ? '#F59E0B' :
                                       cluster.color === 'cyan' ? '#06B6D4' :
                                       cluster.color === 'pink' ? '#EC4899' :
                                       cluster.color === 'teal' ? '#14B8A6' : '#6B7280'}; 
                    border: 2px solid #374151;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 10px;
                    opacity: 0.7;
                  ">
                    ${ticket.id.split('-')[1]}
                  </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12]
              })}
            >
              <Popup>
                <div className="font-semibold text-gray-800">{ticket.title}</div>
                <div className="text-sm text-gray-600">{ticket.id}</div>
                <div className="text-xs text-gray-500">{ticket.address}, {ticket.city}</div>
                <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                  <strong>Cluster:</strong> {cluster.name}
                </div>
              </Popup>
            </Marker>
          ))
        )}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 text-sm z-[1000] max-w-48">
        <h4 className="font-semibold mb-2">Map Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs">Center Ticket</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs">Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs">Nearby</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-xs">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full opacity-70"></div>
            <span className="text-xs">Clustered</span>
          </div>
        </div>
        
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

        {centerTicket && (
          <div className="mt-2 pt-2 border-t text-xs text-gray-600">
            Radius: {radius}km around {centerTicket.id}
          </div>
        )}
      </div>
    </div>
  )
}
