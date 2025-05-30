import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { makeIlpPdf } from '@/utils/pdf';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kidId = searchParams.get('kid');

  if (!kidId) {
    return NextResponse.json({ error: 'Missing kid parameter' }, { status: 400 });
  }

  try {
    // Fetch goals and entries for the kid
    const goals = await prisma.goal.findMany({
      where: { kidId: parseInt(kidId, 10) },
      include: { entries: true },
    });

    const entries = await prisma.entry.findMany({
      where: { kidId: parseInt(kidId, 10) },
    });

    // Generate PDF
    const pdfBytes = await makeIlpPdf(goals, entries);

    // Return PDF as downloadable file
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ilp-${kidId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
