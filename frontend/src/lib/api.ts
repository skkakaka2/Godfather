import { get, post, put, remove } from "@/lib/http";
import type {
  ChestResult,
  DailyTask,
  DailyTaskFilter,
  EndorphinLog,
  EndorphinLogFilter,
  LevelConfig,
  LoginPayload,
  LoginResponse,
  PageResult,
  PointLog,
  PointLogFilter,
  RedeemOrder,
  RedeemOrderFilter,
  Reward,
  RewardPayload,
  RewardQuery,
  TaskTemplate,
  TaskTemplatePayload,
  User,
  UserLevel,
} from "@/lib/types";

export const authApi = {
  login(payload: LoginPayload) {
    return post<LoginResponse>("/api/v1/auth/login", payload);
  },
  register(payload: {
    username: string;
    password: string;
    nickname?: string;
    role?: string;
    familyId?: string;
  }) {
    return post<LoginResponse>("/api/v1/auth/register", payload);
  },
};

export const userApi = {
  me() {
    return get<User>("/api/v1/users/me");
  },
  familyMembers() {
    return get<User[]>("/api/v1/users/family/members");
  },
  updateUser(id: string, data: { nickname?: string; avatar?: string; role?: string }) {
    return put<User>(`/api/v1/users/${id}`, null, { params: data });
  },
};

export const taskApi = {
  list(filters: DailyTaskFilter = {}) {
    return get<DailyTask[]>("/api/v1/tasks", { params: filters });
  },
  complete(id: string, userId: string) {
    return post<void>("/api/v1/tasks/complete", { id, userId });
  },
  confirm(id: string, points?: number, remark?: string) {
    return post<void>("/api/v1/tasks/confirm", { id, points, remark });
  },
  reject(id: string, reason: string) {
    return post<void>("/api/v1/tasks/reject", { id, reason });
  },
};

export const templateApi = {
  list() {
    return get<TaskTemplate[]>("/api/v1/task-templates");
  },
  create(payload: TaskTemplatePayload) {
    return post<TaskTemplate>("/api/v1/task-templates", payload);
  },
  update(id: string, payload: TaskTemplatePayload) {
    return put<TaskTemplate>(`/api/v1/task-templates/${id}`, payload);
  },
  remove(id: string) {
    return remove<void>(`/api/v1/task-templates/${id}`);
  },
};

export const storeApi = {
  getBalance() {
    return get<number>("/api/v1/store/points/balance");
  },
  getPointLogs(filters: PointLogFilter = {}) {
    return get<PageResult<PointLog>>("/api/v1/store/points/logs", { params: filters });
  },
  getRewards(query: RewardQuery = {}) {
    return get<Reward[]>("/api/v1/store/rewards", { params: query });
  },
  createReward(payload: RewardPayload) {
    return post<Reward>("/api/v1/store/rewards", payload);
  },
  updateReward(id: string, payload: RewardPayload) {
    return put<Reward>(`/api/v1/store/rewards/${id}`, payload);
  },
  deleteReward(id: string) {
    return remove<void>(`/api/v1/store/rewards/${id}`);
  },
  toggleReward(id: string) {
    return put<void>(`/api/v1/store/rewards/${id}/toggle`);
  },
  redeem(rewardId: string) {
    return post<RedeemOrder>("/api/v1/store/redeem", { rewardId });
  },
  getRedeemOrders(filters: RedeemOrderFilter = {}) {
    return get<RedeemOrder[]>("/api/v1/store/redeem/orders", { params: filters });
  },
  getRedeemOrdersPaged(filters: RedeemOrderFilter = {}) {
    return get<PageResult<RedeemOrder>>("/api/v1/store/redeem/orders/paged", { params: filters });
  },
  approveRedeemOrder(id: string) {
    return post<void>(`/api/v1/store/redeem/${id}/approve`);
  },
  rejectRedeemOrder(id: string) {
    return post<void>(`/api/v1/store/redeem/${id}/reject`);
  },
  getEndorphinBalance() {
    return get<number>("/api/v1/store/endorphins/balance");
  },
  getEndorphinLogs(filters: EndorphinLogFilter = {}) {
    return get<PageResult<EndorphinLog>>("/api/v1/store/endorphins/logs", { params: filters });
  },
  exchangeEndorphins(amount: number) {
    return post<void>("/api/v1/store/endorphins/exchange", { amount });
  },
};

export const levelApi = {
  getInfo() {
    return get<UserLevel>("/api/v1/level/info");
  },
  dailySign() {
    return post<void>("/api/v1/level/sign");
  },
  openChest() {
    return post<ChestResult>("/api/v1/level/chest");
  },
  useDoubleCard() {
    return post<void>("/api/v1/level/double-card");
  },
  useWishDirect(rewardId: string) {
    return post<void>(`/api/v1/level/wish/${rewardId}`);
  },
  listConfigs() {
    return get<LevelConfig[]>("/api/v1/level/config");
  },
};
