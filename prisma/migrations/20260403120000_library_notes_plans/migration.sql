-- AlterTable
ALTER TABLE "Exercise"
ADD COLUMN "category" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "isLibrary" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SessionExercise"
ADD COLUMN "notes" TEXT;

-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlanExercise" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "WorkoutPlanExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutPlan_userId_name_key" ON "WorkoutPlan"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutPlanExercise_planId_exerciseId_key" ON "WorkoutPlanExercise"("planId", "exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutPlanExercise_planId_sortOrder_key" ON "WorkoutPlanExercise"("planId", "sortOrder");

-- AddForeignKey
ALTER TABLE "WorkoutPlan"
ADD CONSTRAINT "WorkoutPlan_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanExercise"
ADD CONSTRAINT "WorkoutPlanExercise_planId_fkey"
FOREIGN KEY ("planId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanExercise"
ADD CONSTRAINT "WorkoutPlanExercise_exerciseId_fkey"
FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
