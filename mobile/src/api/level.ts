import {get, post} from './client';
import type {ChestResult, LevelConfig, UserLevel} from '../types/domain';

export const levelApi = {
  getInfo() {
    return get<UserLevel>('/api/v1/level/info');
  },
  dailySign() {
    return post<void>('/api/v1/level/sign');
  },
  openChest() {
    return post<ChestResult>('/api/v1/level/chest');
  },
  useDoubleCard() {
    return post<void>('/api/v1/level/double-card');
  },
  useWishDirect(rewardId: string) {
    return post<void>(`/api/v1/level/wish/${rewardId}`);
  },
  listConfigs() {
    return get<LevelConfig[]>('/api/v1/level/config');
  },
};
