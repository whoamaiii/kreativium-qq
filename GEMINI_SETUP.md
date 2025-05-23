# Gemini Live Setup Guide

## Environment Setup

To use the Gemini Live chat functionality, you need to set up your API key:

### 1. Get Gemini API Key
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key
- Copy the key

### 2. Set Environment Variable
Create a `.env.local` file in the project root:

```bash
GEMINI_API_KEY=your_api_key_here
```

### 3. Update Production Domain
In `src/app/api/live-token/route.ts`, update the allowed origins:

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-production-domain.com', // Replace with your actual domain
];
```

## Usage

1. Navigate to `/chat`
2. Click "Connect" to establish WebSocket connection
3. Click the red record button to start recording
4. Speak into your microphone
5. Click stop to send audio to Gemini
6. Audio responses will play automatically

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