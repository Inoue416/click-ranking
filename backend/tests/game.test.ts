import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService } from '../src/services/gameService';

// モックの作成
const mockFetch = vi.fn();
const mockEnv = {
  ROOM_DO: {
    get: vi.fn().mockReturnValue({
      fetch: mockFetch
    }),
    idFromName: vi.fn().mockImplementation((id) => id)
  }
};

describe('GameService', () => {
  let gameService: GameService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    gameService = new GameService(mockEnv as any);
  });
  
  it('should update click count successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    
    const result = await gameService.updateClickCount({
      roomId: 'room-123',
      userId: 'user-1',
      clickCount: 10
    });
    
    expect(result).toBe(true);
    expect(mockEnv.ROOM_DO.get).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith('https://dummy-url/click', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user-1',
        clickCount: 10
      })
    });
  });
  
  it('should throw an error when update fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Update failed',
    });
    
    await expect(
      gameService.updateClickCount({
        roomId: 'room-123',
        userId: 'user-1',
        clickCount: 10
      })
    ).rejects.toThrow('Failed to update click count: Update failed');
  });
});
