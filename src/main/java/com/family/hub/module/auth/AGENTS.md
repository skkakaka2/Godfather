<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 | Updated: 2026-04-20 -->

# auth（认证模块）

## Purpose
用户认证与账户管理模块。处理用户注册、登录（JWT 令牌签发）、用户信息查询与更新、家庭成员管理。是系统最基础的模块，其他所有模块依赖此模块的用户和家庭上下文。

## Key Files

| File | Description |
|------|-------------|
| `controller/AuthController.java` | 认证接口：`POST /api/v1/auth/login`、`POST /api/v1/auth/register` |
| `controller/UserController.java` | 用户管理接口 |
| `dto/LoginRequest.java` | 登录请求参数 |
| `dto/RegisterRequest.java` | 注册请求参数 |
| `entity/User.java` | 用户实体，关联 family，含 role（ADMIN/MEMBER/GUEST） |
| `entity/Family.java` | 家庭实体，含 inviteCode |
| `mapper/UserMapper.java` | 用户 Mapper |
| `mapper/FamilyMapper.java` | 家庭 Mapper |
| `service/UserService.java` | 用户 Service 接口 |
| `service/impl/UserServiceImpl.java` | 用户 Service 实现：登录验证、注册（含创建家庭）、用户信息管理 |
| `vo/LoginVO.java` | 登录响应：accessToken、refreshToken、expiresIn、user |
| `vo/UserVO.java` | 用户信息响应视图 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `controller/` | REST 控制器 |
| `dto/` | 请求参数 DTO |
| `entity/` | 数据库实体 |
| `mapper/` | MyBatis-Plus Mapper |
| `service/` | Service 接口及实现 |
| `vo/` | 响应视图对象 |

## For AI Agents

### Working In This Directory
- 注册逻辑：如果未传 familyId 则自动创建新家庭，生成 8 位邀请码
- 密码使用 BCrypt 加密存储
- 登录成功返回 JWT accessToken + refreshToken
- 获取当前用户信息通过 `SecurityUtils` 工具类，不传 userId 参数
- 更新用户信息需校验只能修改自己的信息

### Dependencies

#### Internal
- `common/` — BaseEntity、R、ResultCode、BizException、SecurityUtils
- `security/` — JwtTokenProvider（生成 Token）、LoginUser（用户认证信息）

### Common Patterns
- Service 层处理业务逻辑，Controller 层仅做参数接收和响应封装
- VO 对象使用 Builder 模式（`@Builder`）构建
- 查询使用 MyBatis-Plus 的 `LambdaQueryWrapper`
