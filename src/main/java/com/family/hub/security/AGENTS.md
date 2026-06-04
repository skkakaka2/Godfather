<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-20 | Updated: 2026-04-20 -->

# security（认证授权）

## Purpose
Spring Security + JWT 认证授权组件。提供 JWT 令牌的生成/解析/验证、请求过滤器、用户详情加载、认证异常处理。

## Key Files

| File | Description |
|------|-------------|
| `JwtTokenProvider.java` | JWT 工具类：生成/解析/验证 Token，从中提取 userId、familyId、username、role |
| `JwtAuthenticationFilter.java` | JWT 认证过滤器：从请求 Header 提取 Token，验证后设置 SecurityContext |
| `LoginUser.java` | Spring Security UserDetails 实现，承载 userId、familyId、username、role |
| `UserDetailsServiceImpl.java` | UserDetailsService 实现，根据 username 从数据库加载用户信息 |
| `handler/AccessDeniedHandlerImpl.java` | 权限不足（403）处理器 |
| `handler/AuthenticationEntryPointImpl.java` | 未认证（401）处理器 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `handler/` | 认证授权异常处理器 |

## For AI Agents

### Working In This Directory
- JWT 密钥从 `jwt.secret` 配置项读取，使用 HMAC-SHA256 签名
- accessToken 有效期 24 小时，refreshToken 有效期 7 天
- Token 中携带 userId（subject）、familyId、username、role 四个声明
- LoginUser 中 role 会自动加上 `ROLE_` 前缀作为 GrantedAuthority
- 修改认证逻辑需同步考虑 JwtAuthenticationFilter 和 SecurityConfig

### Dependencies

#### Internal
- `module/auth/` — User 实体和 UserMapper（UserDetailsServiceImpl 加载用户）
- `common/` — BizException、ResultCode

### Common Patterns
- 认证流程：请求 → JwtAuthenticationFilter 提取 Token → 验证 → 构建 UsernamePasswordAuthenticationToken → 设入 SecurityContext
- 角色权限：使用 `@PreAuthorize("hasRole('ADMIN')")` 注解控制接口权限
