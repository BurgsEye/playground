// Mock data generator for AIRB installation requests
// Based on real JIRA field data and UI options from screenshots

export interface AirbInstallationRequest {
  id: string;
  key: string;
  summary: string;
  status: string;
  priority: string;
  assignee?: string;
  created: string;
  customFields: {
    installationType: string;
    wifiMeshAddon: string;
    installationAddress: string;
    externalCPE: string;
    internalCPE: string;
    geoData: {
      coordinates: [number, number];
      street: string;
      streetNumber: string;
      city: string;
      stateOrProvince: string;
      postalCode: string;
      country: string;
      displayName: string;
    };
  };
}

// Field options based on JIRA UI screenshots
export const AIRB_FIELD_OPTIONS = {
  installationType: [
    'Bronze',
    'Silver', 
    'Gold',
    'Platinum'
  ],
  externalCPE: [
    'Wave Pico',
    'Wave Nano',
    'Wave LR', 
    'Wave Pro'
  ],
  internalCPE: [
    'UDR7',
    'UXZ'
  ],
  wifiMeshAddon: [
    'None',
    'Domestic (<2 APs)',
    'Commercial (<3 APs)'
  ],
  clusterReady: [
    'Yes',
    'No'
  ],
  jobCompleteStatus: [
    'Not Complete',
    'Under Review',
    'Completed'
  ]
};

// Real addresses in Newport, Wales area for realistic clustering
const NEWPORT_ADDRESSES = [
  {
    coordinates: [51.5756602, -2.9979936] as [number, number],
    street: 'Cape Lookout Walk',
    streetNumber: '19',
    city: 'Newport',
    stateOrProvince: 'Wales',
    postalCode: 'NP20 2SG',
    country: 'United Kingdom',
    displayName: '19, Cape Lookout Walk, Pillgwenlly, Newport, Wales, NP20 2SG, United Kingdom'
  },
  {
    coordinates: [51.5816602, -2.9919936] as [number, number],
    street: 'Commercial Street',
    streetNumber: '42',
    city: 'Newport',
    stateOrProvince: 'Wales', 
    postalCode: 'NP20 1AB',
    country: 'United Kingdom',
    displayName: '42, Commercial Street, Newport, Wales, NP20 1AB, United Kingdom'
  },
  {
    coordinates: [51.5696602, -2.9859936] as [number, number],
    street: 'High Street',
    streetNumber: '15',
    city: 'Newport',
    stateOrProvince: 'Wales',
    postalCode: 'NP20 1XY',
    country: 'United Kingdom', 
    displayName: '15, High Street, Newport, Wales, NP20 1XY, United Kingdom'
  },
  {
    coordinates: [51.5836602, -2.9999936] as [number, number],
    street: 'Victoria Road',
    streetNumber: '8',
    city: 'Newport',
    stateOrProvince: 'Wales',
    postalCode: 'NP20 2CD',
    country: 'United Kingdom',
    displayName: '8, Victoria Road, Newport, Wales, NP20 2CD, United Kingdom'
  },
  {
    coordinates: [51.5776602, -2.9939936] as [number, number],
    street: 'Bridge Street',
    streetNumber: '23',
    city: 'Newport',
    stateOrProvince: 'Wales',
    postalCode: 'NP20 1EF',
    country: 'United Kingdom',
    displayName: '23, Bridge Street, Newport, Wales, NP20 1EF, United Kingdom'
  }
];

// Cardiff area addresses for geographic diversity
const CARDIFF_ADDRESSES = [
  {
    coordinates: [51.481583, -3.179090] as [number, number],
    street: 'Queen Street',
    streetNumber: '100',
    city: 'Cardiff',
    stateOrProvince: 'Wales',
    postalCode: 'CF10 2AT',
    country: 'United Kingdom',
    displayName: '100, Queen Street, Cardiff, Wales, CF10 2AT, United Kingdom'
  },
  {
    coordinates: [51.475583, -3.175090] as [number, number],
    street: 'St Mary Street',
    streetNumber: '55',
    city: 'Cardiff',
    stateOrProvince: 'Wales',
    postalCode: 'CF10 1DX',
    country: 'United Kingdom',
    displayName: '55, St Mary Street, Cardiff, Wales, CF10 1DX, United Kingdom'
  }
];

// Real data from AIRB-13 for reference
export const REAL_AIRB_13_DATA: AirbInstallationRequest = {
  id: '104627',
  key: 'AIRB-13',
  summary: 'AB-3',
  status: 'Not Completed',
  priority: 'Medium',
  assignee: undefined,
  created: '2025-09-12T17:04:07.680+0100',
  customFields: {
    installationType: 'Silver',
    wifiMeshAddon: 'Domestic (<2 APs)',
    installationAddress: '19, Cape Lookout Walk, Pillgwenlly, Newport, Wales, NP20 2SG, United Kingdom',
    externalCPE: 'Wave Nano',
    internalCPE: 'UDR7',
    geoData: {
      coordinates: [51.5756602, -2.9979936],
      street: 'Cape Lookout Walk',
      streetNumber: '19',
      city: 'Newport',
      stateOrProvince: 'Wales',
      postalCode: 'NP20 2SG',
      country: 'United Kingdom',
      displayName: '19, Cape Lookout Walk, Pillgwenlly, Newport, Wales, NP20 2SG, United Kingdom'
    }
  }
};

// Generate random mock data
export function generateMockAirbInstallationRequest(id: number): AirbInstallationRequest {
  const allAddresses = [...NEWPORT_ADDRESSES, ...CARDIFF_ADDRESSES];
  const randomAddress = allAddresses[Math.floor(Math.random() * allAddresses.length)];
  
  const statuses = ['Not Completed', 'Under Review', 'Completed', 'In Progress'];
  const priorities = ['Critical', 'High', 'Medium', 'Low'];
  const engineers = ['tf@westbase.io', 'engineer1@westbase.io', 'engineer2@westbase.io', undefined];
  
  return {
    id: `1046${20 + id}`,
    key: `AIRB-${12 + id}`,
    summary: `AB-${id}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    assignee: engineers[Math.floor(Math.random() * engineers.length)],
    created: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    customFields: {
      installationType: AIRB_FIELD_OPTIONS.installationType[Math.floor(Math.random() * AIRB_FIELD_OPTIONS.installationType.length)],
      wifiMeshAddon: AIRB_FIELD_OPTIONS.wifiMeshAddon[Math.floor(Math.random() * AIRB_FIELD_OPTIONS.wifiMeshAddon.length)],
      installationAddress: randomAddress.displayName,
      externalCPE: AIRB_FIELD_OPTIONS.externalCPE[Math.floor(Math.random() * AIRB_FIELD_OPTIONS.externalCPE.length)],
      internalCPE: AIRB_FIELD_OPTIONS.internalCPE[Math.floor(Math.random() * AIRB_FIELD_OPTIONS.internalCPE.length)],
      geoData: randomAddress
    }
  };
}

// Convert AirbInstallationRequest to Job format for the dashboard
export function convertToJob(request: AirbInstallationRequest) {
  return {
    id: request.id,
    key: request.key,
    summary: request.summary,
    status: request.status,
    priority: request.priority,
    assignee: request.assignee,
    location: {
      latitude: request.customFields.geoData.coordinates[0],
      longitude: request.customFields.geoData.coordinates[1],
      address: request.customFields.installationAddress
    },
    airbFields: {
      installationType: request.customFields.installationType,
      externalCPE: request.customFields.externalCPE,
      internalCPE: request.customFields.internalCPE,
      wifiMesh: request.customFields.wifiMeshAddon,
      clusterReady: AIRB_FIELD_OPTIONS.clusterReady[Math.floor(Math.random() * AIRB_FIELD_OPTIONS.clusterReady.length)],
      jobCompleteStatus: request.status,
      preferredWindow: 'Morning',
      additionalNotes: 'Mock data for demo'
    },
    createdAt: request.created
  };
}

// Generate multiple mock requests
export function generateMockAirbInstallationRequests(count: number): AirbInstallationRequest[] {
  const requests: AirbInstallationRequest[] = [];
  
  // Always include the real AIRB-13 data first
  requests.push(REAL_AIRB_13_DATA);
  
  // Generate additional mock data
  for (let i = 1; i < count; i++) {
    requests.push(generateMockAirbInstallationRequest(i));
  }
  
  return requests;
}

// Generate mock cluster data with installation requests
export function generateMockAirbCluster(id: string, name: string, requests: AirbInstallationRequest[]) {
  const completedCount = requests.filter(r => r.status === 'Completed' || r.status === 'Under Review').length;
  const progress = (completedCount / requests.length) * 100;
  
  // Calculate center point from all requests
  const avgLat = requests.reduce((sum, r) => sum + r.customFields.geoData.coordinates[0], 0) / requests.length;
  const avgLng = requests.reduce((sum, r) => sum + r.customFields.geoData.coordinates[1], 0) / requests.length;
  
  return {
    id: `CLUSTER-${id}`,
    key: `CLUSTER-${id}`,
    summary: name,
    name,
    status: progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Scheduled',
    jobs: requests.map(convertToJob),
    location: {
      latitude: avgLat,
      longitude: avgLng,
      address: `${requests.length} locations`
    },
    totalJobs: requests.length,
    completedJobs: completedCount,
    progress,
    scheduledDate: requests[0]?.created
  };
}
