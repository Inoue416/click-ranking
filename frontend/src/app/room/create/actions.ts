"use server";
import { createRoom } from "@/lib/api/roomClient";

export async function createRoomServerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const maxUsers = Number(formData.get("maxUsers"));
  try {
    const data = await createRoom({ name, password, maxUsers });
    return { success: true, roomId: data.room.id, userId: data.user.id, userName: data.user.name };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
} 