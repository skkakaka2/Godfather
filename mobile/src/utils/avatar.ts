import {API_BASE_URL} from '../config/env';

export function resolveAvatarUrl(avatar?: string | null) {
  if (!avatar) {
    return null;
  }

  if (/^https?:\/\//i.test(avatar)) {
    return avatar;
  }

  if (avatar.startsWith('/')) {
    return `${API_BASE_URL}${avatar}`;
  }

  return avatar;
}
