export interface Ticket {
  id: string
  title: string
  description: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  assignee?: string
  reporter: string
  created: string
  estimatedHours: number
  lat: number
  lng: number
  address: string
  city: string
  postcode: string
  ticketType: 'Gold' | 'Silver' | 'Bronze'
}

// UK cities with coordinates
const ukCities = [
  { name: 'London', lat: 51.5074, lng: -0.1278, postcode: 'SW1A' },
  { name: 'Manchester', lat: 53.4808, lng: -2.2426, postcode: 'M1' },
  { name: 'Birmingham', lat: 52.4862, lng: -1.8904, postcode: 'B1' },
  { name: 'Leeds', lat: 53.8008, lng: -1.5491, postcode: 'LS1' },
  { name: 'Liverpool', lat: 53.4084, lng: -2.9916, postcode: 'L1' },
  { name: 'Sheffield', lat: 53.3811, lng: -1.4701, postcode: 'S1' },
  { name: 'Bristol', lat: 51.4545, lng: -2.5879, postcode: 'BS1' },
  { name: 'Glasgow', lat: 55.8642, lng: -4.2518, postcode: 'G1' },
  { name: 'Edinburgh', lat: 55.9533, lng: -3.1883, postcode: 'EH1' },
  { name: 'Newcastle', lat: 54.9783, lng: -1.6178, postcode: 'NE1' }
]

// Task templates
const taskTemplates = [
  { title: 'Server maintenance', description: 'Routine server maintenance and updates' },
  { title: 'Network setup', description: 'Install and configure network equipment' },
  { title: 'Hardware install', description: 'Install new hardware components' },
  { title: 'Software deployment', description: 'Deploy software updates and patches' },
  { title: 'Security audit', description: 'Perform security assessment and audit' },
  { title: 'Database backup', description: 'Backup and verify database integrity' }
]

// Generate deterministic mock data
const mockTickets: Ticket[] = []

// Create 50 tickets for testing
for (let i = 1; i <= 50; i++) {
  const cityIndex = (i - 1) % ukCities.length
  const city = ukCities[cityIndex]
  const templateIndex = (i - 1) % taskTemplates.length
  const template = taskTemplates[templateIndex]
  
  // Add some randomness to coordinates
  const latOffset = ((i * 17) % 200 - 100) / 1000
  const lngOffset = ((i * 23) % 200 - 100) / 1000
  
  const priorities: Ticket['priority'][] = ['Critical', 'High', 'Medium', 'Low']
  const priority = priorities[(i - 1) % priorities.length]
  
  const ticketTypes: Ticket['ticketType'][] = ['Gold', 'Silver', 'Bronze']
  const ticketType = ticketTypes[(i - 1) % ticketTypes.length]
  
  mockTickets.push({
    id: `PROJ-${i.toString().padStart(3, '0')}`,
    title: `${template.title} - ${city.name}`,
    description: template.description,
    priority,
    status: 'Open',
    assignee: i % 3 === 0 ? undefined : 'Engineer ' + ((i - 1) % 5 + 1),
    reporter: "System Administrator",
    created: new Date(2024, 0, ((i - 1) % 30) + 1).toISOString(),
    estimatedHours: ((i - 1) % 8) + 1,
    lat: city.lat + latOffset,
    lng: city.lng + lngOffset,
    address: `${((i - 1) % 999) + 1} Business Street`,
    city: city.name,
    postcode: `${city.postcode} ${((i - 1) % 9) + 1}AA`,
    ticketType
  })
}

export default mockTickets
