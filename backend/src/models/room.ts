import { User } from './user';

export interface Room {
  id: string;
  name: string;
  creatorId: string;
  users: User[];
  maxUsers: number;
  isStarted: boolean;
  isFinished: boolean;
  password: string;
}

export interface RoomCreateRequest {
  name: string;
  maxUsers: number;
  password: string;
}

export interface RoomJoinRequest {
  roomId: string;
  user: User;
  password: string;
}

export interface RoomStartRequest {
  roomId: string;
  userId: string;
}

export interface RoomLeaveRequest {
  roomId: string;
  userId: string;
} 