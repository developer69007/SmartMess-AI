// config/db.js
// Verifies Supabase connectivity on startup.

const supabase = require('./supabaseClient');

const connectDB = async () => {
  try {
    // Simple connectivity check — query a non-existent table will still confirm
    // the client can reach Supabase. We use a lightweight RPC or raw query.
    const { error } = await supabase.from('students').select('id').limit(1);

    // 'PGRST205' / 'PGRST116' / '42P01' = table doesn't exist yet (OK on first run before schema)
    // No error = table exists and connection works
    if (error && error.code !== 'PGRST116' && error.code !== '42P01' && error.code !== 'PGRST205') {
      throw new Error(error.message);
    }

    console.log('✅ Supabase Connected');
  } catch (error) {
    console.error('❌ Supabase Connection Failed');
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;