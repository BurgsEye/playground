# Supabase Playground

A learning project for exploring Supabase features including Edge Functions and web applications.

## Project Structure

```
playground/
├── supabase/                 # Supabase configuration and functions
│   ├── functions/           # Edge Functions
│   │   ├── _shared/         # Shared utilities
│   │   ├── hello-world/     # Example function
│   │   └── web-scraper/     # Scraper function example
│   ├── migrations/          # Database migrations
│   └── config.toml         # Supabase configuration
├── web/                     # Next.js web application
│   ├── src/                # Source code
│   └── package.json        # Dependencies
└── scripts/                # Utility scripts
```

## Getting Started

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Initialize and Start Supabase

```bash
# Initialize Supabase (if not already done)
supabase init

# Start local development environment
supabase start
```

### 3. Set up Environment Variables

```bash
cp .env.example .env.local
```

For local development, the default values in `.env.example` should work.

### 4. Install Web App Dependencies

```bash
cd web
npm install
```

### 5. Start the Web Application

```bash
cd web
npm run dev
```

Visit `http://localhost:3000` to see your app!

## Edge Functions

### Testing Functions Locally

```bash
# Test hello-world function
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/hello-world' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{"name":"World"}'

# Test web-scraper function  
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/web-scraper' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{"url":"https://example.com"}'
```

### Deploying Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy hello-world
```

## Database

### Creating Migrations

```bash
# Create a new migration
supabase migration new create_users_table

# Apply migrations
supabase db push
```

### Database Schema

Add your SQL files to `supabase/migrations/` for version control.

## Useful Commands

```bash
# View logs
supabase functions logs

# Stop local environment
supabase stop

# Reset local database
supabase db reset

# Generate types for TypeScript
supabase gen types typescript --local > web/src/types/supabase.ts
```

## Next Steps

1. **Create a Supabase Project**: Visit [supabase.com](https://supabase.com) and create a new project
2. **Update Environment Variables**: Add your project URL and keys to `.env.local`
3. **Deploy Functions**: Use `supabase functions deploy` to deploy your edge functions
4. **Build Your App**: Start building your web application with authentication, database, and real-time features
5. **Explore Features**: Try out authentication, storage, real-time subscriptions, and more!

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Next.js + Supabase Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
