import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { prisma } from '@/lib/prisma';

// Mock prisma
vi.mock('@/lib/prisma', () => {
  const mockPrisma = {
    feedback: {
      findMany: vi.fn(),
      create: vi.fn()
    }
  }
  
  return {
    default: mockPrisma,
    prisma: mockPrisma
  }
});

describe('/api/kids/[kidId]/feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return feedback for a kid', async () => {
      const mockFeedback = [
        {
          id: 1,
          content: 'Great job!',
          role: 'assistant',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          content: 'I finished my homework',
          role: 'user',
          createdAt: new Date('2024-01-02'),
        },
      ];

      (prisma.feedback.findMany as any).mockResolvedValue(mockFeedback);

      const request = new NextRequest('http://localhost:3000/api/kids/1/feedback');
      const response = await GET(request, { params: Promise.resolve({ kidId: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockFeedback.map(f => ({
        ...f,
        createdAt: f.createdAt.toISOString()
      })));
      expect(prisma.feedback.findMany).toHaveBeenCalledWith({
        where: { kidId: 1 },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          content: true,
          role: true,
          createdAt: true,
        },
      });
    });

    it('should return 400 for invalid kid ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/kids/invalid/feedback');
      const response = await GET(request, { params: Promise.resolve({ kidId: 'invalid' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid kid ID' });
    });

    it('should handle database errors', async () => {
      (prisma.feedback.findMany as any).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/kids/1/feedback');
      const response = await GET(request, { params: Promise.resolve({ kidId: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch feedback' });
    });
  });

  describe('POST', () => {
    it('should create new feedback', async () => {
      const newFeedback = {
        id: 3,
        kidId: 1,
        content: 'Keep it up!',
        role: 'assistant',
        createdAt: new Date(),
      };

      (prisma.feedback.create as any).mockResolvedValue(newFeedback);

      const request = new NextRequest('http://localhost:3000/api/kids/1/feedback', {
        method: 'POST',
        body: JSON.stringify({ content: 'Keep it up!', role: 'assistant' }),
      });
      const response = await POST(request, { params: Promise.resolve({ kidId: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({
        ...newFeedback,
        createdAt: newFeedback.createdAt.toISOString()
      });
      expect(prisma.feedback.create).toHaveBeenCalledWith({
        data: {
          kidId: 1,
          content: 'Keep it up!',
          role: 'assistant',
        },
        select: {
          id: true,
          content: true,
          role: true,
          createdAt: true,
        },
      });
    });

    it('should return 400 for invalid kid ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/kids/invalid/feedback', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test', role: 'user' }),
      });
      const response = await POST(request, { params: Promise.resolve({ kidId: 'invalid' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid kid ID' });
    });

    it('should return 400 for missing content or role', async () => {
      const request = new NextRequest('http://localhost:3000/api/kids/1/feedback', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test' }), // missing role
      });
      const response = await POST(request, { params: Promise.resolve({ kidId: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Content and role are required' });
    });

    it('should return 400 for invalid role', async () => {
      const request = new NextRequest('http://localhost:3000/api/kids/1/feedback', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test', role: 'invalid' }),
      });
      const response = await POST(request, { params: Promise.resolve({ kidId: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Role must be "assistant" or "user"' });
    });

    it('should handle database errors', async () => {
      (prisma.feedback.create as any).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/kids/1/feedback', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test', role: 'user' }),
      });
      const response = await POST(request, { params: Promise.resolve({ kidId: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create feedback' });
    });
  });
}); 