// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { EXERCISE_LIBRARY } from "../src/lib/workoutData";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { id: "demo" },
    update: {},
    create: { id: "demo" },
  });

  await Promise.all(
    EXERCISE_LIBRARY.map((exercise) =>
      prisma.exercise.upsert({
        where: { name: exercise.name },
        update: {
          category: exercise.category,
          description: exercise.description,
          isLibrary: true,
        },
        create: {
          name: exercise.name,
          category: exercise.category,
          description: exercise.description,
          isLibrary: true,
        },
      })
    )
  );

  console.log("✅ Demo user and exercise library seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
