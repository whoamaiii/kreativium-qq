import prisma from "@/lib/prisma";
import ILPClient from "./ILPClient";
import { notFound } from "next/navigation";

export default async function ILPPage({ searchParams }: { searchParams?: { kidId?: string } }) {
  // Await searchParams to avoid Next.js warning
  const params = await searchParams;
  const kidIdParam = params?.kidId;
  const targetKidId = kidIdParam ? parseInt(kidIdParam, 10) : 1; // Default to kid ID 1

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
    notFound(); // Kid not found
  }

  // Flatten all entries from all goals for the main activity log table
  const allKidEntries = kidData.goals.flatMap((goal: { entries: any; }) => goal.entries);

  return <ILPClient kidName={kidData.name} goals={kidData.goals} activities={allKidEntries} />;
}
