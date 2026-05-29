import {get, post, put, remove} from './client';
import type {
  EndorphinLog,
  EndorphinLogFilter,
  PageResult,
  PointLog,
  PointLogFilter,
  RedeemOrder,
  RedeemOrderFilter,
  Reward,
  RewardPayload,
  RewardQuery,
} from '../types/domain';

export const storeApi = {
  getBalance() {
    return get<number>('/api/v1/store/points/balance');
  },
  getPointLogs(filters: PointLogFilter = {}) {
    return get<PageResult<PointLog>>('/api/v1/store/points/logs', {params: filters});
  },
  getRewards(query: RewardQuery = {}) {
    return get<Reward[]>('/api/v1/store/rewards', {params: query});
  },
  createReward(payload: RewardPayload) {
    return post<Reward>('/api/v1/store/rewards', payload);
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
  redeem(payload: {rewardId?: string; activityId?: string}) {
    return post<RedeemOrder>('/api/v1/store/redeem', payload);
  },
  getRedeemOrders(filters: RedeemOrderFilter = {}) {
    return get<RedeemOrder[]>('/api/v1/store/redeem/orders', {params: filters});
  },
  getRedeemOrdersPaged(filters: RedeemOrderFilter = {}) {
    return get<PageResult<RedeemOrder>>('/api/v1/store/redeem/orders/paged', {params: filters});
  },
  approveRedeemOrder(id: string) {
    return post<void>(`/api/v1/store/redeem/${id}/approve`);
  },
  rejectRedeemOrder(id: string) {
    return post<void>(`/api/v1/store/redeem/${id}/reject`);
  },
  getEndorphinBalance() {
    return get<number>('/api/v1/store/endorphins/balance');
  },
  getEndorphinLogs(filters: EndorphinLogFilter = {}) {
    return get<PageResult<EndorphinLog>>('/api/v1/store/endorphins/logs', {params: filters});
  },
  exchangeEndorphins(amount: number) {
    return post<void>('/api/v1/store/endorphins/exchange', {amount});
  },
};
