<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 | Updated: 2026-04-20 -->

# module（业务模块）

## Purpose
业务功能模块容器。每个子目录代表一个独立的业务模块，模块内按 controller/dto/entity/mapper/service/vo 分层组织。

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `auth/` | 用户认证模块：登录、注册、用户管理（见 `auth/AGENTS.md`） |
| `task/` | 任务打卡模块（待实现，对应需求模块 B） |

## For AI Agents

### Working In This Directory
- 新增模块在此目录下创建子目录，命名使用小写英文
- 每个模块遵循统一的分层结构：controller → service → mapper → entity
- DTO（请求参数）和 VO（响应视图）与 Entity 分离，不直接暴露 Entity 给前端
- 模块间依赖通过 Service 接口交互，避免直接调用其他模块的 Mapper

### Common Patterns
- 模块目录结构：
  ```
  module/{name}/
  ├── controller/   # REST 控制器
  ├── dto/          # 请求参数对象
  ├── entity/       # 数据库实体
  ├── mapper/       # MyBatis-Plus Mapper 接口
  ├── service/      # Service 接口
  │   └── impl/     # Service 实现
  └── vo/           # 响应视图对象
  ```
