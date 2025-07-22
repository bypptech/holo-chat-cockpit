declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // App Configuration
      EXPO_PUBLIC_APP_NAME: string;
      EXPO_PUBLIC_APP_VERSION: string;
      
      // Supabase Configuration
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      
      // Gemini AI Configuration
      EXPO_PUBLIC_GEMINI_API_KEY: string;
    }
  }
}

// Ensure this file is treated as a module
export {};