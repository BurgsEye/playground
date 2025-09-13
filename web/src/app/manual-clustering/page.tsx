'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { supabase } from '@/utils/supabase'
import mockTickets, { Ticket } from '@/data/mockTickets'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'

// Dynamic import for the map component to prevent SSR issues
const SimpleMap = dynamic(() => import('@/components/SimpleMap'), {
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

interface ManualCluster {
  id: string
  name: string
  tickets: Ticket[]
  color: string
  created: Date
}

export default function ManualClusteringPage() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [nearbyTickets, setNearbyTickets] = useState<Ticket[]>([])
  const [selectedNearbyTickets, setSelectedNearbyTickets] = useState<Set<string>>(new Set())
  const [clusters, setClusters] = useState<ManualCluster[]>([])
  const [radius, setRadius] = useState(20)
  const [clusterName, setClusterName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Available colors for clusters
  const clusterColors = ['blue', 'green', 'red', 'purple', 'orange', 'cyan', 'pink', 'teal']

  // Fetch nearby tickets when selected ticket or radius changes
  useEffect(() => {
    if (selectedTicket) {
      fetchNearbyTickets()
    } else {
      setNearbyTickets([])
      setSelectedNearbyTickets(new Set())
    }
  }, [selectedTicket, radius])

  const fetchNearbyTickets = async () => {
    if (!selectedTicket) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.functions.invoke('find-nearby-tickets', {
        body: {
          target_ticket: selectedTicket,
          radius_km: radius,
          all_tickets: getAvailableTickets()
        }
      })

      if (error) throw error

      setNearbyTickets(data.nearby_tickets || [])
    } catch (err) {
      console.error('Error fetching nearby tickets:', err)
      setError('Failed to fetch nearby tickets')
      // Fallback to client-side calculation
      fallbackNearbyCalculation()
    } finally {
      setIsLoading(false)
    }
  }

  const fallbackNearbyCalculation = () => {
    if (!selectedTicket) return

    const nearby = getAvailableTickets().filter(ticket => {
      if (ticket.id === selectedTicket.id) return true
      const distance = haversineDistance(
        selectedTicket.lat, selectedTicket.lng,
        ticket.lat, ticket.lng
      )
      return distance <= radius
    })
    setNearbyTickets(nearby)
  }

  // Haversine distance calculation
  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setSelectedNearbyTickets(new Set()) // Clear previous selections
  }

  const handleNearbyTicketToggle = (ticketId: string, checked: boolean) => {
    const newSelection = new Set(selectedNearbyTickets)
    if (checked) {
      newSelection.add(ticketId)
    } else {
      newSelection.delete(ticketId)
    }
    setSelectedNearbyTickets(newSelection)
  }

  const handleSelectAllNearby = () => {
    const allNearbyIds = new Set(nearbyTickets.map(t => t.id))
    setSelectedNearbyTickets(allNearbyIds)
  }

  const handleDeselectAllNearby = () => {
    setSelectedNearbyTickets(new Set())
  }

  const createCluster = () => {
    if (selectedNearbyTickets.size === 0) return

    const selectedTicketObjects = nearbyTickets.filter(t => selectedNearbyTickets.has(t.id))
    const colorIndex = clusters.length % clusterColors.length
    const color = clusterColors[colorIndex]
    
    const newCluster: ManualCluster = {
      id: `manual-cluster-${clusters.length + 1}`,
      name: clusterName || `Cluster ${clusters.length + 1}`,
      tickets: selectedTicketObjects,
      color,
      created: new Date()
    }

    setClusters([...clusters, newCluster])
    setSelectedNearbyTickets(new Set())
    setClusterName('')
    
    // Clear selected ticket to refresh available tickets
    setSelectedTicket(null)
  }

  const deleteCluster = (clusterId: string) => {
    setClusters(clusters.filter(c => c.id !== clusterId))
  }

  const isTicketClustered = (ticketId: string): boolean => {
    return clusters.some(cluster => cluster.tickets.some(t => t.id === ticketId))
  }

  const getAvailableTickets = () => {
    const clusteredTicketIds = new Set(
      clusters.flatMap(cluster => cluster.tickets.map(t => t.id))
    )
    return mockTickets.filter(ticket => !clusteredTicketIds.has(ticket.id))
  }

  const getTicketTypeColor = (ticketType: Ticket['ticketType']) => {
    switch (ticketType) {
      case 'Gold': return 'bg-yellow-100 text-yellow-800 border border-yellow-300'
      case 'Silver': return 'bg-gray-100 text-gray-800 border border-gray-300'
      case 'Bronze': return 'bg-orange-100 text-orange-800 border border-orange-300'
      default: return 'bg-gray-100 text-gray-700 border border-gray-300'
    }
  }

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getClusterColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500'
      case 'green': return 'bg-green-500'
      case 'red': return 'bg-red-500'
      case 'purple': return 'bg-purple-500'
      case 'orange': return 'bg-orange-500'
      case 'cyan': return 'bg-cyan-500'
      case 'pink': return 'bg-pink-500'
      case 'teal': return 'bg-teal-500'
      default: return 'bg-gray-500'
    }
  }

  const availableTickets = getAvailableTickets()

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
            <li><span className="text-gray-900 font-medium">Manual Clustering</span></li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Manual Clustering</h1>
          <p className="text-gray-600">Select a ticket from the list to find nearby tickets and create clusters</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Ticket List */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Available Tickets ({availableTickets.length})</h2>
              <p className="text-sm text-gray-600 mt-1">Click a ticket to find nearby tickets</p>
            </div>
            <div className="p-6">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleTicketSelect(ticket)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{ticket.id}</div>
                      <div className="flex space-x-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getTicketTypeColor(ticket.ticketType)}`}>
                          {ticket.ticketType}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{ticket.title}</div>
                    <div className="text-xs text-gray-500">{ticket.city} • {ticket.estimatedHours}h</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Map View</h2>
                  {selectedTicket && (
                    <div className="flex items-center space-x-4">
                      <label className="text-sm text-gray-600">
                        Radius: {radius}km
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={radius}
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        className="w-24"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="h-96">
                  <SimpleMap
                    tickets={availableTickets}
                    selectedTicket={selectedTicket}
                    nearbyTickets={nearbyTickets}
                    radius={radius}
                  />
                </div>
              </div>
            </div>

            {/* Nearby Tickets */}
            {selectedTicket && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">
                      Nearby Tickets ({nearbyTickets.length})
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSelectAllNearby}
                        disabled={nearbyTickets.length === 0}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 disabled:opacity-50"
                      >
                        Select All
                      </button>
                      <button
                        onClick={handleDeselectAllNearby}
                        disabled={selectedNearbyTickets.size === 0}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 disabled:opacity-50"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                  {selectedTicket && (
                    <p className="text-sm text-gray-600 mt-1">
                      Within {radius}km of {selectedTicket.id} ({selectedTicket.city})
                    </p>
                  )}
                </div>
                <div className="p-6">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Finding nearby tickets...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-600">
                      <p>{error}</p>
                    </div>
                  ) : nearbyTickets.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {nearbyTickets.map((ticket) => (
                        <label
                          key={ticket.id}
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedNearbyTickets.has(ticket.id)}
                            onChange={(e) => handleNearbyTicketToggle(ticket.id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium text-gray-900">{ticket.id}</div>
                              <div className="flex space-x-1">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                  {ticket.priority}
                                </span>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getTicketTypeColor(ticket.ticketType)}`}>
                                  {ticket.ticketType}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">{ticket.title}</div>
                            <div className="text-xs text-gray-500">{ticket.city} • {ticket.estimatedHours}h</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No nearby tickets found within {radius}km
                    </div>
                  )}

                  {/* Create Cluster */}
                  {selectedNearbyTickets.size > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cluster Name (Optional)
                          </label>
                          <input
                            type="text"
                            value={clusterName}
                            onChange={(e) => setClusterName(e.target.value)}
                            placeholder={`Cluster ${clusters.length + 1}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Selected: {selectedNearbyTickets.size} tickets
                          </div>
                          <button
                            onClick={createCluster}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
                          >
                            Add to Cluster
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Created Clusters */}
        {clusters.length > 0 && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Created Clusters ({clusters.length})</h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4">
                {clusters.map((cluster) => (
                  <div key={cluster.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 ${getClusterColor(cluster.color)} rounded-full`}></div>
                        <h3 className="font-semibold text-gray-900">{cluster.name}</h3>
                        <span className="text-sm text-gray-500">({cluster.tickets.length} tickets)</span>
                      </div>
                      <button
                        onClick={() => deleteCluster(cluster.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cluster.tickets.map((ticket) => (
                        <span
                          key={ticket.id}
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTicketTypeColor(ticket.ticketType)}`}
                          title={`${ticket.ticketType} ticket: ${ticket.title}`}
                        >
                          {ticket.id}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {cluster.created.toLocaleDateString()} at {cluster.created.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </AuthGuard>
  )
}