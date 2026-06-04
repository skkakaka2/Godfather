<!-- Generated: 2026-04-20 | Updated: 2026-04-20 -->

# Family Hub（家庭小助手）

## Purpose
面向家有小学低年级儿童的家庭管理应用后端。基于 Spring Boot 3.4 + Java 21 构建，提供口算练习、任务打卡、积分奖励、阅读管理、成长记录、家庭日历六大功能模块。当前处于 Phase 1 开发阶段，已完成技术基座（认证、公共组件、配置）和任务模块数据库设计。

## Key Files

| File | Description |
|------|-------------|
| `pom.xml` | Maven 项目配置，定义依赖和构建插件 |
| `family-hub-requirements.md` | 完整需求规格文档，包含 6 大模块详细需求 |
| `.gitignore` | Git 忽略规则 |
| `README.md` | 项目说明 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `docs/` | 项目文档，含 SQL schema（见 `docs/AGENTS.md`） |
| `src/` | 源代码（见 `src/AGENTS.md`） |

## For AI Agents

### Working In This Directory
- Java 21 + Spring Boot 3.4.4，构建工具为 Maven
- 运行项目前需确保 MySQL 8 和 Redis 已启动
- 配置文件在 `src/main/resources/application.yml`，通过 `spring.profiles.active` 切换环境
- Flyway 管理数据库迁移，脚本放在 `src/main/resources/db/migration/`

### Testing Requirements
- 测试框架：Spring Boot Test + Spring Security Test
- 运行命令：`mvn test`

### Common Patterns
- 统一响应格式：`R<T>`（见 `common/result/R.java`）
- 分页响应：`PageResult<T>`（见 `common/result/PageResult.java`）
- 业务异常：抛出 `BizException`，由 `GlobalExceptionHandler` 统一处理
- Controller 继承 `BaseController`，获取当前用户信息通过 `getCurrentUser()`/`getCurrentUserId()`/`getCurrentFamilyId()`
- 实体类继承 `BaseEntity`，自动填充 id/createdAt/updatedAt/deleted
- 认证方式：JWT Token，角色分 ADMIN/MEMBER/GUEST

## Dependencies

### External
- Spring Boot 3.4.4 — Web、Security、Validation、Redis、WebSocket、Actuator
- MyBatis-Plus 3.5.9 — ORM 框架
- Flyway — 数据库迁移
- SpringDoc OpenAPI 2.8.6 — Swagger API 文档
- JJWT 0.12.6 — JWT 令牌
- MapStruct 1.6.3 — 对象映射
- Hutool 5.8.34 — 工具库
- Lombok — 代码简化
- MySQL Connector — 数据库驱动

<!-- MANUAL: -->
