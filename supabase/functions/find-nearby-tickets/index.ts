// Find tickets within a given radius of a target ticket
// Perfect for clustering JIRA jobs for engineer scheduling

// @ts-ignore - Deno import for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, handleCors } from "../_shared/cors.ts"

interface Ticket {
  id: string
  lat: number
  lng: number
  [key: string]: any // Allow additional ticket properties
}

interface FindNearbyRequest {
  target_ticket: Ticket
  all_tickets: Ticket[]
  radius_km: number
}

// Haversine formula to calculate distance between two points on Earth
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in kilometers
}

console.log("Find Nearby Tickets Function!")

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const { target_ticket, all_tickets, radius_km }: FindNearbyRequest = await req.json()
    
    // Validation
    if (!target_ticket || !target_ticket.lat || !target_ticket.lng) {
      throw new Error("target_ticket must have id, lat, and lng properties")
    }
    
    if (!all_tickets || !Array.isArray(all_tickets)) {
      throw new Error("all_tickets must be an array")
    }
    
    if (!radius_km || radius_km <= 0) {
      throw new Error("radius_km must be a positive number")
    }

    // Find tickets within radius (including the target ticket)
    const nearbyTickets = all_tickets
      .filter(ticket => {
        // Validate ticket has coordinates
        if (!ticket.lat || !ticket.lng) {
          console.warn(`Ticket ${ticket.id} missing coordinates, skipping`)
          return false
        }
        
        // Calculate distance (0 for target ticket itself)
        const distance = ticket.id === target_ticket.id ? 0 : calculateDistance(
          target_ticket.lat, target_ticket.lng,
          ticket.lat, ticket.lng
        )
        
        return distance <= radius_km
      })
      .map(ticket => {
        // Add distance to each nearby ticket (0 for target ticket itself)
        const distance = ticket.id === target_ticket.id ? 0 : calculateDistance(
          target_ticket.lat, target_ticket.lng,
          ticket.lat, ticket.lng
        )
        
        return {
          ...ticket,
          distance_km: Math.round(distance * 100) / 100 // Round to 2 decimal places
        }
      })
      .sort((a, b) => a.distance_km - b.distance_km) // Sort by distance (closest first)

    const response = {
      target_ticket,
      radius_km,
      nearby_tickets: nearbyTickets,
      count: nearbyTickets.length,
      searched_at: new Date().toISOString(),
      // Useful for clustering - potential groups of 3
      suggested_clusters: nearbyTickets.length >= 2 ? [
        {
          cluster_id: `cluster_${target_ticket.id}`,
          tickets: [target_ticket, ...nearbyTickets.slice(0, 2)], // Target + 2 closest
          total_tickets: Math.min(3, nearbyTickets.length + 1),
          max_distance_km: nearbyTickets.length > 0 ? nearbyTickets[Math.min(1, nearbyTickets.length - 1)].distance_km : 0
        }
      ] : []
    }

    return new Response(
      JSON.stringify(response, null, 2),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      },
    )
    
  } catch (error) {
    console.error("Error in find-nearby-tickets:", error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        }, 
        status: 400 
      },
    )
  }
})
