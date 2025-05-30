# Gemini Live API Setup

## Environment Configuration

Create a `.env.local` file in the project root and store your Gemini API key there. **Do not commit this file to version control.**

```bash
# .env.local
GEMINI_API_KEY=<your_api_key>
```

**Get your API key from:** https://aistudio.google.com/app/apikey

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