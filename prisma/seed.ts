// File: kreativium-qq/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Seed Kid(s)
  const kid1 = await prisma.kid.create({
    data: { name: 'Alex' },
  });
  console.log(`Created kid with id: ${kid1.id}`);

  const kid2 = await prisma.kid.create({
    data: { name: 'Jamie' },
  });
  console.log(`Created kid with id: ${kid2.id}`);

  // Seed Goals for Kid1
  const goal1Kid1 = await prisma.goal.create({
    data: {
      title: 'Master Basic Addition',
      desc: 'Be able to solve addition problems up to 20.',
      targetXp: 100,
      pct: 25,
      kidId: kid1.id,
    },
  });
  console.log(`Created goal with id: ${goal1Kid1.id} for kid ${kid1.name}`);

  const goal2Kid1 = await prisma.goal.create({
    data: {
      title: 'Improve Reading Fluency',
      desc: 'Read a grade-level passage at 60 words per minute.',
      targetXp: 100,
      pct: 50,
      kidId: kid1.id,
    },
  });
  console.log(`Created goal with id: ${goal2Kid1.id} for kid ${kid1.name}`);

  // Seed Goals for Kid2
  const goal1Kid2 = await prisma.goal.create({
    data: {
      title: 'Learn Basic Spanish',
      desc: 'Identify 20 common Spanish words.',
      targetXp: 50,
      pct: 10,
      kidId: kid2.id,
    },
  });
  console.log(`Created goal with id: ${goal1Kid2.id} for kid ${kid2.name}`);

  // Seed Entries for Goal1Kid1
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

  // A standalone entry for Kid1 (not linked to a specific goal)
  // Note: Current schema requires entry to be linked to a goal.
  // If standalone entries are needed, schema.prisma needs to be updated.
  // For now, linking to a goal.
  await prisma.entry.create({
    data: {
      activity: 'Science Fair Project Brainstorming',
      subject: 'Science',
      status: 'PENDING',
      due: new Date('2025-06-15T00:00:00.000Z'),
      goalId: goal1Kid1.id, // Linking to an existing goal for now
    },
  });
  console.log(`Created standalone entry for goal ${goal1Kid1.id}`);

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
