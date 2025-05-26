import prisma from "@/lib/prisma";
import ILPClient from "./ILPClient";
import { notFound } from "next/navigation";

export default async function ILPPage({ searchParams }: { searchParams?: Promise<{ kidId?: string }> }) {
  try {
    // Await searchParams to avoid Next.js warning
    const params = await searchParams;
    const kidIdParam = params?.kidId;
    const targetKidId = kidIdParam ? parseInt(kidIdParam, 10) : 5; // Default to kid ID 5 (Alex)

    if (isNaN(targetKidId)) {
      notFound(); // Handle invalid kidId parameter
    }

    const kidData = await prisma.kid.findUnique({
      where: { id: targetKidId },
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
      // Log available kids for debugging
      const allKids = await prisma.kid.findMany();
      console.error(`Kid with ID ${targetKidId} not found. Available kids:`, allKids);
      notFound(); // Kid not found
    }

    // Flatten all entries from all goals for the main activity log table
    const allKidEntries = kidData.goals.flatMap((goal) => goal.entries);

    return <ILPClient kidName={kidData.name} stars={kidData.stars} goals={kidData.goals} activities={allKidEntries} />;
  } catch (error) {
    console.error('Error in ILPPage:', error);
    throw error; // Re-throw to show Next.js error page with details
  }
}
