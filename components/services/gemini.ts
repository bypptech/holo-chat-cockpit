
import { GoogleGenerativeAI } from '@google/generative-ai';
import i18n from '@/i18n';

// Environment variable with runtime check
const getGeminiApiKey = () => {
  console.log('🔍 Environment check:', {
    envVarExists: !!process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    envVarLength: process.env.EXPO_PUBLIC_GEMINI_API_KEY?.length,
    allEnvVars: Object.keys(process.env).filter(key => key.startsWith('EXPO_PUBLIC_'))
  });
  
  // First check environment variable
  let apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  
  console.log('🔑 Final API key info:', {
    exists: !!apiKey,
    length: apiKey?.length,
    prefix: apiKey?.substring(0, 10) + '...'
  });
  
  return apiKey;
};

const geminiApiKey = getGeminiApiKey();

console.log('🔑 Gemini API Key status:', {
  keyExists: !!geminiApiKey,
  keyLength: geminiApiKey?.length,
  keyPrefix: geminiApiKey?.substring(0, 10) + '...',
  envVarSet: !!process.env.EXPO_PUBLIC_GEMINI_API_KEY
});

let genAI: GoogleGenerativeAI | null = null;

if (geminiApiKey) {
  try {
    genAI = new GoogleGenerativeAI(geminiApiKey);
    console.log('✅ Gemini AI initialized successfully');
  } catch (initError) {
    console.error('❌ Failed to initialize Gemini AI:', initError);
  }
} else {
  console.warn('❌ No Gemini API key available. Gemini features will be disabled.');
}

export interface DeviceCommand {
  action: string;
  target: string;
  parameters?: Record<string, any>;
  confidence: number;
  explanation: string;
}

export const analyzeUserIntent = async (
  userMessage: string, 
  availableDevices: string[],
  language?: 'ja' | 'en'
): Promise<DeviceCommand | null> => {
  try {
    if (!genAI) {
      console.warn('Gemini API is not configured');
      return null;
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-06-17" });
    
    // Use provided language or current i18n language
    const lang = language || i18n.language || 'ja';
    const t = i18n.getFixedT(lang);
    
    const prompt = `
${t('ai:prompts.deviceAnalysis.system')}

${t('ai:prompts.deviceAnalysis.availableDevices', { devices: availableDevices.join(', ') })}

${t('ai:prompts.deviceAnalysis.userMessage', { message: userMessage })}

${t('ai:prompts.deviceAnalysis.examples')}
- ${t('ai:prompts.deviceAnalysis.exampleTurnOn')}
- ${t('ai:prompts.deviceAnalysis.exampleTurnOff')}
- ${t('ai:prompts.deviceAnalysis.exampleVolumeUp')}
- ${t('ai:prompts.deviceAnalysis.exampleTemperature')}
- ${t('ai:prompts.deviceAnalysis.exampleBrightness')}
- ${t('ai:prompts.deviceAnalysis.exampleVolumeSet')}

${t('ai:prompts.deviceAnalysis.responseFormat')}
{
  "hasCommand": boolean,
  "action": "power_on|power_off|power_toggle|volume_up|volume_down|volume_set|temperature_set|brightness_set|mode_change|status|etc",
  "target": "デバイス名（利用可能なデバイスから最も適切なものを選択）",
  "parameters": { "volume": 50, "temperature": 25, "brightness": 80, "mode": "auto" などのパラメータ },
  "confidence": 0.0-1.0（コマンドの確実性）,
  "explanation": "なぜこのコマンドを提案するかの説明"
}

${t('ai:prompts.deviceAnalysis.notes')}
${t('ai:prompts.deviceAnalysis.noteDeviceSelection')}
${t('ai:prompts.deviceAnalysis.noteTurnOn')}
${t('ai:prompts.deviceAnalysis.noteTurnOff')}
${t('ai:prompts.deviceAnalysis.noteParameters')}
${t('ai:prompts.deviceAnalysis.noteUnclear')}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    try {
      const parsed = JSON.parse(text);
      
      if (parsed.hasCommand && parsed.confidence > 0.6) {
        return {
          action: parsed.action,
          target: parsed.target,
          parameters: parsed.parameters || {},
          confidence: parsed.confidence,
          explanation: parsed.explanation
        };
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
    }
    
    return null;
  } catch (error) {
    console.error('Error analyzing user intent:', error);
    throw error;
  }
};

export const generateAIResponse = async (userMessage: string, context?: string, language?: 'ja' | 'en'): Promise<string> => {
  try {
    console.log('🔍 Generating AI response...');
    console.log('🔑 genAI instance exists:', !!genAI);
    console.log('📝 User message:', userMessage.substring(0, 50) + '...');
    
    if (!genAI) {
      console.warn('⚠️ No genAI instance - using offline mode');
      // Use provided language or current i18n language
      const lang = language || i18n.language || 'ja';
      const t = i18n.getFixedT(lang);
      
      // Fallback to a simple offline response
      const responses = t('ai:offline.messages', { returnObjects: true }) as string[];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    console.log('🤖 Getting generative model...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-06-17" });
    
    // Use provided language or current i18n language
    const lang = language || i18n.language || 'ja';
    const t = i18n.getFixedT(lang);
    
    const prompt = `
${t('ai:prompts.chatResponse.system')}

${context ? t('ai:prompts.chatResponse.context', { context }) : ''}

${t('ai:prompts.chatResponse.user', { message: userMessage })}

${t('ai:prompts.chatResponse.instruction')}
`;

    console.log('📤 Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    console.log('📥 Received response from Gemini');
    
    const response = result.response;
    const text = response.text();
    console.log('✅ Successfully extracted response text');
    
    return text;
  } catch (error) {
    console.error('❌ Error generating AI response:', error);
    
    // Log all error properties
    if (error instanceof Error) {
      console.error('📋 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500) + '...',
        toString: error.toString()
      });
    } else {
      console.error('📋 Non-Error object:', JSON.stringify(error, null, 2));
    }
    
    // Try to extract more info from the error
    try {
      const errorStr = String(error);
      console.error('🔍 Error as string:', errorStr);
      
      // Use provided language or current i18n language
      const lang = language || i18n.language || 'ja';
      const t = i18n.getFixedT(lang);
      
      if (errorStr.includes('API_KEY_INVALID') || errorStr.includes('invalid API key')) {
        return t('ai:errors.invalidApiKey');
      }
      if (errorStr.includes('quota') || errorStr.includes('QUOTA_EXCEEDED')) {
        return t('ai:errors.quotaExceeded');
      }
      if (errorStr.includes('blocked') || errorStr.includes('BLOCKED')) {
        return t('ai:errors.requestBlocked');
      }
      if (errorStr.includes('network') || errorStr.includes('fetch')) {
        return t('ai:errors.networkError');
      }
    } catch (parseError) {
      console.error('Error parsing error:', parseError);
    }
    
    // Default fallback
    const lang = language || i18n.language || 'ja';
    const t = i18n.getFixedT(lang);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return t('ai:errors.generationError', { error: errorMessage.substring(0, 100) });
  }
};
