import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/prisma', () => ({
  default: {
    goal: { findMany: vi.fn().mockResolvedValue([]) },
    entry: { findMany: vi.fn().mockResolvedValue([]) }
  }
}));

vi.mock('@/utils/pdf', () => ({
  makeIlpPdf: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]))
}));

describe('ILP Export API Route', () => {
  it('returns 400 when missing kid parameter', async () => {
    const request = new Request('http://localhost/api/ilp/export');
    const res = await GET(request);
    expect(res.status).toBe(400);
  });

  it('generates a PDF response', async () => {
    const request = new Request('http://localhost/api/ilp/export?kid=1');
    const res = await GET(request);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
  });
});