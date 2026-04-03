import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentViewer() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      isGuest: true,
      createdAt: true,
    },
  });
}

export async function requireCurrentViewer() {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    throw new Error("Unauthorized");
  }

  return viewer;
}
