<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 | Updated: 2026-04-20 -->

# common（公共组件）

## Purpose
全项目共享的基础设施代码，提供统一响应封装、全局异常处理、通用常量、基础实体和工具方法。所有业务模块均依赖此包。

## Key Files

| File | Description |
|------|-------------|
| `base/BaseController.java` | Controller 基类，提供 `getCurrentUser()`、`success()`、`error()` 等便捷方法 |
| `base/BaseEntity.java` | 实体基类，定义 id（雪花算法）、createdAt、updatedAt、deleted（逻辑删除） |
| `constant/CommonConstant.java` | 全局常量：JWT Header/Prefix、Redis Key 前缀、角色名称 |
| `enums/ResultCode.java` | 响应码枚举：HTTP 标准码 + 业务码（积分 1xxx、试卷 2xxx、任务 3xxx） |
| `exception/BizException.java` | 业务异常类，携带 code 和 message |
| `exception/GlobalExceptionHandler.java` | 全局异常处理器，统一处理 BizException、校验异常、认证异常、兜底异常 |
| `result/R.java` | 统一响应包装器 `R<T>`，提供 `ok()`/`fail()` 静态工厂方法 |
| `result/PageResult.java` | 分页响应封装，包含 list/total/page/pageSize |
| `utils/SecurityUtils.java` | 安全工具类，从 SecurityContext 获取当前登录用户信息 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `base/` | 基础抽象类：BaseController、BaseEntity |
| `constant/` | 常量定义 |
| `enums/` | 枚举类型 |
| `exception/` | 异常类和全局异常处理 |
| `result/` | 统一响应封装 |
| `utils/` | 工具类 |

## For AI Agents

### Working In This Directory
- 修改此目录下的文件需谨慎，影响范围覆盖全项目
- 新增业务错误码添加到 `ResultCode` 枚举中，按模块分段（1xxx 积分、2xxx 试卷、3xxx 任务）
- 新增常量添加到 `CommonConstant`
- 响应格式统一使用 `R<T>`，不要在 Controller 中直接返回裸对象

### Common Patterns
- Controller 返回值：`R<T>` 泛型包装
- 异常处理：抛出 `BizException(ResultCode.XXX)` 或 `BizException(code, message)`
- 分页查询返回 `R<PageResult<T>>`
- 获取当前用户：`SecurityUtils.getCurrentUserId()` / `SecurityUtils.getCurrentFamilyId()`
