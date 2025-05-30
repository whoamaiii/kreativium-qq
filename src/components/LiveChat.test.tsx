import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LiveChat from './LiveChat';
import * as useKidLiveModule from '@/hooks/useKidLive';

// Mock the useKidLive hook
vi.mock('@/hooks/useKidLive', () => ({
  useKidLive: vi.fn()
}));

// Mock fetch
global.fetch = vi.fn();

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe('LiveChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    (global.fetch as any).mockReset();
  });

  it('should render the component with empty message list', () => {
    vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
      stars: 0,
      messages: [],
    });

    render(<LiveChat kidId={1} />);

    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('should display messages from useKidLive hook', () => {
    const mockMessages = [
      {
        id: 1,
        content: 'Hello from assistant',
        role: 'assistant' as const,
        createdAt: new Date('2024-01-01T10:00:00').toISOString(),
      },
      {
        id: 2,
        content: 'Hello from user',
        role: 'user' as const,
        createdAt: new Date('2024-01-01T10:01:00').toISOString(),
      },
    ];

    vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
      stars: 0,
      messages: mockMessages,
    });

    render(<LiveChat kidId={1} />);

    expect(screen.getByText('Hello from assistant')).toBeInTheDocument();
    expect(screen.getByText('Hello from user')).toBeInTheDocument();
  });

  it('should send a message when send button is clicked', async () => {
    vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
      stars: 0,
      messages: [],
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 3, content: 'Test message', role: 'user', createdAt: new Date().toISOString() }),
    });

    render(<LiveChat kidId={1} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByText('Send');

    // Type a message
    fireEvent.change(textarea, { target: { value: 'Test message' } });
    expect(textarea).toHaveValue('Test message');

    // Click send
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/kids/1/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: 'Test message',
          role: 'user',
        }),
      });
    });

    // Textarea should be cleared after sending
    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  it('should send message on Enter key press', async () => {
    vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
      stars: 0,
      messages: [],
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 4, content: 'Enter key message', role: 'user', createdAt: new Date().toISOString() }),
    });

    render(<LiveChat kidId={2} />);

    const textarea = screen.getByPlaceholderText('Type a message...');

    // Type a message
    fireEvent.change(textarea, { target: { value: 'Enter key message' } });

    // Press Enter
    fireEvent.keyPress(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/kids/2/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: 'Enter key message',
          role: 'user',
        }),
      });
    });
  });

  it('should not send empty messages', async () => {
    vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
      stars: 0,
      messages: [],
    });

    render(<LiveChat kidId={1} />);

    const sendButton = screen.getByText('Send');

    // Try to send empty message
    fireEvent.click(sendButton);

    // Fetch should not be called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should disable send button when loading', async () => {
    const user = userEvent.setup();
    
    vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
      stars: 0,
      messages: [],
    });

    let resolvePromise: any;
    const fetchPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    (global.fetch as any).mockImplementationOnce(() => fetchPromise);

    render(<LiveChat kidId={1} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByText('Send');

    // Type a message
    fireEvent.change(textarea, { target: { value: 'Slow message' } });

    // Click send
    fireEvent.click(sendButton);

    // Button should be disabled while loading
    expect(sendButton).toBeDisabled();
    expect(textarea).toBeDisabled();

    // Resolve the promise to complete the request
    await act(async () => {
      resolvePromise({
        ok: true,
        json: async () => ({ id: 5, content: 'Slow message', role: 'user', createdAt: new Date().toISOString() }),
      });
    });

    // Button should be disabled after loading (empty input)
    await waitFor(() => {
      expect(sendButton).toBeDisabled(); // Still disabled because input is empty
      expect(textarea).not.toBeDisabled();
    });
    
    // Type something to enable the button
    await user.type(textarea, 'Another message');
    expect(sendButton).not.toBeDisabled();
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
      stars: 0,
      messages: [],
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<LiveChat kidId={1} />);

    const textarea = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByText('Send');

    // Type a message
    fireEvent.change(textarea, { target: { value: 'Error message' } });

    // Click send
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending message:', expect.any(Error));
    });

    // Textarea should not be cleared on error
    expect(textarea).toHaveValue('Error message');

    consoleErrorSpy.mockRestore();
  });

  it('should apply correct styling to messages based on role', () => {
    const mockMessages = [
      {
        id: 1,
        content: 'Assistant message',
        role: 'assistant' as const,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        content: 'User message',
        role: 'user' as const,
        createdAt: new Date().toISOString(),
      },
    ];

    vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
      stars: 0,
      messages: mockMessages,
    });

    render(<LiveChat kidId={1} />);

    const assistantMessage = screen.getByText('Assistant message').parentElement;
    const userMessage = screen.getByText('User message').parentElement;

    expect(assistantMessage).toHaveClass('bg-blue-100');
    expect(userMessage).toHaveClass('bg-white');
  });
}); 