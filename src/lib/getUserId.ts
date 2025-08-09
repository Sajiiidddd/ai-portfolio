// src/lib/getUserId.ts
import { v4 as uuidv4 } from "uuid";
import { cookies } from 'next/headers';

export async function getOrCreateUserId(): Promise<string> {
  const cookieStore = await cookies();
  let userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    userId = uuidv4();
  }

  return userId;
}


