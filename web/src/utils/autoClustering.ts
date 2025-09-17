import { Ticket } from '@/data/mockTickets'

// Haversine formula to calculate distance between two points on Earth
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export interface ClusterResult {
  cluster_id: string
  tickets: Ticket[]
  center_point: { lat: number, lng: number }
  max_distance_km: number
  total_distance_km: number
}

export interface AutoClusteringOptions {
  tickets: Ticket[]
  radius_km: number
  cluster_size?: number // Optional for backward compatibility
  min_cluster_size?: number
  max_cluster_size?: number
  precise_cluster_size?: number // For exactly N jobs
  prioritize_high_priority?: boolean
}

export interface AutoClusteringResult {
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

export function autoClusterTickets(options: AutoClusteringOptions): AutoClusteringResult {
  const startTime = Date.now()
  const {
    tickets,
    radius_km,
    cluster_size,
    min_cluster_size,
    max_cluster_size,
    precise_cluster_size,
    prioritize_high_priority = true
  } = options

  // Determine cluster size parameters
  let minSize: number
  let maxSize: number
  let isPrecise: boolean = false

  if (precise_cluster_size) {
    // Precise clustering: exactly N jobs per cluster
    minSize = precise_cluster_size
    maxSize = precise_cluster_size
    isPrecise = true
  } else if (min_cluster_size && max_cluster_size) {
    // Min/max clustering
    minSize = min_cluster_size
    maxSize = max_cluster_size
  } else if (cluster_size) {
    // Backward compatibility: single cluster size
    minSize = cluster_size
    maxSize = cluster_size
  } else {
    // Default values
    minSize = 2
    maxSize = 5
  }

  const clusters: ClusterResult[] = []
  const usedTickets = new Set<string>()
  let iterations = 0

  // Sort tickets by priority if enabled
  const sortedTickets = [...tickets]
  if (prioritize_high_priority) {
    const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 }
    sortedTickets.sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1
      return bPriority - aPriority
    })
  }

  // Create clusters using greedy approach
  for (const seedTicket of sortedTickets) {
    iterations++
    
    if (usedTickets.has(seedTicket.id)) continue

    // Find nearby tickets within radius
    const nearbyTickets = tickets.filter(ticket => {
      if (usedTickets.has(ticket.id)) return false
      if (ticket.id === seedTicket.id) return true
      
      const distance = haversineDistance(
        seedTicket.lat, seedTicket.lng,
        ticket.lat, ticket.lng
      )
      return distance <= radius_km
    })

    // Check if we have enough tickets for a cluster
    if (nearbyTickets.length >= minSize) {
      // Sort by distance from seed ticket
      nearbyTickets.sort((a, b) => {
        const distA = haversineDistance(seedTicket.lat, seedTicket.lng, a.lat, a.lng)
        const distB = haversineDistance(seedTicket.lat, seedTicket.lng, b.lat, b.lng)
        return distA - distB
      })

      let clusterTickets: Ticket[]

      if (isPrecise) {
        // Precise clustering: take exactly the specified number
        if (nearbyTickets.length >= precise_cluster_size!) {
          clusterTickets = nearbyTickets.slice(0, precise_cluster_size!)
        } else {
          // Not enough tickets for precise clustering, skip this seed
          continue
        }
      } else {
        // Min/max clustering: take between min and max
        const targetSize = Math.min(nearbyTickets.length, maxSize)
        clusterTickets = nearbyTickets.slice(0, targetSize)
        
        // Only create cluster if we meet minimum size requirement
        if (clusterTickets.length < minSize) {
          continue
        }
      }
      
      // Mark tickets as used
      clusterTickets.forEach(ticket => usedTickets.add(ticket.id))

      // Calculate cluster metrics
      const centerLat = clusterTickets.reduce((sum, t) => sum + t.lat, 0) / clusterTickets.length
      const centerLng = clusterTickets.reduce((sum, t) => sum + t.lng, 0) / clusterTickets.length
      
      const distances = clusterTickets.map(ticket => 
        haversineDistance(centerLat, centerLng, ticket.lat, ticket.lng)
      )
      
      const maxDistance = Math.max(...distances)
      const totalDistance = distances.reduce((sum, d) => sum + d, 0)

      clusters.push({
        cluster_id: `auto-cluster-${clusters.length + 1}`,
        tickets: clusterTickets,
        center_point: { lat: centerLat, lng: centerLng },
        max_distance_km: parseFloat(maxDistance.toFixed(2)),
        total_distance_km: parseFloat(totalDistance.toFixed(2))
      })
    }
  }

  const endTime = Date.now()
  const executionTimeMs = endTime - startTime

  const totalTicketsClustered = clusters.reduce((sum, c) => sum + c.tickets.length, 0)
  const clusteringEfficiency = tickets.length > 0 ? (totalTicketsClustered / tickets.length) * 100 : 0

  return {
    clusters,
    unclustered_tickets: tickets.filter(t => !usedTickets.has(t.id)),
    total_clusters: clusters.length,
    total_tickets_clustered: totalTicketsClustered,
    clustering_efficiency: parseFloat(clusteringEfficiency.toFixed(1)),
    algorithm_stats: {
      execution_time_ms: executionTimeMs,
      iterations,
      method: "Greedy Geographic Clustering"
    }
  }
}