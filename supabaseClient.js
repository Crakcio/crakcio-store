// Reemplaza con tus claves reales
const SUPABASE_URL = "https://twznikjjvtoedfaxbuvf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3em5pa2pqdnRvZWRmYXhidXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTI1NDAsImV4cCI6MjA2ODg2ODU0MH0.aOQ10hq-syYqrenvFxveBQj6wKqdDtsDKfykSm42MFE";

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
