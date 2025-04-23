"use server";
import { joinRoom } from "@/lib/api/roomClient";

export async function joinRoomServerAction(formData: FormData) {
  const roomId = formData.get("roomId") as string;
  const userName = formData.get("userName") as string;
  const password = formData.get("password") as string;
  try {
    const data = await joinRoom({ roomId, userName, password });
    return { success: true, roomId: data.room.id, userId: data.user.id, userName: data.user.name };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
} 