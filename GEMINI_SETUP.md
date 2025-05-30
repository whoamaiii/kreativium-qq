# Gemini Live API Setup

## Environment Configuration

### 🔐 Secure API Key Setup

1. **Create a `.env.local` file** in the project root (this file is gitignored by default):

```bash
# IMPORTANT: Never commit this file to version control!
GEMINI_API_KEY=your_actual_api_key_here
```

2. **Get your API key from:** https://aistudio.google.com/app/apikey

### ⚠️ Security Best Practices

- **NEVER commit API keys to version control**
- Add `.env.local` to your `.gitignore` file (should already be there)
- Use environment variables only on the server side
- The `/api/live-token` endpoint securely provides the key to the client
- Never expose API keys in client-side code or browser console

### 📋 Environment Variable Checklist

- [ ] Created `.env.local` file
- [ ] Added `GEMINI_API_KEY` with your actual key
- [ ] Verified `.env.local` is in `.gitignore`
- [ ] Restarted development server after adding the key

### 🚀 Production Deployment

For production deployments, set the `GEMINI_API_KEY` environment variable in your hosting provider's dashboard:

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Railway**: Variables tab in your project
- **Heroku**: Config Vars in Settings

**Never hardcode API keys in your application code!**

### 🔄 Key Rotation

If you suspect your API key has been compromised:

1. **Generate a new key** at https://aistudio.google.com/app/apikey
2. **Update** your `.env.local` file with the new key
3. **Delete** the old key from Google AI Studio
4. **Update** production environment variables
5. **Restart** all services using the key

## Installation

Make sure you have the required dependencies:

```bash
pnpm add @google/genai
```

## Usage

The updated `useGeminiLive` hook now uses the proper `@google/genai` SDK instead of raw WebSocket connections, which should resolve the WebSocket connection issues.

Key improvements:
- Uses official Google Generative AI SDK
- Proper audio context management
- Real-time PCM audio streaming
- Better error handling
- Session management with reset functionality

## Testing

1. Set your `GEMINI_API_KEY` in `.env.local`
2. Restart your development server
3. Try connecting to Gemini Live - the WebSocket errors should be resolved

## Notes

- The hook now includes a `reset()` function for clearing sessions
- Audio is processed in real-time using Web Audio API
- The implementation follows the official Google AI example patterns

## Architecture

- **useGeminiLive hook**: Manages WebSocket connection, audio recording, and message handling
- **Secure API route**: `/api/live-token` provides API key securely to client
- **PigletAvatar**: Visual representation with connection status
- **Waveform**: Real-time audio visualization
- **MicControls**: Recording controls with state management

## Features

- Real-time bidirectional audio with Gemini Live
- Secure API key handling via edge function
- Visual feedback for connection and recording states
- Automatic audio playback of responses
- Error handling and reconnection capabilities

## Model Configuration

Default model: `gemini-2.0-flash-exp`

The model is configured with:
- Audio response modality
- Puck voice
- PigletChat personality
- Conversational and brief responses 