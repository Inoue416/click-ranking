import { ClickUpdate } from '../models/game';

export class GameService {
  constructor(private env: Env) {}

  async updateClickCount(data: ClickUpdate): Promise<boolean> {
    const stub = this.env.ROOM_DO.get(this.env.ROOM_DO.idFromName(data.roomId));
    
    const url = 'http://dummy/click';
    const response = await stub.fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        userId: data.userId,
        clickCount: data.clickCount
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update click count: ${await response.text()}`);
    }

    const result = await response.json() as { success: boolean };
    return result.success;
  }
} 