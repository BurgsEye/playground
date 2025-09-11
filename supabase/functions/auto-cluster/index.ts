// @ts-ignore - Deno import for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface Ticket {
  id: string
  lat: number
  lng: number
  title?: string
  priority?: 'Critical' | 'High' | 'Medium' | 'Low'
  city?: string
  [key: string]: any
}

interface ClusterResult {
  cluster_id: string
  tickets: Ticket[]
  center_point: { lat: number, lng: number }
  max_distance_km: number
  total_distance_km: number
}

interface AutoClusteringOptions {
  tickets: Ticket[]
  radius_km: number
  cluster_size: number
  prioritize_high_priority?: boolean
}

interface AutoClusteringResult {
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

// Haversine formula to calculate distance between two points
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

// Auto-clustering algorithm using greedy approach with geographic optimization
function autoClusterTickets(options: AutoClusteringOptions): AutoClusteringResult {
  const startTime = Date.now()
  const {
    tickets,
    radius_km,
    cluster_size,
    prioritize_high_priority = true
  } = options

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

    // If we have enough tickets for a cluster
    if (nearbyTickets.length >= 2) {
      // Sort by distance from seed ticket
      nearbyTickets.sort((a, b) => {
        const distA = haversineDistance(seedTicket.lat, seedTicket.lng, a.lat, a.lng)
        const distB = haversineDistance(seedTicket.lat, seedTicket.lng, b.lat, b.lng)
        return distA - distB
      })

      // Take up to cluster_size tickets
      const clusterTickets = nearbyTickets.slice(0, cluster_size)
      
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

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { tickets, radius_km, cluster_size, prioritize_high_priority } = await req.json() as AutoClusteringOptions;

    // Input validation
    if (!tickets || !Array.isArray(tickets) || tickets.length === 0 || !radius_km || !cluster_size) {
      return new Response(JSON.stringify({ error: 'Invalid input: tickets, radius_km, and cluster_size are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Validate ticket structure
    for (const ticket of tickets) {
      if (!ticket.id || typeof ticket.lat !== 'number' || typeof ticket.lng !== 'number') {
        return new Response(JSON.stringify({ error: 'Invalid ticket structure: id, lat, lng are required for each ticket.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }
    }

    // Validate parameters
    if (radius_km < 1 || radius_km > 500) {
      return new Response(JSON.stringify({ error: 'Invalid radius_km: must be between 1 and 500.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    if (cluster_size < 2 || cluster_size > 10) {
      return new Response(JSON.stringify({ error: 'Invalid cluster_size: must be between 2 and 10.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Run clustering algorithm
    const result = autoClusterTickets({ tickets, radius_km, cluster_size, prioritize_high_priority });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error in auto-cluster function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});