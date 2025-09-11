# Auto-Cluster Edge Function

## Overview

The `auto-cluster` Edge Function implements an intelligent geographic clustering algorithm for JIRA tickets. It automatically groups tickets based on their geographic proximity, priority levels, and configurable constraints to optimize engineer assignments and minimize travel time.

## What It Does

The function takes a list of tickets with geographic coordinates and automatically creates optimal clusters for engineer assignments. It uses a **greedy algorithm with priority-based seeding** to:

1. **Prioritize high-importance tickets** as cluster seeds
2. **Find nearby tickets** within a specified radius
3. **Group tickets** to minimize travel distance
4. **Respect cluster size limits** to prevent engineer overload
5. **Avoid overlapping assignments** between clusters

## Algorithm Details

### Strategy
1. **Priority-based seeding**: Start with Critical/High priority tickets as cluster centers
2. **Radius-based search**: Find all tickets within the specified radius of each seed
3. **Distance optimization**: Select closest tickets first to minimize travel
4. **Constraint enforcement**: Respect maximum cluster size limits
5. **Overlap prevention**: Ensure each ticket belongs to only one cluster

### Distance Calculation
Uses the **Haversine formula** to calculate accurate distances between geographic coordinates:
```
distance = 2 * R * arcsin(√(sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)))
```
Where R = 6371 km (Earth's radius)

## API Endpoint

```
POST /functions/v1/auto-cluster
```

## Input Format

```json
{
  "tickets": [
    {
      "id": "PROJ-001",
      "title": "Server maintenance - London",
      "lat": 51.5074,
      "lng": -0.1278,
      "priority": "High",
      "description": "...",
      "city": "London"
    }
  ],
  "radius_km": 20,
  "cluster_size": 3,
  "prioritize_high_priority": true
}
```

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `tickets` | Array | List of tickets with geographic coordinates |
| `radius_km` | Number | Search radius in kilometers (1-500) |
| `cluster_size` | Number | Maximum tickets per cluster (2-10) |
| `prioritize_high_priority` | Boolean | Whether to prioritize Critical/High tickets |

### Ticket Object Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | ✅ | Unique ticket identifier |
| `lat` | Number | ✅ | Latitude coordinate |
| `lng` | Number | ✅ | Longitude coordinate |
| `title` | String | ❌ | Ticket title/description |
| `priority` | String | ❌ | 'Critical', 'High', 'Medium', 'Low' |
| `city` | String | ❌ | City name for reference |

## Output Format

```json
{
  "success": true,
  "clusters": [
    {
      "cluster_id": "auto-cluster-1",
      "tickets": [
        {
          "id": "PROJ-001",
          "title": "Server maintenance - London",
          "lat": 51.5074,
          "lng": -0.1278,
          "priority": "High"
        },
        {
          "id": "PROJ-002", 
          "title": "Network setup - Westminster",
          "lat": 51.4994,
          "lng": -0.1245,
          "priority": "Medium"
        }
      ],
      "center_point": {
        "lat": 51.5034,
        "lng": -0.12615
      },
      "max_distance_km": 1.2,
      "total_distance_km": 2.4
    }
  ],
  "unclustered_tickets": [
    {
      "id": "PROJ-010",
      "title": "Isolated ticket - Edinburgh",
      "lat": 55.9533,
      "lng": -3.1883,
      "priority": "Low"
    }
  ],
  "total_clusters": 1,
  "total_tickets_clustered": 2,
  "clustering_efficiency": 66.7,
  "algorithm_stats": {
    "execution_time_ms": 15,
    "iterations": 3,
    "method": "greedy-priority-distance"
  },
  "processed_at": "2024-01-15T10:30:00.000Z"
}
```

### Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | Boolean | Whether clustering succeeded |
| `clusters` | Array | Generated ticket clusters |
| `unclustered_tickets` | Array | Tickets that couldn't be clustered |
| `total_clusters` | Number | Number of clusters created |
| `total_tickets_clustered` | Number | Count of tickets in clusters |
| `clustering_efficiency` | Number | Percentage of tickets clustered |
| `algorithm_stats` | Object | Performance and algorithm metrics |
| `processed_at` | String | ISO timestamp of processing |

### Cluster Object

| Field | Type | Description |
|-------|------|-------------|
| `cluster_id` | String | Unique cluster identifier |
| `tickets` | Array | Tickets in this cluster |
| `center_point` | Object | Geographic center (centroid) of cluster |
| `max_distance_km` | Number | Furthest ticket from center |
| `total_distance_km` | Number | Sum of distances from center |

## Worked Example

### Input: London Area Tickets

```json
{
  "tickets": [
    {
      "id": "PROJ-001",
      "title": "Server maintenance - London",
      "lat": 51.5074,
      "lng": -0.1278,
      "priority": "Critical",
      "city": "London"
    },
    {
      "id": "PROJ-002",
      "title": "Network setup - Westminster", 
      "lat": 51.4994,
      "lng": -0.1245,
      "priority": "High",
      "city": "London"
    },
    {
      "id": "PROJ-003",
      "title": "Hardware install - Canary Wharf",
      "lat": 51.5045,
      "lng": -0.0195,
      "priority": "Medium", 
      "city": "London"
    },
    {
      "id": "PROJ-004",
      "title": "Backup check - Manchester",
      "lat": 53.4808,
      "lng": -2.2426,
      "priority": "Low",
      "city": "Manchester"
    }
  ],
  "radius_km": 15,
  "cluster_size": 3,
  "prioritize_high_priority": true
}
```

### Step-by-Step Processing

1. **Priority Sorting**: 
   - PROJ-001 (Critical) → seed candidate
   - PROJ-002 (High) → seed candidate  
   - PROJ-003 (Medium) → potential cluster member
   - PROJ-004 (Low) → potential cluster member

2. **Cluster 1 - Seed: PROJ-001 (Critical)**
   - Search within 15km of London (51.5074, -0.1278)
   - Found: PROJ-002 (0.9km away), PROJ-003 (8.2km away)
   - Manchester ticket (PROJ-004) is 262km away - outside radius
   - Cluster: [PROJ-001, PROJ-002, PROJ-003] (3 tickets, max size reached)

3. **Remaining tickets**: PROJ-004 (Manchester)
   - No nearby tickets within 15km
   - Remains unclustered

### Expected Output

```json
{
  "success": true,
  "clusters": [
    {
      "cluster_id": "auto-cluster-1",
      "tickets": [
        {
          "id": "PROJ-001",
          "title": "Server maintenance - London",
          "lat": 51.5074,
          "lng": -0.1278,
          "priority": "Critical",
          "city": "London"
        },
        {
          "id": "PROJ-002",
          "title": "Network setup - Westminster",
          "lat": 51.4994,
          "lng": -0.1245,
          "priority": "High",
          "city": "London"
        },
        {
          "id": "PROJ-003",
          "title": "Hardware install - Canary Wharf",
          "lat": 51.5045,
          "lng": -0.0195,
          "priority": "Medium",
          "city": "London"
        }
      ],
      "center_point": {
        "lat": 51.5038,
        "lng": -0.0906
      },
      "max_distance_km": 8.2,
      "total_distance_km": 9.1
    }
  ],
  "unclustered_tickets": [
    {
      "id": "PROJ-004",
      "title": "Backup check - Manchester",
      "lat": 53.4808,
      "lng": -2.2426,
      "priority": "Low",
      "city": "Manchester"
    }
  ],
  "total_clusters": 1,
  "total_tickets_clustered": 3,
  "clustering_efficiency": 75.0,
  "algorithm_stats": {
    "execution_time_ms": 8,
    "iterations": 4,
    "method": "greedy-priority-distance"
  },
  "processed_at": "2024-01-15T10:30:00.000Z"
}
```

## Error Handling

### Validation Errors (400)

```json
{
  "error": "Invalid request: tickets array required"
}
```

```json
{
  "error": "Invalid ticket structure: id, lat, lng required"
}
```

### Server Errors (500)

```json
{
  "error": "Internal server error during clustering",
  "details": "Specific error message"
}
```

## Performance Characteristics

- **Time Complexity**: O(n²) where n = number of tickets
- **Space Complexity**: O(n) for storing clusters
- **Typical Performance**: 
  - 100 tickets: ~10-20ms
  - 250 tickets: ~25-50ms
  - 1000 tickets: ~200-500ms

## Usage Tips

### Optimal Parameters

- **Small areas** (cities): radius 5-20km, cluster size 2-4
- **Regional coverage**: radius 50-100km, cluster size 3-6  
- **National coverage**: radius 100-200km, cluster size 4-8

### Best Practices

1. **Filter tickets by region** before clustering for better results
2. **Use priority weighting** for critical infrastructure tickets
3. **Adjust radius** based on transport infrastructure (urban vs rural)
4. **Consider engineer capacity** when setting cluster size

### Common Use Cases

- **Daily engineer assignments** (small radius, small clusters)
- **Weekly route planning** (medium radius, medium clusters)
- **Emergency response clustering** (large radius, priority-focused)
- **Resource optimization** (balanced radius and cluster size)

## Testing the Function

### Using curl

```bash
curl -X POST http://127.0.0.1:55321/functions/v1/auto-cluster \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tickets": [
      {"id": "TEST-001", "lat": 51.5074, "lng": -0.1278, "priority": "High"},
      {"id": "TEST-002", "lat": 51.4994, "lng": -0.1245, "priority": "Medium"}
    ],
    "radius_km": 10,
    "cluster_size": 3,
    "prioritize_high_priority": true
  }'
```

### Using Supabase Client

```javascript
const { data, error } = await supabase.functions.invoke('auto-cluster', {
  body: {
    tickets: tickets,
    radius_km: 20,
    cluster_size: 3,
    prioritize_high_priority: true
  }
})
```

## Integration Notes

The web application automatically falls back to client-side processing if the Edge Function is unavailable, ensuring reliability while providing the performance benefits of server-side clustering when possible.
