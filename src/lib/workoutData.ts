export type ExerciseVisualKey =
  | "push"
  | "pull"
  | "legs"
  | "full-body"
  | "other";

export interface LibraryExercise {
  name: string;
  category: string;
  description: string;
  equipment: string;
  primaryMuscles: string[];
  coachingCues: string[];
  visualKey: ExerciseVisualKey;
}

export interface ExerciseLibraryDetails {
  description: string | null;
  category: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  coachingCues: string[];
  visualKey: ExerciseVisualKey;
  visualPath: string;
  accentColor: string;
  accentSoft: string;
}

export interface BuiltInPlan {
  slug: string;
  name: string;
  description: string;
  exerciseNames: string[];
}

const EXERCISE_VISUALS: Record<
  ExerciseVisualKey,
  {
    path: string;
    accentColor: string;
    accentSoft: string;
  }
> = {
  push: {
    path: "/exercise-visuals/push.svg",
    accentColor: "#c8ff00",
    accentSoft: "rgba(200, 255, 0, 0.18)",
  },
  pull: {
    path: "/exercise-visuals/pull.svg",
    accentColor: "#70e1ff",
    accentSoft: "rgba(112, 225, 255, 0.18)",
  },
  legs: {
    path: "/exercise-visuals/legs.svg",
    accentColor: "#ff8a3d",
    accentSoft: "rgba(255, 138, 61, 0.18)",
  },
  "full-body": {
    path: "/exercise-visuals/full-body.svg",
    accentColor: "#ff6b8a",
    accentSoft: "rgba(255, 107, 138, 0.18)",
  },
  other: {
    path: "/exercise-visuals/other.svg",
    accentColor: "#9c9c9c",
    accentSoft: "rgba(156, 156, 156, 0.18)",
  },
};

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  {
    name: "Barbell Bench Press",
    category: "Push",
    description: "Heavy horizontal press for chest, shoulders, and triceps.",
    equipment: "Barbell + bench",
    primaryMuscles: ["Chest", "Front delts", "Triceps"],
    coachingCues: ["Drive feet into the floor", "Lower to mid-chest"],
    visualKey: "push",
  },
  {
    name: "Incline Dumbbell Press",
    category: "Push",
    description: "Upper-chest focused press with a longer range of motion.",
    equipment: "Dumbbells + incline bench",
    primaryMuscles: ["Upper chest", "Front delts", "Triceps"],
    coachingCues: ["Keep wrists stacked", "Press up and slightly in"],
    visualKey: "push",
  },
  {
    name: "Overhead Press",
    category: "Push",
    description: "Standing shoulder press that builds pressing strength overhead.",
    equipment: "Barbell",
    primaryMuscles: ["Shoulders", "Triceps", "Upper chest"],
    coachingCues: ["Brace ribs down", "Move head through at lockout"],
    visualKey: "push",
  },
  {
    name: "Dumbbell Lateral Raise",
    category: "Push",
    description: "Isolation movement for the side delts and shoulder width.",
    equipment: "Dumbbells",
    primaryMuscles: ["Side delts", "Upper traps"],
    coachingCues: ["Lead with elbows", "Stop when shoulders take over"],
    visualKey: "push",
  },
  {
    name: "Cable Triceps Pushdown",
    category: "Push",
    description: "Triceps accessory for extra arm volume at the end of a push day.",
    equipment: "Cable machine",
    primaryMuscles: ["Triceps"],
    coachingCues: ["Pin elbows to your sides", "Finish with full extension"],
    visualKey: "push",
  },
  {
    name: "Pull-Up",
    category: "Pull",
    description: "Vertical pull for lats and upper back using bodyweight.",
    equipment: "Pull-up bar",
    primaryMuscles: ["Lats", "Upper back", "Biceps"],
    coachingCues: ["Start with shoulders packed", "Pull elbows to ribs"],
    visualKey: "pull",
  },
  {
    name: "Lat Pulldown",
    category: "Pull",
    description: "Machine-based vertical pull that trains the lats and upper back.",
    equipment: "Cable pulldown",
    primaryMuscles: ["Lats", "Upper back", "Biceps"],
    coachingCues: ["Lean back slightly", "Pull bar toward upper chest"],
    visualKey: "pull",
  },
  {
    name: "Barbell Row",
    category: "Pull",
    description: "Free-weight row for mid-back thickness and pulling strength.",
    equipment: "Barbell",
    primaryMuscles: ["Mid-back", "Lats", "Rear delts"],
    coachingCues: ["Hinge and stay braced", "Row toward lower ribs"],
    visualKey: "pull",
  },
  {
    name: "Seated Cable Row",
    category: "Pull",
    description: "Controlled horizontal pull for the mid-back and lats.",
    equipment: "Cable row",
    primaryMuscles: ["Mid-back", "Lats", "Biceps"],
    coachingCues: ["Stay tall through the torso", "Squeeze shoulder blades back"],
    visualKey: "pull",
  },
  {
    name: "Face Pull",
    category: "Pull",
    description: "Rear-delt and upper-back accessory that supports shoulder health.",
    equipment: "Cable rope",
    primaryMuscles: ["Rear delts", "Upper back", "Rotator cuff"],
    coachingCues: ["Pull to eye level", "Rotate thumbs behind you"],
    visualKey: "pull",
  },
  {
    name: "Barbell Curl",
    category: "Pull",
    description: "Classic biceps movement for elbow flexion strength and arm size.",
    equipment: "Barbell or EZ bar",
    primaryMuscles: ["Biceps", "Forearms"],
    coachingCues: ["Keep elbows still", "Control the lowering phase"],
    visualKey: "pull",
  },
  {
    name: "Back Squat",
    category: "Legs",
    description: "Primary squat pattern for quads, glutes, and overall leg strength.",
    equipment: "Barbell + rack",
    primaryMuscles: ["Quads", "Glutes", "Adductors"],
    coachingCues: ["Brace before each rep", "Drive knees over toes"],
    visualKey: "legs",
  },
  {
    name: "Romanian Deadlift",
    category: "Legs",
    description: "Hip hinge for hamstrings and glutes with a strong stretch focus.",
    equipment: "Barbell or dumbbells",
    primaryMuscles: ["Hamstrings", "Glutes", "Lower back"],
    coachingCues: ["Push hips back", "Keep the bar close to legs"],
    visualKey: "legs",
  },
  {
    name: "Leg Press",
    category: "Legs",
    description: "Machine press for high-volume quad and glute work.",
    equipment: "Leg press machine",
    primaryMuscles: ["Quads", "Glutes"],
    coachingCues: ["Keep lower back planted", "Control the bottom position"],
    visualKey: "legs",
  },
  {
    name: "Walking Lunge",
    category: "Legs",
    description: "Single-leg movement for quads, glutes, and stability.",
    equipment: "Dumbbells or bodyweight",
    primaryMuscles: ["Quads", "Glutes", "Adductors"],
    coachingCues: ["Take a long enough step", "Drop straight down between reps"],
    visualKey: "legs",
  },
  {
    name: "Leg Curl",
    category: "Legs",
    description: "Hamstring isolation for extra posterior-chain volume.",
    equipment: "Leg curl machine",
    primaryMuscles: ["Hamstrings"],
    coachingCues: ["Curl with control", "Pause briefly at the top"],
    visualKey: "legs",
  },
  {
    name: "Standing Calf Raise",
    category: "Legs",
    description: "Calf-focused movement for lower-leg strength and size.",
    equipment: "Calf raise machine",
    primaryMuscles: ["Calves"],
    coachingCues: ["Use a full stretch", "Pause at the top"],
    visualKey: "legs",
  },
  {
    name: "Deadlift",
    category: "Full Body",
    description: "Heavy pull from the floor that trains the full posterior chain.",
    equipment: "Barbell",
    primaryMuscles: ["Glutes", "Hamstrings", "Back"],
    coachingCues: ["Pull slack out of the bar", "Push the floor away"],
    visualKey: "full-body",
  },
  {
    name: "Front Squat",
    category: "Legs",
    description: "Quad-dominant squat variation with an upright torso position.",
    equipment: "Barbell + rack",
    primaryMuscles: ["Quads", "Upper back", "Glutes"],
    coachingCues: ["Keep elbows high", "Sit straight down"],
    visualKey: "legs",
  },
  {
    name: "Hip Thrust",
    category: "Legs",
    description: "Glute-focused movement with strong lockout emphasis.",
    equipment: "Barbell + bench",
    primaryMuscles: ["Glutes", "Hamstrings"],
    coachingCues: ["Tuck ribs down", "Pause at full lockout"],
    visualKey: "legs",
  },
  {
    name: "Dumbbell Row",
    category: "Pull",
    description: "Single-arm row for lats and upper back with easy setup.",
    equipment: "Dumbbell + bench",
    primaryMuscles: ["Lats", "Mid-back", "Rear delts"],
    coachingCues: ["Keep shoulders square", "Pull elbow toward hip"],
    visualKey: "pull",
  },
  {
    name: "Chest-Supported Row",
    category: "Pull",
    description: "Row variation that reduces lower-back fatigue while training the back.",
    equipment: "Bench + dumbbells or machine",
    primaryMuscles: ["Mid-back", "Lats", "Rear delts"],
    coachingCues: ["Stay glued to the pad", "Pause at the top"],
    visualKey: "pull",
  },
  {
    name: "Machine Chest Press",
    category: "Push",
    description: "Stable chest press for controlled volume and easy progression.",
    equipment: "Chest press machine",
    primaryMuscles: ["Chest", "Front delts", "Triceps"],
    coachingCues: ["Set seat to chest height", "Drive through the palms"],
    visualKey: "push",
  },
  {
    name: "Cable Fly",
    category: "Push",
    description: "Chest isolation movement with constant cable tension.",
    equipment: "Cable machine",
    primaryMuscles: ["Chest", "Front delts"],
    coachingCues: ["Keep a soft elbow bend", "Bring hands together smoothly"],
    visualKey: "push",
  },
  {
    name: "Goblet Squat",
    category: "Legs",
    description: "Dumbbell squat variation that is simple to learn and easy to load.",
    equipment: "Dumbbell or kettlebell",
    primaryMuscles: ["Quads", "Glutes", "Core"],
    coachingCues: ["Hold the weight high", "Stay tall through the torso"],
    visualKey: "legs",
  },
];

export const BUILT_IN_PLANS: BuiltInPlan[] = [
  {
    slug: "push",
    name: "Push",
    description: "Chest, shoulders, and triceps with a simple strength-to-hypertrophy flow.",
    exerciseNames: [
      "Barbell Bench Press",
      "Incline Dumbbell Press",
      "Overhead Press",
      "Dumbbell Lateral Raise",
      "Cable Triceps Pushdown",
    ],
  },
  {
    slug: "pull",
    name: "Pull",
    description: "Back and biceps focused session built around vertical and horizontal pulls.",
    exerciseNames: [
      "Pull-Up",
      "Barbell Row",
      "Seated Cable Row",
      "Face Pull",
      "Barbell Curl",
    ],
  },
  {
    slug: "legs",
    name: "Legs",
    description: "Lower-body day built around squat, hinge, and accessory volume.",
    exerciseNames: [
      "Back Squat",
      "Romanian Deadlift",
      "Leg Press",
      "Leg Curl",
      "Standing Calf Raise",
    ],
  },
  {
    slug: "upper",
    name: "Upper",
    description: "Balanced upper-body day with pressing, pulling, and accessory work.",
    exerciseNames: [
      "Barbell Bench Press",
      "Lat Pulldown",
      "Overhead Press",
      "Chest-Supported Row",
      "Cable Triceps Pushdown",
      "Barbell Curl",
    ],
  },
  {
    slug: "lower",
    name: "Lower",
    description: "Balanced lower-body day with quad, glute, hamstring, and calf work.",
    exerciseNames: [
      "Front Squat",
      "Romanian Deadlift",
      "Walking Lunge",
      "Leg Curl",
      "Standing Calf Raise",
    ],
  },
];

function normalizeLookup(value: string) {
  return value.trim().toLowerCase();
}

function inferVisualKey(category?: string | null): ExerciseVisualKey {
  const normalized = normalizeLookup(category ?? "");

  if (normalized.includes("push")) return "push";
  if (normalized.includes("pull")) return "pull";
  if (normalized.includes("leg")) return "legs";
  if (normalized.includes("full")) return "full-body";

  return "other";
}

export function getExerciseLibraryDetails(input: {
  name: string;
  category?: string | null;
  description?: string | null;
}): ExerciseLibraryDetails {
  const libraryExercise = findLibraryExercise(input.name);
  const visualKey =
    libraryExercise?.visualKey ?? inferVisualKey(libraryExercise?.category ?? input.category);
  const visual = EXERCISE_VISUALS[visualKey];

  return {
    description: libraryExercise?.description ?? input.description ?? null,
    category: libraryExercise?.category ?? input.category ?? null,
    equipment: libraryExercise?.equipment ?? null,
    primaryMuscles: libraryExercise?.primaryMuscles ?? [],
    coachingCues: libraryExercise?.coachingCues ?? [],
    visualKey,
    visualPath: visual.path,
    accentColor: visual.accentColor,
    accentSoft: visual.accentSoft,
  };
}

export function findLibraryExercise(name: string) {
  return EXERCISE_LIBRARY.find(
    (exercise) => normalizeLookup(exercise.name) === normalizeLookup(name)
  );
}

export function findBuiltInPlan(slug: string) {
  return BUILT_IN_PLANS.find((plan) => plan.slug === slug);
}
