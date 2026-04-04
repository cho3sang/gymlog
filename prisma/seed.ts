// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { getLibraryExerciseLookupKey } from "../src/lib/exercise-lookup";
import { EXERCISE_LIBRARY } from "../src/lib/workoutData";

const prisma = new PrismaClient();

async function main() {
  await Promise.all(
    EXERCISE_LIBRARY.map((exercise) =>
      prisma.exercise.upsert({
        where: { lookupKey: getLibraryExerciseLookupKey(exercise.name) },
        update: {
          name: exercise.name,
          category: exercise.category,
          description: exercise.description,
          isLibrary: true,
        },
        create: {
          name: exercise.name,
          lookupKey: getLibraryExerciseLookupKey(exercise.name),
          category: exercise.category,
          description: exercise.description,
          isLibrary: true,
        },
      })
    )
  );

  console.log("✅ Exercise library seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
