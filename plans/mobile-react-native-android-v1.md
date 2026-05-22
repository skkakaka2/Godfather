# React Native Android 移动端开发方案 V1

## 1. 目标与范围

本方案用于在仓库根目录新增 `mobile/`，使用 React Native CLI + TypeScript 开发 Android App。移动端作为现有 Web 前端的并行客户端，不迁移、不替换 `frontend/`，也不改动 Spring Boot 后端接口契约。

V1 功能范围对齐当前 `frontend/` 已实现的页面和接口：

- 登录
- 概览
- 突触管理
- 突触模板
- 血清素脉冲
- 自律等级
- 内啡肽脉冲
- 多巴胺商城
- 激发审批
- 居民管理

暂不纳入 `family-hub-requirements.md` 中尚未在 Web 端落地的口算、阅读管理、成长记录、家庭日历等长期模块。

## 2. 技术选型

采用 React Native CLI，而不是 Expo。

原因：

- 当前目标是 Android App，RN CLI 更贴近原生 Android 工程。
- 后续如需配置包名、签名、权限、原生模块、正式打包，上手路径更直接。
- 项目已有 React + TypeScript 前端，移动端可以复用现有类型、接口分层和 React Query 心智模型。

建议基础依赖：

- `react-native`
- `typescript`
- `@react-navigation/native`
- `@react-navigation/native-stack`
- `@react-navigation/bottom-tabs`
- `@tanstack/react-query`
- `axios`
- `zustand`
- `react-native-keychain`
- `react-native-safe-area-context`
- `react-native-screens`
- `react-native-gesture-handler`
- `react-native-vector-icons` 或 RN 社区常用图标库

初始化命令：

```bash
npx @react-native-community/cli@latest init mobile
```

后续运行命令：

```bash
cd mobile
npm start
npm run android
```

Android 本机后端访问约定：

- Android 模拟器访问宿主机后端：`http://10.0.2.2:8080`
- Android 真机访问后端：使用电脑局域网 IP，例如 `http://192.168.x.x:8080`

## 3. 架构设计

建议目录结构：

```text
mobile/
  android/
  src/
    api/
      client.ts
      auth.ts
      users.ts
      tasks.ts
      templates.ts
      store.ts
      level.ts
    components/
    config/
      env.ts
    navigation/
      AppNavigator.tsx
      AuthNavigator.tsx
      MainTabs.tsx
      ManagementStack.tsx
    screens/
      auth/
      dashboard/
      tasks/
      templates/
      points/
      level/
      endorphins/
      rewards/
      redeemOrders/
      users/
    store/
      authStore.ts
    theme/
    types/
      api.ts
      domain.ts
    utils/
  App.tsx
```

核心分层：

- `api/`：复刻 `frontend/src/lib/api.ts` 的接口边界，统一走 `client.ts`。
- `types/`：从 `frontend/src/lib/types.ts` 平移领域类型，保持字段与后端响应一致。
- `store/authStore.ts`：管理 `accessToken`、`refreshToken`、当前用户和退出登录。
- `navigation/`：处理登录态路由、底部导航、管理页面栈和角色可见性。
- `screens/`：页面级实现，不复用 Web 的 Ant Design 表格布局，改为移动端卡片、列表、表单和弹窗。

HTTP 规则：

- 后端响应仍按 `R<T>` 处理。
- `code === 200` 时返回 `data`。
- 非 200 或网络异常统一转成可展示错误信息。
- 请求拦截器自动附加 `Authorization: Bearer ${accessToken}`。
- 收到 401 后清理本地会话并跳回登录页。

会话存储：

- Token 使用 `react-native-keychain` 或同等安全存储。
- 用户基础信息可随 token 一起持久化，也可以启动后调用 `/api/v1/users/me` 刷新。
- App 启动时先恢复会话，再决定进入登录页或主页面。

## 4. 页面与功能映射

### 登录

对应 Web：`frontend/src/pages/LoginPage.tsx`

接口：

- `POST /api/v1/auth/login`
- `GET /api/v1/users/me`

行为：

- 输入用户名、密码。
- 登录成功后保存 token 和当前用户。
- 登录失败展示后端错误信息。

### 概览

对应 Web：`frontend/src/pages/DashboardPage.tsx`

接口：

- `GET /api/v1/users/family/members`
- `GET /api/v1/tasks`
- `GET /api/v1/store/points/balance`
- `GET /api/v1/store/rewards`
- `GET /api/v1/store/redeem/orders`

移动端展示：

- 顶部用户与等级摘要。
- 今日突触统计卡片。
- 今日突触列表。
- 家庭成员简表。
- 上架奖励与最近兑换订单摘要。

### 突触管理

对应 Web：`frontend/src/pages/TasksPage.tsx`

接口：

- `GET /api/v1/tasks`
- `POST /api/v1/tasks/complete`
- `POST /api/v1/tasks/confirm`
- `POST /api/v1/tasks/reject`
- `GET /api/v1/users/family/members`

移动端展示：

- 日期、成员、状态筛选。
- 任务卡片列表。
- 孩子角色可执行完成操作。
- 家长/管理员可执行确认、打回。

### 突触模板

对应 Web：`frontend/src/pages/TaskTemplatesPage.tsx`

接口：

- `GET /api/v1/task-templates`
- `POST /api/v1/task-templates`
- `PUT /api/v1/task-templates/{id}`
- `DELETE /api/v1/task-templates/{id}`

移动端展示：

- 模板卡片列表。
- 新建/编辑表单使用底部弹层或独立页面。
- 星期适用规则使用复选项。

### 血清素脉冲

对应 Web：`frontend/src/pages/PointsPage.tsx`

接口：

- `GET /api/v1/store/points/balance`
- `GET /api/v1/store/points/logs`
- `GET /api/v1/users/family/members`

移动端展示：

- 当前余额。
- 收入/支出统计。
- 流水分页列表。

### 自律等级

对应 Web：`frontend/src/pages/LevelPage.tsx`

接口：

- `GET /api/v1/level/info`
- `POST /api/v1/level/sign`
- `POST /api/v1/level/chest`
- `POST /api/v1/level/double-card`
- `GET /api/v1/level/config`

移动端展示：

- 当前等级、经验进度、称号。
- 每日签到、开宝箱、使用翻倍卡。
- 当前特权与等级总览。

### 内啡肽脉冲

对应 Web：`frontend/src/pages/EndorphinsPage.tsx`

接口：

- `GET /api/v1/store/endorphins/balance`
- `GET /api/v1/store/endorphins/logs`
- `POST /api/v1/store/endorphins/exchange`

移动端展示：

- 当前余额。
- 兑换入口。
- 流水分页列表。

### 多巴胺商城

对应 Web：`frontend/src/pages/RewardsPage.tsx`

接口：

- `GET /api/v1/store/rewards`
- `POST /api/v1/store/rewards`
- `PUT /api/v1/store/rewards/{id}`
- `DELETE /api/v1/store/rewards/{id}`
- `PUT /api/v1/store/rewards/{id}/toggle`
- `POST /api/v1/store/redeem`
- `GET /api/v1/store/redeem/orders/paged`

移动端展示：

- 奖励商品卡片。
- 孩子可申请兑换。
- 家长/管理员可新建、编辑、上下架、删除。
- 展示我的最近兑换记录。

### 激发审批

对应 Web：`frontend/src/pages/RedeemOrdersPage.tsx`

接口：

- `GET /api/v1/store/redeem/orders/paged`
- `POST /api/v1/store/redeem/{id}/approve`
- `POST /api/v1/store/redeem/{id}/reject`
- `GET /api/v1/users/family/members`

移动端展示：

- 订单状态和成员筛选。
- 订单卡片列表。
- 家长/管理员可审批通过或拒绝。

### 居民管理

对应 Web：`frontend/src/pages/UsersPage.tsx`

接口：

- `GET /api/v1/users/family/members`
- `POST /api/v1/auth/register`
- `PUT /api/v1/users/{id}`

移动端展示：

- 家庭成员列表。
- 新增居民。
- 编辑昵称、头像、角色。

## 5. 导航与权限

登录后按角色控制入口：

- `ADMIN` / `PARENT`：概览、突触管理、突触模板、血清素脉冲、自律等级、内啡肽脉冲、多巴胺商城、激发审批、居民管理。
- `CHILD`：突触管理、血清素脉冲、自律等级、内啡肽脉冲、多巴胺商城。

建议移动端导航：

- Bottom Tabs：概览、突触、血清素、等级、商城、我的。
- “我的” 页面或管理栈中放置：突触模板、内啡肽、激发审批、居民管理、退出登录。
- 如果角色没有权限，对应入口不展示；如果通过深链进入无权限页面，则展示无权限提示并返回首页。

## 6. 实施步骤

### Step 1：创建方案文档

创建本文档：

```text
plans/mobile-react-native-android-v1.md
```

只新增文档，不改代码。

### Step 2：初始化移动端工程

在仓库根目录执行：

```bash
npx @react-native-community/cli@latest init mobile
```

初始化后检查：

- `mobile/package.json`
- `mobile/android/`
- `mobile/App.tsx`
- `mobile/tsconfig.json`

如果 CLI 生成失败，先记录 Node、JDK、Android SDK、网络错误，不手写 RN 原生工程替代。

### Step 3：搭建基础设施

实现：

- API Client
- 响应解包与错误处理
- Token 注入与 401 清理
- Auth Store
- QueryClient Provider
- Navigation 容器
- 基础主题、按钮、卡片、空状态、加载态组件

验收：

- App 可启动。
- 登录态缺失时进入登录页。
- 登录成功后进入主页面。
- 重启 App 后可恢复会话。

### Step 4：迁移核心功能

优先顺序：

1. 登录与用户信息
2. 概览
3. 突触管理
4. 血清素脉冲
5. 多巴胺商城

这一阶段要保证孩子端能完成任务、查看积分、申请兑换。

### Step 5：迁移管理功能

继续实现：

1. 突触模板
2. 自律等级
3. 内啡肽脉冲
4. 激发审批
5. 居民管理

这一阶段要保证家长/管理员能维护模板、审批订单、管理居民。

### Step 6：Android 适配与文档

补充：

- `mobile/README.md`
- Android 后端地址配置说明
- 模拟器/真机运行说明
- 常见环境问题说明

## 7. 验证方案

静态验证：

```bash
cd mobile
npm run lint
npx tsc --noEmit
```

运行验证：

```bash
cd mobile
npm start
npm run android
```

后端联调验证：

- 登录成功后能获取 `/api/v1/users/me`。
- 任务列表能按日期、成员、状态筛选。
- 孩子角色能完成任务。
- 家长/管理员能确认或打回任务。
- 积分余额、积分流水展示正确。
- 商城奖励能展示并提交兑换。
- 家长/管理员能审批兑换订单。
- 退出登录后 token 被清理，再打开 App 回到登录页。

角色验证：

- `ADMIN`：可访问所有页面。
- `PARENT`：可访问管理页面和审批操作。
- `CHILD`：不可看到模板、审批、居民管理入口。

环境验证说明：

- 如果 `npm run android` 因 Android SDK、JDK、Gradle、adb 或网络失败而中断，记录为环境问题。
- 环境问题不等同于业务代码失败；需要保留具体命令输出和缺失项。

## 8. 风险与处理

### Android 环境风险

React Native CLI 需要 Node、JDK、Android Studio、Android SDK、adb、Gradle 环境完整。若本机 Android 环境不完整，可能无法完成安装运行验证。

处理：

- 先执行环境检查。
- 能静态验证就先静态验证。
- 不能真机运行时明确记录阻塞点。

### 后端地址风险

移动端不能直接使用 Web 的 `localhost:8080` 语义。

处理：

- Android 模拟器默认使用 `10.0.2.2:8080`。
- 真机使用局域网 IP。
- 后续可通过 `.env` 或 `src/config/env.ts` 管理环境地址。

### Web 表格迁移风险

Web 端部分页面使用表格、抽屉、弹窗。移动端照搬会难用。

处理：

- 表格改为卡片列表。
- 筛选放顶部紧凑区域。
- 表单放底部弹层或独立页面。
- 危险操作使用确认弹窗。

### 接口字段漂移风险

移动端如果手写类型，可能和 Web、后端不一致。

处理：

- 首版从 `frontend/src/lib/types.ts` 平移类型。
- 接口路径从 `frontend/src/lib/api.ts` 平移。
- 不新增后端契约。

## 9. 明确不做

V1 不做：

- 不迁移或删除 `frontend/`。
- 不引入 Expo。
- 不实现 iOS。
- 不改后端接口。
- 不实现 Web 尚未落地的长期需求模块。
- 不添加大型状态管理或 UI 框架，除非后续移动端复杂度证明有必要。

## 10. 成功标准

- 仓库中存在可独立运行的 `mobile/` React Native Android 工程。
- Android App 能完成当前 Web 端已实现的主要家庭管理流程。
- 移动端与 Web 共用同一套后端接口和认证模型。
- 不影响现有 Spring Boot 后端和 `frontend/` Web 工程。
- 文档中保留启动、联调、验证和环境排障路径。
