import { Context } from 'hono';
import { GameService } from '../services/gameService';
import { ClickUpdate } from '../models/game';

export class GameController {
  constructor(private gameService: GameService) {}

  async updateClickCount(c: Context): Promise<Response> {
    try {
      const roomId = c.req.param('roomId');
      const { userId, clickCount } = await c.req.json();
      
      const data: ClickUpdate = {
        roomId,
        userId,
        clickCount
      };

      const success = await this.gameService.updateClickCount(data);
      
      return c.json({ success });
    } catch (error) {
      console.error('Error updating click count:', error);
      return c.json({ success: false, error: (error as Error).message }, 500);
    }
  }
} 