import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://mzjhoblzatnlntlmczpy.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16amhvYmx6YXRubG50bG1jenB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNjYxNjEsImV4cCI6MjEwNTc0MjE2MX0.r1IrvoHyPTtZKNq05CEOr0LNZxWkQvJxcDSUcmFYWLI"

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check GitHub Secrets and workflow config.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)