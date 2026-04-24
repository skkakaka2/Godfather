# Family Hub Frontend

独立前端子工程，承接当前后端已有的认证、任务、积分和奖励商城接口。

## 技术栈

- Vite
- React + TypeScript
- React Router
- TanStack Query
- Ant Design
- Axios
- Zustand

## 启动

```bash
cd frontend
pnpm install
pnpm dev
```

默认读取 `.env` / `.env.local` 中的 `VITE_API_BASE_URL`。可参考 `.env.example`：

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## 页面骨架

- `/login` 登录页
- `/` 家庭概览
- `/tasks` 任务管理
- `/points` 积分流水
- `/rewards` 奖励商城
- `/redeem-orders` 兑换审批

## 已对齐的后端接口

- `POST /api/v1/auth/login`
- `GET /api/v1/users/me`
- `GET /api/v1/users/family/members`
- `GET /api/v1/tasks`
- `POST /api/v1/tasks/complete`
- `POST /api/v1/tasks/confirm`
- `POST /api/v1/tasks/reject`
- `GET /api/v1/store/points/balance`
- `GET /api/v1/store/points/logs`
- `GET /api/v1/store/rewards`
- `POST /api/v1/store/rewards`
- `PUT /api/v1/store/rewards/{id}`
- `DELETE /api/v1/store/rewards/{id}`
- `PUT /api/v1/store/rewards/{id}/toggle`
- `POST /api/v1/store/redeem`
- `GET /api/v1/store/redeem/orders`
- `POST /api/v1/store/redeem/{id}/approve`
- `POST /api/v1/store/redeem/{id}/reject`
