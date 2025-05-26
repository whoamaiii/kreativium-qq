// Simple test script to check live API functionality
const { GoogleGenAI, Modality } = require('@google/genai');

async function testLiveAPI() {
  try {
    console.log('Testing Gemini Live API...');
    
    // Test API key fetch
    const response = await fetch('http://localhost:3004/api/live-token');
    const data = await response.json();
    
    if (!data.apiKey) {
      throw new Error('No API key received');
    }
    
    console.log('✅ API key fetch successful');
    
    // Test GoogleGenAI client initialization
    const client = new GoogleGenAI({ apiKey: data.apiKey });
    console.log('✅ GoogleGenAI client initialized');
    
    // Test session creation (this should work)
    const session = await client.live.connect({
      model: 'gemini-2.5-flash-preview-native-audio-dialog',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } }
        }
      },
      callbacks: {
        onopen: () => {
          console.log('✅ Live session opened successfully');
          session.close();
        },
        onmessage: (message) => {
          console.log('📨 Received message:', message);
        },
        onerror: (error) => {
          console.error('❌ Session error:', error);
        },
        onclose: () => {
          console.log('✅ Session closed');
          process.exit(0);
        }
      }
    });
    
    console.log('✅ Live session created successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testLiveAPI(); 