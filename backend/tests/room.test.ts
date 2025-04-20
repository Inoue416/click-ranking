import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoomService } from '../src/services/roomService';
import { User } from '../src/models/user';

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

describe('RoomService', () => {
  let roomService: RoomService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    roomService = new RoomService(mockEnv as any);
  });
  
  it('should create a room successfully', async () => {
    // モックの応答を設定
    const mockRoom = {
      id: 'room-123',
      name: 'Test Room',
      creatorId: 'user-1',
      users: [{ id: 'user-1', name: 'Test User' }],
      maxUsers: 4,
      isStarted: false,
      isFinished: false
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ room: mockRoom }),
    });
    
    const creator: User = { id: 'user-1', name: 'Test User' };
    const result = await roomService.createRoom({ name: 'Test Room', maxUsers: 4, password: 'secret' }, creator);
    
    expect(result).toEqual(mockRoom);
    expect(mockEnv.ROOM_DO.get).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith('https://dummy-url/create', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Room',
        maxUsers: 4,
        creator
      })
    });
  });
  
  it('should throw an error when room creation fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'Room creation failed',
    });
    
    const creator: User = { id: 'user-1', name: 'Test User' };
    
    await expect(
      roomService.createRoom({ name: 'Test Room', maxUsers: 4, password: 'secret' }, creator)
    ).rejects.toThrow('Failed to create room: Room creation failed');
  });
  
  // 他のテストケースも同様に実装
}); 