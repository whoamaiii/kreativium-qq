import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the prisma client
vi.mock('@/lib/prisma', () => ({
  default: {
    goal: {
      findMany: vi.fn()
    },
    entry: {
      findMany: vi.fn()
    }
  },
  prisma: {
    goal: {
      findMany: vi.fn()
    },
    entry: {
      findMany: vi.fn()
    }
  }
}));

// Mock the PDF generation utility
vi.mock('@/utils/pdf', () => ({
  makeIlpPdf: vi.fn()
}));

// Import after mocking
import { GET } from './route';
import prisma from '@/lib/prisma';
import { makeIlpPdf } from '@/utils/pdf';

describe('ILP Export API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 when kid parameter is missing', async () => {
    const request = new Request('http://localhost:3000/api/ilp/export');
    const response = await GET(request);
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: 'Missing kid parameter' });
  });

  it('should generate and return PDF when kid parameter is provided', async () => {
    const mockGoals = [
      {
        id: 1,
        title: 'Goal 1',
        desc: 'Description 1',
        pct: 50,
        pctComplete: 50,
        targetXp: 100,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        kidId: 1,
        entries: []
      }
    ];

    const mockEntries = [
      {
        id: 1,
        activity: 'Activity 1',
        subject: 'Math',
        status: 'COMPLETED',
        due: new Date(),
        notes: 'Good work',
        delta: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        kidId: 1,
        goalId: 1
      }
    ];

    const mockPdfBytes = new Uint8Array([1, 2, 3, 4, 5]);

    vi.mocked(prisma.goal.findMany).mockResolvedValue(mockGoals as any);
    vi.mocked(prisma.entry.findMany).mockResolvedValue(mockEntries);
    vi.mocked(makeIlpPdf).mockResolvedValue(mockPdfBytes);

    const request = new Request('http://localhost:3000/api/ilp/export?kid=1');
    const response = await GET(request);

    // Verify prisma calls
    expect(prisma.goal.findMany).toHaveBeenCalledWith({
      where: { kidId: 1 },
      include: { entries: true }
    });

    expect(prisma.entry.findMany).toHaveBeenCalledWith({
      where: { kidId: 1 }
    });

    // Verify PDF generation
    expect(makeIlpPdf).toHaveBeenCalledWith(mockGoals, mockEntries);

    // Verify response
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="ilp-1.pdf"');
    
    // Verify body is the PDF bytes
    const responseBuffer = await response.arrayBuffer();
    expect(new Uint8Array(responseBuffer)).toEqual(mockPdfBytes);
  });

  it('should return 500 when PDF generation fails', async () => {
    const mockError = new Error('PDF generation failed');
    
    vi.mocked(prisma.goal.findMany).mockRejectedValue(mockError);

    // Mock console.error to avoid test output pollution
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const request = new Request('http://localhost:3000/api/ilp/export?kid=1');
    const response = await GET(request);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error generating PDF:', mockError);
    expect(response.status).toBe(500);
    
    const data = await response.json();
    expect(data).toEqual({ error: 'Failed to generate PDF' });

    consoleErrorSpy.mockRestore();
  });

  it('should handle invalid kid parameter gracefully', async () => {
    vi.mocked(prisma.goal.findMany).mockResolvedValue([]);
    vi.mocked(prisma.entry.findMany).mockResolvedValue([]);
    vi.mocked(makeIlpPdf).mockResolvedValue(new Uint8Array([]));

    const request = new Request('http://localhost:3000/api/ilp/export?kid=invalid');
    const response = await GET(request);

    // Should still try to generate PDF with empty data
    expect(prisma.goal.findMany).toHaveBeenCalledWith({
      where: { kidId: NaN }, // parseInt('invalid') returns NaN
      include: { entries: true }
    });

    expect(makeIlpPdf).toHaveBeenCalledWith([], []);
    
    // Should return empty PDF
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
  });
});