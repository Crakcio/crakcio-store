
// supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = "https://twznikjjvtoedfaxbuvf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3em5pa2pqdnRvZWRmYXhidXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTI1NDAsImV4cCI6MjA2ODg2ODU0MH0.aOQ10hq-syYqrenvFxveBQj6wKqdDtsDKfykSm42MFE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
