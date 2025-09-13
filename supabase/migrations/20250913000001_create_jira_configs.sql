-- Create JIRA configurations table
CREATE TABLE IF NOT EXISTS public.jira_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    jira_url TEXT NOT NULL,
    email TEXT NOT NULL,
    api_token TEXT NOT NULL, -- This will be encrypted in production
    project_key TEXT NOT NULL,
    clustering_status TEXT NOT NULL DEFAULT 'Ready For Clustering',
    cluster_ticket_type TEXT NOT NULL DEFAULT 'Job Cluster',
    location_field TEXT, -- Custom field ID for location data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id) -- One config per user for now
);

-- Enable Row Level Security
ALTER TABLE public.jira_configs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only access their own configs
CREATE POLICY "Users can only access their own JIRA configs" 
ON public.jira_configs 
FOR ALL 
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.jira_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
