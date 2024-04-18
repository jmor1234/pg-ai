const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function insertLabels() {
  try {
    await db.label.createMany({
      data: [
        {
          name: "No Label",
        },
        {
          name: "Chat History",
        },
        {
          name: "Currently Working on",
        },
        {
          name: "Current Challenges",
        },
        {
          name: "Background",
        },
        {
          name: "Curiosities and Considerations",
        },
        {
          name: "Long Term Goals",
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
