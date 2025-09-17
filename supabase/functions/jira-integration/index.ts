import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface JiraConfig {
  jiraUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  clusteringStatus: string;
  clusterTicketType: string;
}

interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    description?: string;
    priority: {
      name: string;
    };
    status: {
      name: string;
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
    };
    created: string;
    customfield_10840?: {
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

interface ClusteringTicket {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: string;
  assignee?: string;
  createdAt: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    switch (path) {
      case 'test-connection':
        return await handleTestConnection(req);
      case 'tickets':
        return await handleGetTickets(req);
      case 'get-tickets':
        return await handleGetTickets(req);
      case 'create-ticket':
        return await handleCreateTicket(req);
      case 'update-ticket':
        return await handleUpdateTicket(req);
      case 'search-tickets':
        return await handleSearchTickets(req);
      case 'create-cluster':
        return await handleCreateCluster(req);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid endpoint' }), 
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    console.error('JIRA Integration Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleTestConnection(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const config: JiraConfig = await req.json();
  
  try {
    const response = await fetch(`${config.jiraUrl}/rest/api/3/myself`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${config.email}:${config.apiToken}`)}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`JIRA API Error: ${response.status} ${response.statusText}`);
    }

    const user = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          displayName: user.displayName,
          emailAddress: user.emailAddress,
          accountId: user.accountId
        }
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleGetTickets(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const config: JiraConfig = await req.json();
  
  try {
    // Build JQL query to find tickets ready for clustering
    const jql = `project = "${config.projectKey}" AND status = "${config.clusteringStatus}"`;
    const searchUrl = `${config.jiraUrl}/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=100&fields=summary,description,priority,status,assignee,created,customfield_10840`;
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${config.email}:${config.apiToken}`)}`,
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`JIRA API Error: ${response.status} ${response.statusText}`);
    }

    const searchResults = await response.json();
    const tickets: ClusteringTicket[] = [];

    for (const issue of searchResults.issues) {
      const ticket = await transformJiraIssueToTicket(issue);
      if (ticket) {
        tickets.push(ticket);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        tickets,
        total: searchResults.total,
        jql
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleCreateCluster(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const { config, clusterData } = await req.json();
  
  try {
    // Create the Job Cluster ticket
    const clusterTicket = {
      fields: {
        project: {
          key: config.projectKey
        },
        summary: `Job Cluster: ${clusterData.name}`,
        description: `Automatically created cluster containing ${clusterData.ticketIds.length} tickets.\n\nCluster Details:\n- Radius: ${clusterData.radius}km\n- Priority: ${clusterData.priority}\n- Created: ${new Date().toISOString()}`,
        issuetype: {
          name: config.clusterTicketType
        }
      }
    };

    const createResponse = await fetch(`${config.jiraUrl}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.email}:${config.apiToken}`)}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clusterTicket)
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create cluster ticket: ${createResponse.status} ${createResponse.statusText}`);
    }

    const createdCluster = await createResponse.json();
    
    // Link the selected tickets to the cluster
    const linkPromises = clusterData.ticketIds.map(async (ticketId: string) => {
      const linkData = {
        type: {
          name: "Relates" // or "Blocks", "Clones", etc. depending on your JIRA setup
        },
        inwardIssue: {
          key: ticketId
        },
        outwardIssue: {
          key: createdCluster.key
        }
      };

      const linkResponse = await fetch(`${config.jiraUrl}/rest/api/3/issueLink`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${config.email}:${config.apiToken}`)}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(linkData)
      });

      if (!linkResponse.ok) {
        console.warn(`Failed to link ticket ${ticketId} to cluster: ${linkResponse.status}`);
      }

      return linkResponse.ok;
    });

    const linkResults = await Promise.all(linkPromises);
    const successfulLinks = linkResults.filter(Boolean).length;
    
    return new Response(
      JSON.stringify({ 
        success: true,
        clusterTicket: {
          key: createdCluster.key,
          id: createdCluster.id,
          self: createdCluster.self
        },
        linkedTickets: successfulLinks,
        totalTickets: clusterData.ticketIds.length
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function transformJiraIssueToTicket(issue: JiraIssue): Promise<ClusteringTicket | null> {
  try {
    // Extract location from custom field or description
    // This is a placeholder - actual implementation depends on how location is stored
    const locationData = await extractLocationFromIssue(issue);
    
    if (!locationData) {
      console.warn(`No location data found for ticket ${issue.key}`);
      return null; // Skip tickets without location data
    }

    const priority = mapJiraPriorityToClustering(issue.fields.priority.name);
    
    return {
      id: issue.key,
      title: issue.fields.summary,
      description: issue.fields.description || '',
      priority,
      status: issue.fields.status.name,
      assignee: issue.fields.assignee?.displayName,
      createdAt: issue.fields.created,
      location: locationData
    };
  } catch (error) {
    console.error(`Error transforming JIRA issue ${issue.key}:`, error);
    return null;
  }
}

async function extractLocationFromIssue(issue: JiraIssue): Promise<{ latitude: number; longitude: number; address: string } | null> {
  // Extract location from customfield_10840 which contains a JSON object with coordinates
  const locationField = issue.fields.customfield_10840;
  
  if (locationField && locationField.coordinates && Array.isArray(locationField.coordinates) && locationField.coordinates.length >= 2) {
    const [latitude, longitude] = locationField.coordinates;
    
    if (!isNaN(latitude) && !isNaN(longitude)) {
      return {
        latitude: latitude,
        longitude: longitude,
        address: locationField.displayName || `${locationField.streetNumber} ${locationField.street}, ${locationField.city}, ${locationField.country}`
      };
    }
  }
  
  // If no valid location data found, return null to skip this ticket
  console.warn(`No valid location data found for ticket ${issue.key} in customfield_10840`);
  return null;
}

function mapJiraPriorityToClustering(jiraPriority: string): 'Critical' | 'High' | 'Medium' | 'Low' {
  const priority = jiraPriority.toLowerCase();
  
  if (priority.includes('critical') || priority.includes('highest')) {
    return 'Critical';
  } else if (priority.includes('high')) {
    return 'High';
  } else if (priority.includes('low') || priority.includes('lowest')) {
    return 'Low';
  } else {
    return 'Medium';
  }
}

// Create a new JIRA ticket
async function handleCreateTicket(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const { config, ticket } = await req.json();
  
  try {
    const createUrl = `${config.jiraUrl}/rest/api/3/issue`;
    
    const response = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.email}:${config.apiToken}`)}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          project: { key: config.projectKey },
          summary: ticket.summary,
          description: ticket.description || '',
          issuetype: { name: ticket.issueType || 'Task' },
          priority: { name: ticket.priority || 'Medium' },
          assignee: ticket.assignee ? { accountId: ticket.assignee } : undefined,
          labels: ticket.labels || [],
          ...ticket.customFields
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`JIRA API Error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        ticket: {
          key: result.key,
          id: result.id,
          self: result.self
        }
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Update an existing JIRA ticket
async function handleUpdateTicket(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const { config, ticketKey, updates } = await req.json();
  
  try {
    const updateUrl = `${config.jiraUrl}/rest/api/3/issue/${ticketKey}`;
    
    const response = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${btoa(`${config.email}:${config.apiToken}`)}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          summary: updates.summary,
          description: updates.description,
          priority: updates.priority ? { name: updates.priority } : undefined,
          assignee: updates.assignee ? { accountId: updates.assignee } : undefined,
          labels: updates.labels,
          ...updates.customFields
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`JIRA API Error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Ticket updated successfully'
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Search tickets with custom JQL
async function handleSearchTickets(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const { config, jql, fields, maxResults = 50 } = await req.json();
  
  try {
    const searchUrl = `${config.jiraUrl}/rest/api/3/search`;
    
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.email}:${config.apiToken}`)}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jql: jql,
        fields: fields || ['key', 'summary', 'status', 'priority', 'assignee', 'created'],
        maxResults: maxResults,
        startAt: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`JIRA API Error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        tickets: result.issues,
        total: result.total,
        maxResults: result.maxResults
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}
