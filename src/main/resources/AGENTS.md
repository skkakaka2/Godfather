<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-20 | Updated: 2026-04-20 -->

# resources

## Purpose
Spring Boot 配置文件和静态资源目录。包含多环境配置、数据库迁移脚本等。

## Key Files

| File | Description |
|------|-------------|
| `application.yml` | 主配置文件，定义通用配置和默认 profile 为 dev |
| `application-dev.yml` | 开发环境配置（MySQL、Redis 连接等） |
| `application-prod.yml` | 生产环境配置 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `db/migration/` | Flyway 数据库迁移脚本目录（当前为空，待添加） |

## For AI Agents

### Working In This Directory
- 主配置 `application.yml` 不含敏感信息，通过环境变量注入密码等
- JWT 密钥通过 `${JWT_SECRET}` 环境变量配置，默认值仅用于开发
- 种子数据配置：`app.seed.admin-username`、`app.seed.admin-password`、`app.seed.family-name`
- 新增 Flyway 迁移脚本命名规范：`V{版本号}__{描述}.sql`，如 `V1__init_schema.sql`
- MyBatis-Plus 配置：ID 策略为雪花算法（assign_id），开启逻辑删除，驼峰映射
