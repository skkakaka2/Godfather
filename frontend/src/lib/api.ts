import { get, post, put, remove } from "@/lib/http";
import type {
  DailyTask,
  DailyTaskFilter,
  LoginPayload,
  LoginResponse,
  PointLog,
  PointLogFilter,
  RedeemOrder,
  RedeemOrderFilter,
  Reward,
  RewardPayload,
  RewardQuery,
  User,
} from "@/lib/types";

export const authApi = {
  login(payload: LoginPayload) {
    return post<LoginResponse>("/api/v1/auth/login", payload);
  },
};

export const userApi = {
  me() {
    return get<User>("/api/v1/users/me");
  },
  familyMembers() {
    return get<User[]>("/api/v1/users/family/members");
  },
};

export const taskApi = {
  list(filters: DailyTaskFilter = {}) {
    return get<DailyTask[]>("/api/v1/tasks", { params: filters });
  },
  complete(id: number, userId: number) {
    return post<void>("/api/v1/tasks/complete", { id, userId });
  },
  confirm(id: number, points?: number, remark?: string) {
    return post<void>("/api/v1/tasks/confirm", { id, points, remark });
  },
  reject(id: number, reason: string) {
    return post<void>("/api/v1/tasks/reject", { id, reason });
  },
};

export const storeApi = {
  getBalance() {
    return get<number>("/api/v1/store/points/balance");
  },
  getPointLogs(filters: PointLogFilter = {}) {
    return get<PointLog[]>("/api/v1/store/points/logs", { params: filters });
  },
  getRewards(query: RewardQuery = {}) {
    return get<Reward[]>("/api/v1/store/rewards", { params: query });
  },
  createReward(payload: RewardPayload) {
    return post<Reward>("/api/v1/store/rewards", payload);
  },
  updateReward(id: number, payload: RewardPayload) {
    return put<Reward>(`/api/v1/store/rewards/${id}`, payload);
  },
  deleteReward(id: number) {
    return remove<void>(`/api/v1/store/rewards/${id}`);
  },
  toggleReward(id: number) {
    return put<void>(`/api/v1/store/rewards/${id}/toggle`);
  },
  redeem(rewardId: number) {
    return post<RedeemOrder>("/api/v1/store/redeem", { rewardId });
  },
  getRedeemOrders(filters: RedeemOrderFilter = {}) {
    return get<RedeemOrder[]>("/api/v1/store/redeem/orders", { params: filters });
  },
  approveRedeemOrder(id: number) {
    return post<void>(`/api/v1/store/redeem/${id}/approve`);
  },
  rejectRedeemOrder(id: number) {
    return post<void>(`/api/v1/store/redeem/${id}/reject`);
  },
};
