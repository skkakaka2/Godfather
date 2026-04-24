export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
  timestamp: number;
};

export type User = {
  id: number;
  familyId: number;
  username: string;
  nickname: string;
  avatar?: string | null;
  role: string;
  gender?: number | null;
  birthDate?: string | null;
  points?: number | null;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
};

export type DailyTask = {
  id: number;
  familyId: number;
  userId: number;
  templateId?: number | null;
  taskDate: string;
  name: string;
  category?: string | null;
  icon?: string | null;
  points: number;
  deadlineTime?: string | null;
  sortOrder?: number | null;
  status: string;
  isTemp?: number | null;
  reminded?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type DailyTaskFilter = {
  userId?: number;
  taskDate?: string;
  status?: string;
};

export type PointLog = {
  id: number;
  familyId: number;
  userId: number;
  type: string;
  amount: number;
  balanceAfter: number;
  refId?: number | null;
  remark?: string | null;
  createdAt?: string | null;
};

export type PointLogFilter = {
  userId?: number;
  type?: string;
};

export type Reward = {
  id: number;
  familyId: number;
  name: string;
  description?: string | null;
  pointsPrice: number;
  imageUrl?: string | null;
  stock: number;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RewardPayload = {
  name: string;
  description?: string;
  pointsPrice: number;
  imageUrl?: string;
  stock: number;
};

export type RewardQuery = {
  status?: string;
};

export type RedeemOrder = {
  id: number;
  familyId: number;
  userId: number;
  rewardId: number;
  rewardName: string;
  pointsCost: number;
  status: string;
  remark?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RedeemOrderFilter = {
  userId?: number;
  status?: string;
};
