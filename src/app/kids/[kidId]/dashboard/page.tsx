import prisma from '@/lib/prisma';
import KidDashboardClient from './KidDashboardClient';
import { notFound } from 'next/navigation';

export default async function KidDashboard({ params }: { params: Promise<{ kidId: string }> }) {
  const resolvedParams = await params;
  const kidIdParam = resolvedParams.kidId;
  const kidId = Number(kidIdParam);
  
  if (isNaN(kidId)) {
    notFound();
  }
  
  const kid = await prisma.kid.findUnique({
    where: { id: kidId },
    include: { goals: { orderBy: { createdAt: 'desc' } } },
  });
  
  if (!kid) {
    notFound();
  }
  
  return <KidDashboardClient kid={kid} />;
} 