// File: kreativium-qq/prisma/seed.ts
import { PrismaClient, ActivityStatus } from '../src/generated/prisma/index.js'; // Explicitly point to index.js

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Seed Goals
  const goal1 = await prisma.goal.create({
    data: {
      title: 'Master Basic Arithmetic',
      description: 'Be able to solve addition and subtraction problems up to 100.',
      currentProgress: 25,
    },
  });

  const goal2 = await prisma.goal.create({
    data: {
      title: 'Improve Reading Fluency',
      description: 'Read a grade-level passage at 60 words per minute.',
      currentProgress: 50,
    },
  });

  // Seed Activities
  await prisma.activity.create({
    data: {
      title: 'Addition Practice Worksheet 1-20',
      subject: 'Mathematics',
      status: ActivityStatus.COMPLETED,
      dueDate: new Date('2025-06-01T00:00:00.000Z'),
      goalId: goal1.id,
    },
  });

  await prisma.activity.create({
    data: {
      title: 'Subtraction Flashcards 1-50',
      subject: 'Mathematics',
      status: ActivityStatus.IN_PROGRESS,
      dueDate: new Date('2025-06-10T00:00:00.000Z'),
      goalId: goal1.id,
    },
  });

  await prisma.activity.create({
    data: {
      title: 'Read "The Cat in the Hat"',
      subject: 'Reading',
      status: ActivityStatus.PENDING,
      dueDate: new Date('2025-06-05T00:00:00.000Z'),
      goalId: goal2.id,
    },
  });
  
  await prisma.activity.create({
    data: {
      title: 'Independent Reading Time (15 mins)',
      subject: 'Reading',
      status: ActivityStatus.COMPLETED,
      dueDate: new Date('2025-05-20T00:00:00.000Z'), // Past due date
      goalId: goal2.id,
    },
  });

  // A standalone activity
   await prisma.activity.create({
    data: {
      title: 'Science Fair Project Brainstorming',
      subject: 'Science',
      status: ActivityStatus.PENDING,
      dueDate: new Date('2025-06-15T00:00:00.000Z'),
    },
  });


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
