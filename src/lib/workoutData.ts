export interface LibraryExercise {
  name: string;
  category: string;
  description: string;
}

export interface BuiltInPlan {
  slug: string;
  name: string;
  description: string;
  exerciseNames: string[];
}

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  {
    name: "Barbell Bench Press",
    category: "Push",
    description: "Heavy horizontal press for chest, shoulders, and triceps.",
  },
  {
    name: "Incline Dumbbell Press",
    category: "Push",
    description: "Upper-chest focused press with a longer range of motion.",
  },
  {
    name: "Overhead Press",
    category: "Push",
    description: "Standing shoulder press that builds pressing strength overhead.",
  },
  {
    name: "Dumbbell Lateral Raise",
    category: "Push",
    description: "Isolation movement for the side delts and shoulder width.",
  },
  {
    name: "Cable Triceps Pushdown",
    category: "Push",
    description: "Triceps accessory for extra arm volume at the end of a push day.",
  },
  {
    name: "Pull-Up",
    category: "Pull",
    description: "Vertical pull for lats and upper back using bodyweight.",
  },
  {
    name: "Lat Pulldown",
    category: "Pull",
    description: "Machine-based vertical pull that trains the lats and upper back.",
  },
  {
    name: "Barbell Row",
    category: "Pull",
    description: "Free-weight row for mid-back thickness and pulling strength.",
  },
  {
    name: "Seated Cable Row",
    category: "Pull",
    description: "Controlled horizontal pull for the mid-back and lats.",
  },
  {
    name: "Face Pull",
    category: "Pull",
    description: "Rear-delt and upper-back accessory that supports shoulder health.",
  },
  {
    name: "Barbell Curl",
    category: "Pull",
    description: "Classic biceps movement for elbow flexion strength and arm size.",
  },
  {
    name: "Back Squat",
    category: "Legs",
    description: "Primary squat pattern for quads, glutes, and overall leg strength.",
  },
  {
    name: "Romanian Deadlift",
    category: "Legs",
    description: "Hip hinge for hamstrings and glutes with a strong stretch focus.",
  },
  {
    name: "Leg Press",
    category: "Legs",
    description: "Machine press for high-volume quad and glute work.",
  },
  {
    name: "Walking Lunge",
    category: "Legs",
    description: "Single-leg movement for quads, glutes, and stability.",
  },
  {
    name: "Leg Curl",
    category: "Legs",
    description: "Hamstring isolation for extra posterior-chain volume.",
  },
  {
    name: "Standing Calf Raise",
    category: "Legs",
    description: "Calf-focused movement for lower-leg strength and size.",
  },
  {
    name: "Deadlift",
    category: "Full Body",
    description: "Heavy pull from the floor that trains the full posterior chain.",
  },
  {
    name: "Front Squat",
    category: "Legs",
    description: "Quad-dominant squat variation with an upright torso position.",
  },
  {
    name: "Hip Thrust",
    category: "Legs",
    description: "Glute-focused movement with strong lockout emphasis.",
  },
  {
    name: "Dumbbell Row",
    category: "Pull",
    description: "Single-arm row for lats and upper back with easy setup.",
  },
  {
    name: "Chest-Supported Row",
    category: "Pull",
    description: "Row variation that reduces lower-back fatigue while training the back.",
  },
  {
    name: "Machine Chest Press",
    category: "Push",
    description: "Stable chest press for controlled volume and easy progression.",
  },
  {
    name: "Cable Fly",
    category: "Push",
    description: "Chest isolation movement with constant cable tension.",
  },
  {
    name: "Goblet Squat",
    category: "Legs",
    description: "Dumbbell squat variation that is simple to learn and easy to load.",
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

export function findLibraryExercise(name: string) {
  return EXERCISE_LIBRARY.find(
    (exercise) => exercise.name.toLowerCase() === name.trim().toLowerCase()
  );
}

export function findBuiltInPlan(slug: string) {
  return BUILT_IN_PLANS.find((plan) => plan.slug === slug);
}
