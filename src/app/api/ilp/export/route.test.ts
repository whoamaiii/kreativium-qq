import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/prisma', () => {
  const mockPrisma = {
    goal: {
      findMany: vi.fn(),
    },
    entry: {
      findMany: vi.fn(),
    },
  }
  
  return {
    default: mockPrisma,
    prisma: mockPrisma
  }
});

vi.mock('@/utils/pdf', () => ({
  makeIlpPdf: vi.fn(),
}));

import { prisma } from '@/lib/prisma';
import { makeIlpPdf } from '@/utils/pdf';

describe('/api/ilp/export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if kid parameter is missing', async () => {
    const request = new Request('http://localhost:3000/api/ilp/export');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing kid parameter');
  });

  it('should fetch goals and entries for the specified kidId', async () => {
    const mockGoals = [
      { id: 1, kidId: 123, title: 'Goal 1', entries: [] },
      { id: 2, kidId: 123, title: 'Goal 2', entries: [] },
    ];
    const mockEntries = [
      { id: 1, kidId: 123, content: 'Entry 1' },
      { id: 2, kidId: 123, content: 'Entry 2' },
    ];

    (prisma.goal.findMany as any).mockResolvedValue(mockGoals);
    (prisma.entry.findMany as any).mockResolvedValue(mockEntries);
    (makeIlpPdf as any).mockResolvedValue(new Uint8Array([1, 2, 3, 4]));

    const request = new Request('http://localhost:3000/api/ilp/export?kid=123');
    const response = await GET(request);

    expect(prisma.goal.findMany).toHaveBeenCalledWith({
      where: { kidId: 123 },
      include: { entries: true },
    });
    expect(prisma.entry.findMany).toHaveBeenCalledWith({
      where: { kidId: 123 },
    });
  });

  it('should return PDF with correct headers', async () => {
    const mockPdfBytes = new Uint8Array([1, 2, 3, 4, 5]);
    
    (prisma.goal.findMany as any).mockResolvedValue([]);
    (prisma.entry.findMany as any).mockResolvedValue([]);
    (makeIlpPdf as any).mockResolvedValue(mockPdfBytes);

    const request = new Request('http://localhost:3000/api/ilp/export?kid=456');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="ilp-456.pdf"');
    
    const responseBody = await response.arrayBuffer();
    expect(new Uint8Array(responseBody)).toEqual(mockPdfBytes);
  });

  it('should handle errors gracefully', async () => {
    (prisma.goal.findMany as any).mockRejectedValue(new Error('Database error'));

    const request = new Request('http://localhost:3000/api/ilp/export?kid=789');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to generate PDF');
  });

  it('should call makeIlpPdf with fetched data', async () => {
    const mockGoals = [{ id: 1, kidId: 111, title: 'Test Goal' }];
    const mockEntries = [{ id: 1, kidId: 111, content: 'Test Entry' }];
    
    (prisma.goal.findMany as any).mockResolvedValue(mockGoals);
    (prisma.entry.findMany as any).mockResolvedValue(mockEntries);
    (makeIlpPdf as any).mockResolvedValue(new Uint8Array());

    const request = new Request('http://localhost:3000/api/ilp/export?kid=111');
    await GET(request);

    expect(makeIlpPdf).toHaveBeenCalledWith(mockGoals, mockEntries);
  });
}); 