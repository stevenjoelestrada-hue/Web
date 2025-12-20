import { createClient } from '@supabase/supabase-js';

// **Credenciales de Supabase desde variables de entorno**
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación para debugging
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables:', {
        url: supabaseUrl ? 'present' : 'missing',
        key: supabaseAnonKey ? 'present' : 'missing',
        environment: import.meta.env.MODE
    });
    throw new Error('Supabase environment variables are not configured');
}

console.log('✅ Supabase initialized:', {
    url: supabaseUrl,
    environment: import.meta.env.MODE,
    origin: window.location.origin
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Exportar el objeto storage apuntando al bucket 'Files'
export const storage = supabase.storage.from('Files');

export const signInWithGoogle = async () => {
    try {
        const redirectUrl = window.location.origin;

        console.log('🔐 Iniciando login con Google...');
        console.log('📍 Redirect URL:', redirectUrl);
        console.log('🌐 Environment:', import.meta.env.MODE);

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            }
        });

        if (error) {
            console.error('❌ Error en signInWithOAuth:', {
                message: error.message,
                status: error.status,
                details: error
            });
            throw error;
        }

        console.log('✅ SignInWithOAuth exitoso:', data);
        return data;

    } catch (err) {
        console.error('❌ Exception en signInWithGoogle:', err);
        throw err;
    }
};

export const signOutUser = async () => {
    try {
        console.log('🚪 Cerrando sesión...');
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('❌ Error al cerrar sesión:', error);
            throw error;
        }
        console.log('✅ Sesión cerrada exitosamente');
    } catch (err) {
        console.error('❌ Exception en signOutUser:', err);
        throw err;
    }
};
