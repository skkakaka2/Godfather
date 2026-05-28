export type PageResult<T> = {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
  timestamp: number;
};

export type Role = 'ADMIN' | 'PARENT' | 'CHILD' | string;

export type User = {
  id: string;
  familyId: string;
  username: string;
  nickname: string;
  avatar?: string | null;
  role: Role;
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
  id: string;
  familyId: string;
  userId: string;
  templateId?: string | null;
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
  userId?: string;
  taskDate?: string;
  status?: string;
};

export type TaskStreakSummary = {
  taskName: string | null;
  streakDays: number;
  latestConfirmedDate: string | null;
  nextMilestone: number | null;
  remainingToNextMilestone: number;
};

export type TaskTemplate = {
  id: string;
  name: string;
  category: string;
  icon?: string | null;
  defaultPoints: number;
  applicableSun: number;
  applicableMon: number;
  applicableTue: number;
  applicableWed: number;
  applicableThu: number;
  applicableFri: number;
  applicableSat: number;
  deadlineTime: string;
  sortOrder?: number | null;
  enabled: number;
};

export type TaskTemplatePayload = {
  name: string;
  category: string;
  icon?: string;
  defaultPoints: number;
  applicableSun: number;
  applicableMon: number;
  applicableTue: number;
  applicableWed: number;
  applicableThu: number;
  applicableFri: number;
  applicableSat: number;
  deadlineTime: string;
  sortOrder?: number;
  enabled: number;
};

export type PointLog = {
  id: string;
  familyId: string;
  userId: string;
  type: string;
  amount: number;
  balanceAfter: number;
  refId?: string | null;
  remark?: string | null;
  createdAt?: string | null;
};

export type PointLogFilter = {
  userId?: string;
  type?: string;
  page?: number;
  pageSize?: number;
};

export type EndorphinLog = {
  id: string;
  familyId: string;
  userId: string;
  type: string;
  amount: number;
  balanceAfter: number;
  refId?: string | null;
  remark?: string | null;
  createdAt?: string | null;
};

export type EndorphinLogFilter = {
  type?: string;
  page?: number;
  pageSize?: number;
};

export type Reward = {
  id: string;
  familyId: string;
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
  id: string;
  familyId: string;
  userId: string;
  rewardId: string;
  rewardName: string;
  pointsCost: number;
  status: string;
  remark?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RedeemOrderFilter = {
  userId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export type UserLevel = {
  userId: string;
  totalLevel: number;
  level: number;
  subLevel: number;
  title: string;
  exp: number;
  nextExpRequired: number | null;
  bonusPercent: number;
  dailySignBonus: number;
  streakShield: number;
  doubleCard: number;
  dailyChest: boolean;
  expBoost: number;
  redeemDiscount: number;
  avatarFrame: string | null;
  wishDiscount: number;
};

export type LevelConfig = {
  id: string;
  familyId: string;
  level: number;
  subLevel: number;
  title: string;
  expRequired: number;
  subReward: number;
  bonusPercent: number;
  dailySignBonus: number;
  streakShield: number;
  doubleCard: number;
  dailyChest: boolean;
  expBoost: number;
  redeemDiscount: number;
  avatarFrame: string | null;
  wishDiscount: number;
};

export type ChestResult = {
  points: number;
  exp: number;
};
