<!-- Parent: ../../../../AGENTS.md -->
<!-- Generated: 2026-04-20 | Updated: 2026-04-20 -->

# hub（主包）

## Purpose
Family Hub 应用主包 `com.family.hub`，包含应用入口和所有业务代码。按职责划分为 common（公共组件）、config（配置）、module（业务模块）、security（认证授权）、websocket（实时通信）五大区域。

## Key Files

| File | Description |
|------|-------------|
| `FamilyHubApplication.java` | Spring Boot 应用入口类，启用 `@Scheduled` 定时任务 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `common/` | 公共组件：基础类、常量、枚举、异常、统一响应、工具类（见 `common/AGENTS.md`） |
| `config/` | Spring 配置类（见 `config/AGENTS.md`） |
| `module/` | 业务模块：auth（认证）、task（任务打卡）等（见 `module/AGENTS.md`） |
| `security/` | JWT 认证授权相关组件（见 `security/AGENTS.md`） |
| `websocket/` | WebSocket 实时推送（待实现） |

## For AI Agents

### Working In This Directory
- 新增业务模块在 `module/` 下创建子目录，每个模块按 controller/dto/entity/mapper/service/vo 分层
- Controller 路径规范：`/api/v1/{module}/{resource}`
- Swagger 注解使用 `@Tag` 标注 Controller、`@Operation` 标注方法
- 实体类继承 `BaseEntity`，使用 `@TableName` 指定表名
- 使用 Lombok 注解简化代码（`@Data`、`@RequiredArgsConstructor` 等）

### Testing Requirements
- 测试类放在 `src/test/java/com/family/hub/` 下对应的包路径中

### Common Patterns
- 分层架构：Controller → Service → Mapper → Entity
- DTO 用于接收请求参数，VO 用于封装响应数据
- Service 接口 + Impl 实现类模式
