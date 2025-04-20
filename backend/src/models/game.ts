export interface UserScore {
  userId: string;
  userName: string;
  clickCount: number;
}

export interface GameResult {
  rankings: {
    rank: number;
    userId: string;
    userName: string;
    clickCount: number;
  }[];
}

export interface ClickUpdate {
  roomId: string;
  userId: string;
  clickCount: number;
} 