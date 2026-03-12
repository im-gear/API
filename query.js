import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'remote_sessions' });
  if (error) {
    const { data: q2, error: e2 } = await supabase.from('remote_sessions').select('*').limit(0);
    console.log(q2, e2);
  } else {
    console.log(data);
  }
}
run();
