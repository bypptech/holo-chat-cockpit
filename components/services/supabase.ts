import { createClient } from '@supabase/supabase-js';

// Environment variables validation with fallback for Expo Web
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

// Environment debug (run once)
let envChecked = false;
if (!envChecked) {
  console.log('🔍 Supabase Environment Debug:', {
    urlExists: !!supabaseUrl,
    urlLength: supabaseUrl?.length || 0,
    urlStart: supabaseUrl?.slice(0, 16) || 'none',
    keyExists: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length || 0,
    keyStart: supabaseAnonKey?.slice(0, 16) || 'none',
    processEnv: typeof process !== 'undefined' ? 'available' : 'missing'
  });
  envChecked = true;
}

// Global singleton pattern to prevent multiple instances across all contexts
declare global {
  var __supabaseInstance: ReturnType<typeof createClient> | undefined;
}

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  // Check global instance first
  if (typeof window !== 'undefined' && window.__supabaseInstance) {
    return window.__supabaseInstance;
  }
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'holo-chat-auth'
      },
      global: {
        headers: {
          'x-application-name': 'holo-chat-cockpit'
        }
      }
    });
    
    // Store globally to prevent duplication
    if (typeof window !== 'undefined') {
      (window as any).__supabaseInstance = supabaseInstance;
    }
  }
  return supabaseInstance;
};

// Default export for backward compatibility
export const supabase = getSupabase();

// Database functions
export const createChatSession = async (sessionData: {
  user_id: string;
  language: string;
  session_metadata?: any;
}) => {
  const client = getSupabase();

  console.log('📝 Creating chat session for user:', sessionData.user_id.slice(0, 8) + '...');

  const { data, error } = await client
    .from('chat_sessions')
    .insert([{
      ...sessionData,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating chat session:', error);
    throw error;
  }

  console.log('✅ Chat session created:', data.id);
  return data;
};

export const getChatSessions = async (userId: string) => {
  const client = getSupabase();

  const { data, error } = await client
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching chat sessions:', error);
    throw error;
  }

  return data;
};

export const updateChatSession = async (sessionId: string, updates: any) => {
  const client = getSupabase();

  const { data, error } = await client
    .from('chat_sessions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error updating chat session:', error);
    throw error;
  }

  return data;
};