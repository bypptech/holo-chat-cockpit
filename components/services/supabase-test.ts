import { getSupabase } from './supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('🌐 Supabase URL from env:', process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log('🔑 API Key exists in env:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
    console.log('📍 Running in environment:', typeof window !== 'undefined' ? 'browser' : 'node');
    console.log('🌐 Window location:', typeof window !== 'undefined' ? window.location.href : 'N/A');
    
    // Skip fetch test in development if running on HTTP
    if (typeof window !== 'undefined' && window.location.protocol === 'http:') {
      console.warn('⚠️ Running on HTTP, skipping direct fetch test to avoid mixed content issues');
      
      // Just test the Supabase client directly
      const client = getSupabase();
      const { data, error } = await client
        .from('chat_sessions')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ Supabase client test failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Supabase client test successful');
      return { success: true, data };
    }
    
    const client = getSupabase();
    
    // Get the actual URL and key being used
    const actualUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const actualKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🔍 Using URL:', actualUrl);
    console.log('🔍 Using API Key (first 20 chars):', actualKey.slice(0, 20) + '...');
    
    // Test with a simpler health check first
    try {
      const response = await fetch(`${actualUrl}/rest/v1/`, {
        headers: {
          'apikey': actualKey,
          'Authorization': `Bearer ${actualKey}`,
        }
      });
      
      console.log('🌐 Health check response status:', response.status);
      console.log('🌐 Health check response headers:', response.headers);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('❌ Health check failed:', text);
        return { success: false, error: `Health check failed: ${response.status}` };
      }
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      return { 
        success: false, 
        error: `Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown'}` 
      };
    }
    
    // Now try the actual table query
    const { data, error } = await client
      .from('chat_sessions')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, error: error.message };
    }
    
    console.log('✅ Supabase connection successful');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};