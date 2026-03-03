import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Obtener las variables de entorno para Supabase (como fallback para retrocompatibilidad,
// aunque ahora se leen dinámicamente en los getters)
const getEnvVars = () => ({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
});

let _supabaseInstance: SupabaseClient | null = null;
let _supabaseAdminInstance: SupabaseClient | null = null;

/**
 * Obtiene o inicializa la conexión lazy a Supabase (Anon)
 */
export const getSupabase = (): SupabaseClient => {
  if (!_supabaseInstance) {
    const { supabaseUrl, supabaseAnonKey } = getEnvVars();
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL o Anon Key no están definidas en las variables de entorno. Son necesarias para esta operación.');
    }
    
    _supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  }
  return _supabaseInstance;
};

/**
 * Obtiene o inicializa la conexión lazy a Supabase (Admin)
 */
export const getSupabaseAdmin = (): SupabaseClient => {
  if (!_supabaseAdminInstance) {
    const { supabaseUrl, supabaseServiceRoleKey } = getEnvVars();
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase URL o Service Role Key no están definidas en las variables de entorno. Son necesarias para esta operación.');
    }
    
    _supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return _supabaseAdminInstance;
};

// Exportamos las variables como Proxies para mantener la retrocompatibilidad
// con todo el código existente que importa `supabase` o `supabaseAdmin` directamente
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const instance = getSupabase();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
}) as SupabaseClient;

export const supabaseAdmin = new Proxy({} as any, {
  get(target, prop) {
    const instance = getSupabaseAdmin();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
}) as SupabaseClient;

// Función para verificar la conexión a Supabase
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Intentar una operación simple para verificar la conexión
    const { data, error } = await supabase.from('segments').select('id').limit(1);
    
    if (error) {
      console.error('Error al conectar con Supabase:', error);
      return false;
    }
    
    console.log('Conexión a Supabase establecida correctamente');
    return true;
  } catch (error) {
    console.error('Error al verificar la conexión a Supabase:', error);
    return false;
  }
} 