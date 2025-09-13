-- Enhanced JIRA Configuration Schema
-- Phase 1: Foundation - Database Schema Updates

-- Drop existing jira_configs table and recreate with enhanced schema
DROP TABLE IF EXISTS jira_configs CASCADE;

-- Create enhanced jira_configs table
CREATE TABLE jira_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Instance configuration
  instance_url TEXT NOT NULL,
  instance_name TEXT,
  
  -- Authentication
  auth_type TEXT NOT NULL CHECK (auth_type IN ('oauth', 'api_token')),
  encrypted_credentials JSONB NOT NULL,
  
  -- OAuth specific
  oauth_client_id TEXT,
  oauth_redirect_uri TEXT,
  
  -- API Token specific
  api_email TEXT,
  
  -- Project configuration
  project_key TEXT NOT NULL,
  clustering_status TEXT DEFAULT 'Ready For Clustering',
  cluster_ticket_type TEXT DEFAULT 'Job Cluster',
  
  -- Sync configuration
  sync_enabled BOOLEAN DEFAULT true,
  sync_interval_minutes INTEGER DEFAULT 15,
  webhook_enabled BOOLEAN DEFAULT false,
  webhook_secret TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, instance_url, project_key)
);

-- Create jira_tickets_cache table
CREATE TABLE jira_tickets_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  jira_config_id UUID REFERENCES jira_configs(id) ON DELETE CASCADE,
  
  -- JIRA ticket data
  jira_ticket_id TEXT NOT NULL,
  jira_key TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT,
  assignee TEXT,
  issue_type TEXT,
  
  -- Geographic data
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  city TEXT,
  postcode TEXT,
  
  -- Clustering data
  cluster_id UUID,
  cluster_priority INTEGER,
  
  -- Sync metadata
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_version INTEGER DEFAULT 1,
  
  UNIQUE(user_id, jira_ticket_id)
);

-- Create jira_clusters table
CREATE TABLE jira_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  jira_config_id UUID REFERENCES jira_configs(id) ON DELETE CASCADE,
  
  -- Cluster metadata
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active',
  
  -- JIRA integration
  jira_ticket_id TEXT,
  jira_key TEXT,
  
  -- Geographic data
  center_latitude DECIMAL(10, 8),
  center_longitude DECIMAL(11, 8),
  radius_km DECIMAL(8, 2),
  
  -- Clustering parameters
  max_tickets INTEGER DEFAULT 10,
  priority_weight DECIMAL(3, 2) DEFAULT 1.0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jira_cluster_tickets junction table
CREATE TABLE jira_cluster_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id UUID REFERENCES jira_clusters(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES jira_tickets_cache(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(cluster_id, ticket_id)
);

-- Create indexes for performance
CREATE INDEX idx_jira_configs_user_id ON jira_configs(user_id);
CREATE INDEX idx_jira_configs_instance_url ON jira_configs(instance_url);
CREATE INDEX idx_jira_tickets_cache_user_id ON jira_tickets_cache(user_id);
CREATE INDEX idx_jira_tickets_cache_config_id ON jira_tickets_cache(jira_config_id);
CREATE INDEX idx_jira_tickets_cache_jira_key ON jira_tickets_cache(jira_key);
CREATE INDEX idx_jira_tickets_cache_status ON jira_tickets_cache(status);
CREATE INDEX idx_jira_tickets_cache_priority ON jira_tickets_cache(priority);
CREATE INDEX idx_jira_tickets_cache_location ON jira_tickets_cache(latitude, longitude);
CREATE INDEX idx_jira_clusters_user_id ON jira_clusters(user_id);
CREATE INDEX idx_jira_clusters_config_id ON jira_clusters(jira_config_id);
CREATE INDEX idx_jira_clusters_status ON jira_clusters(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_jira_configs_updated_at 
  BEFORE UPDATE ON jira_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jira_clusters_updated_at 
  BEFORE UPDATE ON jira_clusters 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE jira_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jira_tickets_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE jira_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE jira_cluster_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jira_configs
CREATE POLICY "Users can view their own JIRA configs" ON jira_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own JIRA configs" ON jira_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own JIRA configs" ON jira_configs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own JIRA configs" ON jira_configs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for jira_tickets_cache
CREATE POLICY "Users can view their own JIRA tickets" ON jira_tickets_cache
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own JIRA tickets" ON jira_tickets_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own JIRA tickets" ON jira_tickets_cache
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own JIRA tickets" ON jira_tickets_cache
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for jira_clusters
CREATE POLICY "Users can view their own JIRA clusters" ON jira_clusters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own JIRA clusters" ON jira_clusters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own JIRA clusters" ON jira_clusters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own JIRA clusters" ON jira_clusters
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for jira_cluster_tickets
CREATE POLICY "Users can view their own cluster tickets" ON jira_cluster_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jira_clusters 
      WHERE jira_clusters.id = jira_cluster_tickets.cluster_id 
      AND jira_clusters.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own cluster tickets" ON jira_cluster_tickets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM jira_clusters 
      WHERE jira_clusters.id = jira_cluster_tickets.cluster_id 
      AND jira_clusters.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own cluster tickets" ON jira_cluster_tickets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM jira_clusters 
      WHERE jira_clusters.id = jira_cluster_tickets.cluster_id 
      AND jira_clusters.user_id = auth.uid()
    )
  );
