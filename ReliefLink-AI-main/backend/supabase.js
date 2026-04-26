const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Guard: if Supabase env vars are missing, use a mock client to avoid crash
let supabase;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.warn('⚠️  SUPABASE_URL or SUPABASE_KEY not set — using in-memory mock (data will not persist)');
  // Minimal mock so dbService calls don't throw
  supabase = {
    from: () => ({
      insert: async () => ({ error: null }),
      select: async () => ({ data: [], error: null }),
    }),
  };
}

module.exports = supabase;