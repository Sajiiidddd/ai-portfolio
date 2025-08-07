// src/lib/getUserId.ts
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export function getOrCreateUserId(): string {
  const cookieStore = cookies();
  let userId = cookieStore.get("userId")?.value;

  if (!userId) {
    userId = uuidv4();
    cookieStore.set("userId", userId, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return userId;
}

