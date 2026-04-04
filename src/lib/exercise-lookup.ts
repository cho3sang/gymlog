export function normalizeExerciseName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeLookup(value: string) {
  return normalizeExerciseName(value).toLowerCase();
}

export function getLibraryExerciseLookupKey(name: string) {
  return `library:${normalizeLookup(name)}`;
}

export function getUserExerciseLookupKey(userId: string, name: string) {
  return `user:${userId}:${normalizeLookup(name)}`;
}
