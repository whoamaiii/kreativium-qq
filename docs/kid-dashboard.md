# Kid Dashboard 2.0

## Overview

The Kid Dashboard 2.0 is a real-time dashboard that displays a child's progress, including their star count, active goals, and live feedback. It uses WebSocket technology (Socket.IO) for real-time updates.

## Features

- **Real-time Star Count**: Live updates when stars are awarded
- **Goal Progress Tracking**: Visual display of all goals with progress bars
- **Live Feedback Chat**: Real-time messaging system for feedback
- **Responsive Design**: Works on all screen sizes with dark mode support

## Architecture

### Components

1. **Dashboard Page** (`src/app/kids/[id]/dashboard/page.tsx`)
   - Server Component that fetches initial data
   - Passes data to the client component

2. **Dashboard Client** (`src/app/kids/[id]/dashboard/KidDashboardClient.tsx`)
   - Client Component that renders the UI
   - Uses the `useKidLive` hook for real-time updates

3. **useKidLive Hook** (`src/hooks/useKidLive.ts`)
   - Manages WebSocket connection
   - Fetches initial data
   - Handles real-time updates
   - Provides `sendMessage` function

### API Endpoints

1. **GET /api/kids/[kidId]/stars**
   - Fetches current star count

2. **PATCH /api/kids/[kidId]/stars**
   - Updates star count
   - Broadcasts update via WebSocket

3. **GET /api/kids/[kidId]/feedback**
   - Fetches feedback history

4. **POST /api/kids/[kidId]/feedback**
   - Creates new feedback
   - Broadcasts update via WebSocket

5. **POST /api/broadcast** (Internal)
   - Used by other API routes to broadcast WebSocket messages

### WebSocket Integration

1. **Socket.IO Server** (`src/pages/api/ws.ts`)
   - Handles WebSocket connections
   - Manages rooms for each kid
   - Broadcasts updates to connected clients

2. **Events**:
   - `connect`: Client connected
   - `join-kid-room`: Client joins a specific kid's room
   - `stars-update`: Star count updated
   - `feedback-update`: New feedback message

## Usage

### Accessing the Dashboard

Navigate to `/kids/[kidId]/dashboard` where `[kidId]` is the ID of the child.

### Sending Feedback

The `useKidLive` hook provides a `sendMessage` function:

```typescript
const { stars, messages, sendMessage, isConnected } = useKidLive(kidId);

// Send a message
await sendMessage('Great job on your homework!');
```

### Real-time Updates

Updates happen automatically when:
- Goals are completed (stars are awarded)
- Feedback is posted
- Any other client updates the data

## Testing

### Unit Tests

1. **useKidLive Hook** (`src/hooks/useKidLive.test.ts`)
   - Tests WebSocket connection
   - Tests real-time updates
   - Tests error handling

2. **Dashboard Client** (`src/app/kids/[id]/dashboard/KidDashboardClient.test.tsx`)
   - Tests UI rendering
   - Tests data display
   - Tests empty states

### Running Tests

```bash
# Run all tests
npm test

# Run dashboard-specific tests
npm test -- dashboard
```

## Development

### Environment Variables

```env
# Optional: Set the base URL for internal API calls
NEXT_PUBLIC_URL=http://localhost:3000
```

### Feature Flag (Optional)

To hide the dashboard in production, you can use a feature flag:

```env
NEXT_PUBLIC_DASHBOARD_V2=true
```

Then conditionally render based on this flag.

## Future Enhancements

1. **Message Input**: Add ability to send messages from the dashboard
2. **Typing Indicators**: Show when someone is typing
3. **Read Receipts**: Show when messages are read
4. **File Attachments**: Support for images/documents in feedback
5. **Notifications**: Browser notifications for new messages
6. **Analytics**: Track engagement and usage metrics
7. **Export**: Export feedback history as PDF

## Troubleshooting

### WebSocket Connection Issues

1. Check that the Socket.IO server is running
2. Verify the WebSocket URL in `useKidLive`
3. Check browser console for connection errors
4. Ensure CORS is properly configured

### Data Not Updating

1. Verify the broadcast endpoint is working
2. Check that the client is joined to the correct room
3. Inspect network tab for WebSocket messages
4. Check server logs for broadcast attempts

## Security Considerations

1. **Authentication**: Ensure only authorized users can access kid data
2. **Input Validation**: Validate all feedback content
3. **Rate Limiting**: Implement rate limiting for feedback posts
4. **Data Privacy**: Ensure kid data is properly protected 