<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 | Updated: 2026-04-20 -->

# config（配置类）

## Purpose
Spring Boot 配置类集中管理，包含安全认证、ORM、缓存、序列化、定时任务、WebSocket、API 文档等框架级配置。

## Key Files

| File | Description |
|------|-------------|
| `SecurityConfig.java` | Spring Security 核心配置：JWT 无状态认证、CORS、路径权限、密码编码器 |
| `MyBatisPlusConfig.java` | MyBatis-Plus 配置：分页插件、自动填充处理器 |
| `RedisConfig.java` | Redis 序列化配置 |
| `JacksonConfig.java` | Jackson JSON 序列化配置 |
| `SchedulingConfig.java` | 定时任务线程池配置 |
| `WebSocketConfig.java` | WebSocket 端点配置 |
| `OpenApiConfig.java` | Swagger/OpenAPI 文档配置 |
| `DataInitializer.java` | 启动时种子数据初始化（创建默认家庭和管理员账户） |

## For AI Agents

### Working In This Directory
- 修改 SecurityConfig 需特别注意路径权限配置，避免误开放需认证的接口
- 新增公开接口（不需登录）需在 `SecurityConfig.securityFilterChain` 的 `requestMatchers` 中添加
- DataInitializer 仅在无 ADMIN 用户时执行初始化，幂等安全
- CORS 当前允许所有来源（`*`），生产环境应限制

### Dependencies
- 依赖 `security/` 包提供 JwtAuthenticationFilter、AuthenticationEntryPoint、AccessDeniedHandler
- 依赖 `module/auth/` 的 entity 和 mapper（DataInitializer 使用）
