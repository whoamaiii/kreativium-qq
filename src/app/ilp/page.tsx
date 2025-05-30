import { prisma } from "@/lib/prisma";
import ILPClientEnhanced from "./ILPClientEnhanced";
import { notFound } from "next/navigation";

export default async function ILPPage({ searchParams }: { searchParams?: Promise<{ kid?: string }> }) {
  try {
    // Await searchParams to avoid Next.js warning
    const params = await searchParams;
    
    // Resolve kidId from query param or get first kid
    const queryKidId = Number(params?.kid);
    const kidId = Number.isFinite(queryKidId) && queryKidId > 0
      ? queryKidId
      : (await prisma.kid.findFirst({ orderBy: { id: "asc" } }))?.id;
    
    if (!kidId) {
      notFound(); // No kids exist in the system
    }

    const kidData = await prisma.kid.findUnique({
      where: { id: kidId },
      include: {
        goals: {
          orderBy: { createdAt: 'desc' },
          include: {
            entries: {
              orderBy: { due: 'asc' },
            },
          },
        },
      },
    });

    if (!kidData) {
      notFound(); // Kid not found
    }

    // Flatten all entries from all goals for the main activity log table
    const allKidEntries = kidData.goals.flatMap((goal) => goal.entries);

    return (
      <ILPClientEnhanced 
        kidName={kidData.name} 
        kidId={kidData.id}
        initialStars={kidData.stars} 
        goals={kidData.goals} 
        activities={allKidEntries} 
      />
    );
  } catch (error) {
    console.error('Error in ILPPage:', error);
    throw error; // Re-throw to show Next.js error page with details
  }
}
