// Follow this setup for each of your functions.
// 1. Create a new folder under `supabase/functions` with the name of your function.
// 2. Add an `index.ts` file with the function implementation.
// 3. Import any shared dependencies from `../shared/` directory.

// @ts-ignore - Deno import for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, handleCors } from "../_shared/cors.ts"

console.log("Hello from Functions!")

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const { name } = await req.json()
    
    const data = {
      message: `Hello ${name || 'World'}!`,
      timestamp: new Date().toISOString(),
    }

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
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
