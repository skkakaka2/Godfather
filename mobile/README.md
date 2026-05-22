# Family Hub Mobile

React Native Android 客户端，作为现有 Web 前端的并行移动端入口，复用 Spring Boot 后端 REST API。

## 环境要求

- Node.js >= 22.11
- JDK 21
- Android Studio / Android SDK / adb
- Android 模拟器或已开启 USB 调试的真机

## 后端地址

移动端默认 API 地址在 `src/config/env.ts`：

```ts
export const API_BASE_URL = 'http://10.0.2.2:8080';
```

- Android 模拟器访问本机后端使用 `http://10.0.2.2:8080`
- 真机调试时改为电脑局域网 IP，例如 `http://192.168.x.x:8080`

## 启动

先启动后端服务，再在本目录运行：

```bash
npm start
```

另开终端运行 Android：

```bash
npm run android
```

## 验证

```bash
npx tsc --noEmit
npm run lint
```

## 已覆盖功能

- 登录与本地会话恢复
- 概览
- 突触管理
- 突触模板
- 血清素脉冲
- 自律等级
- 内啡肽脉冲
- 多巴胺商城
- 激发审批
- 居民管理
