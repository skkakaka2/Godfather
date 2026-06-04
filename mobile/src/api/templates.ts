import {get, post, put, remove} from './client';
import type {TaskTemplate, TaskTemplatePayload} from '../types/domain';

export const templateApi = {
  list() {
    return get<TaskTemplate[]>('/api/v1/task-templates');
  },
  create(payload: TaskTemplatePayload) {
    return post<TaskTemplate>('/api/v1/task-templates', payload);
  },
  update(id: string, payload: TaskTemplatePayload) {
    return put<TaskTemplate>(`/api/v1/task-templates/${id}`, payload);
  },
  remove(id: string) {
    return remove<void>(`/api/v1/task-templates/${id}`);
  },
};
