import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export const getRecommended = async () => {
  let userId;

  try {
    const self = await getSelf();
    userId = self?.id;

    if (userId) {
      const users = await db.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          NOT: {
            id: userId,
          },
        },
      });

      return users;
    }
  } catch {
    userId = null;
  }

  const users = await db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};
