// File: kreativium-qq/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Upsert kids to ensure idempotency
  const kid1 = await prisma.kid.upsert({
    where: { name: 'Alex' },
    update: {},
    create: { name: 'Alex' },
  });
  console.log(`Upserted kid with id: ${kid1.id}`);

  const kid2 = await prisma.kid.upsert({
    where: { name: 'Jamie' },
    update: {},
    create: { name: 'Jamie' },
  });
  console.log(`Upserted kid with id: ${kid2.id}`);

  // Only seed demo goals if explicitly requested
  if (process.env.SEED_DEMO_DATA === 'true') {
    // Seed Goals for Kid1
    const goal1Kid1 = await prisma.goal.upsert({
      where: {
        id: -1, // Non-existent ID forces create
      },
      create: {
        title: 'Master Basic Addition',
        desc: 'Be able to solve addition problems up to 20.',
        targetXp: 100,
        pct: 25,
        kidId: kid1.id,
      },
      update: {},
    });
    console.log(`Upserted goal with id: ${goal1Kid1.id} for kid ${kid1.name}`);

    const goal2Kid1 = await prisma.goal.upsert({
      where: {
        id: -2, // Non-existent ID forces create
      },
      create: {
        title: 'Improve Reading Fluency',
        desc: 'Read a grade-level passage at 60 words per minute.',
        targetXp: 100,
        pct: 50,
        kidId: kid1.id,
      },
      update: {},
    });
    console.log(`Upserted goal with id: ${goal2Kid1.id} for kid ${kid1.name}`);

    // Seed Goals for Kid2
    const goal1Kid2 = await prisma.goal.upsert({
      where: {
        id: -3, // Non-existent ID forces create
      },
      create: {
        title: 'Learn Basic Spanish',
        desc: 'Identify 20 common Spanish words.',
        targetXp: 50,
        pct: 10,
        kidId: kid2.id,
      },
      update: {},
    });
    console.log(`Upserted goal with id: ${goal1Kid2.id} for kid ${kid2.name}`);

    // Seed Entries only if demo data is enabled
    await prisma.entry.create({
      data: {
        activity: 'Addition Worksheet 1-20',
        subject: 'Mathematics',
        status: 'COMPLETED',
        due: new Date('2025-06-01T00:00:00.000Z'),
        goalId: goal1Kid1.id,
      },
    });
    console.log(`Created entry for goal ${goal1Kid1.id}`);

    await prisma.entry.create({
      data: {
        activity: 'Subtraction Flashcards 1-50',
        subject: 'Mathematics',
        status: 'IN_PROGRESS',
        due: new Date('2025-06-10T00:00:00.000Z'),
        goalId: goal1Kid1.id,
      },
    });
    console.log(`Created entry for goal ${goal1Kid1.id}`);

    // Seed Entries for Goal2Kid1
    await prisma.entry.create({
      data: {
        activity: 'Read "The Cat in the Hat"',
        subject: 'Reading',
        status: 'PENDING',
        due: new Date('2025-06-05T00:00:00.000Z'),
        goalId: goal2Kid1.id,
      },
    });
    console.log(`Created entry for goal ${goal2Kid1.id}`);
    
    await prisma.entry.create({
      data: {
        activity: 'Independent Reading Time (15 mins)',
        subject: 'Reading',
        status: 'COMPLETED',
        due: new Date('2025-05-20T00:00:00.000Z'),
        goalId: goal2Kid1.id,
      },
    });
    console.log(`Created entry for goal ${goal2Kid1.id}`);

    // Add completed goals for testing rewards
    const completedGoal1 = await prisma.goal.upsert({
      where: {
        id: -4, // Non-existent ID forces create
      },
      create: {
        title: 'Complete 10 Math Problems',
        desc: 'Successfully solved 10 math problems',
        targetXp: 50,
        pct: 100, // Completed!
        kidId: kid1.id,
      },
      update: {},
    });
    console.log(`Upserted completed goal with id: ${completedGoal1.id} for kid ${kid1.name}`);

    const completedGoal2 = await prisma.goal.upsert({
      where: {
        id: -5, // Non-existent ID forces create
      },
      create: {
        title: 'Finish Reading Book',
        desc: 'Read entire beginner book',
        targetXp: 75,
        pct: 100, // Completed!
        kidId: kid2.id,
      },
      update: {},
    });
    console.log(`Upserted completed goal with id: ${completedGoal2.id} for kid ${kid2.name}`);
  }

  // Backfill stars based on completed goals (idempotent)
  const { totalKids, totalStars } = await prisma.$transaction(async (tx) => {
    const kids = await tx.kid.findMany({
      include: {
        goals: true,
      },
    });

    let totalKidsUpdated = 0;
    let totalStarsAwarded = 0;
    
    for (const kid of kids) {
      const completedGoalsCount = kid.goals.filter(g => g.pct === 100).length;
      
      // Always update to ensure idempotency
      await tx.kid.update({
        where: { id: kid.id },
        data: { stars: completedGoalsCount },
      });
      
      if (completedGoalsCount > 0) {
        console.log(`Set ${kid.name} to ${completedGoalsCount} stars`);
        totalKidsUpdated++;
      }
      
      totalStarsAwarded += completedGoalsCount;
    }
    
    return { totalKids: totalKidsUpdated, totalStars: totalStarsAwarded };
  });
  
  console.log(`Awarded ⭐ ${totalStars} total stars across ${totalKids} kids`);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
