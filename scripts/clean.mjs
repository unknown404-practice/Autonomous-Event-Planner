import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log("Cleaning EventPilot database: removing all events and dummy records...");

  await prisma.activityLog.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.vendorQuote.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.task.deleteMany();
  await prisma.budgetItem.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // Create clean organizer profile ready for real event planning
  const organizer = await prisma.user.create({
    data: {
      id: "usr_demo_organizer_01",
      email: "organizer@eventpilot.ai",
      name: "Event Planner",
      role: "ORGANIZER",
    },
  });

  console.log(`Clean database initialized. Organizer ready: ${organizer.name} (${organizer.id}).`);
  console.log("All dummy events and synthetic data removed successfully.");
}

cleanDatabase()
  .catch((e) => {
    console.error("Failed to clean database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
