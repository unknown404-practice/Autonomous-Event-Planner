import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
  const events = await prisma.event.count();
  const users = await prisma.user.count();
  const tasks = await prisma.task.count();
  const budgetItems = await prisma.budgetItem.count();
  const vendors = await prisma.vendorQuote.count();
  const guests = await prisma.guest.count();

  console.log({
    events,
    users,
    tasks,
    budgetItems,
    vendors,
    guests,
  });

  await prisma.$disconnect();
}

check();
