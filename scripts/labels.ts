const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function insertLabels() {
  try {
    await db.label.createMany({
      data: [
        {
          name: "Accountability",
        },
        {
          name: "Dailys",
        },
        {
          name: "Development",
        },
        {
          name: "Workouts",
        },
        {
          name: "Macro",
        },
        {
          name: "Reading",
        },
        {
          name: "No Label",
        },
      ],
    });
  } catch (error) {
    console.error("Error adding categories", error);
  } finally {
    await db.$disconnect();
  }
}

insertLabels();
