# 重构方案：单模块按业务分包

> 目标：将现有"按技术层分包"重构为"按业务模块分包"
> 范围：只移动包路径和 import，不改业务逻辑

---

## 一、目标结构

```
com.family.hub
├── config/                          # 【不变】全局配置类
│   ├── SecurityConfig
│   ├── MyBatisPlusConfig
│   ├── RedisConfig
│   ├── OpenApiConfig
│   ├── WebSocketConfig
│   ├── SchedulingConfig
│   └── JacksonConfig
│
├── common/                          # 【不变】全局公共组件
│   ├── result/                      #   R, PageResult
│   ├── exception/                   #   BizException, GlobalExceptionHandler
│   ├── enums/                       #   ResultCode
│   ├── constant/                    #   CommonConstant
│   ├── base/                        #   BaseEntity, BaseController
│   └── utils/                       #   SecurityUtils
│
├── security/                        # 【不变】认证基础设施（框架层，非业务）
│   ├── JwtTokenProvider
│   ├── JwtAuthenticationFilter
│   ├── LoginUser
│   ├── UserDetailsServiceImpl
│   └── handler/
│       ├── AuthenticationEntryPointImpl
│       └── AccessDeniedHandlerImpl
│
└── module/                          # 【新增】业务模块根包
    └── auth/                        #   认证模块（注册/登录/用户管理）
        ├── entity/                  #     Family, User
        ├── mapper/                  #     FamilyMapper, UserMapper
        ├── service/                 #     UserService
        │   └── impl/               #       UserServiceImpl
        ├── controller/              #     AuthController, UserController
        ├── dto/                     #     LoginRequest, RegisterRequest
        └── vo/                      #     LoginVO, UserVO
```

后续业务模块在 `module/` 下同级扩展：

```
module/
├── auth/        # 认证（当前）
├── task/        # 模块 B：任务打卡（Phase 1）
├── point/       # 模块 C：积分商城（Phase 2）
├── growth/      # 模块 E：成长时光机（Phase 3）
├── math/        # 模块 A：口算特训（Phase 4）
├── reading/     # 模块 D：阅读书房（Phase 5）
└── calendar/    # 模块 F：家庭日历（Phase 5）
```

---

## 二、文件迁移清单

### 保持不变（不动）

| 文件 | 原因 |
|------|------|
| `config/*` | 全局配置，跨模块使用 |
| `common/*` | 全局公共组件 |
| `security/*` | 认证基础设施，框架层面 |
| `FamilyHubApplication.java` | 启动类 |

### 需要迁移（移入 module/auth）

| 原路径 | 新路径 |
|--------|--------|
| `entity/Family.java` | `module/auth/entity/Family.java` |
| `entity/User.java` | `module/auth/entity/User.java` |
| `mapper/FamilyMapper.java` | `module/auth/mapper/FamilyMapper.java` |
| `mapper/UserMapper.java` | `module/auth/mapper/UserMapper.java` |
| `service/UserService.java` | `module/auth/service/UserService.java` |
| `service/impl/UserServiceImpl.java` | `module/auth/service/impl/UserServiceImpl.java` |
| `controller/AuthController.java` | `module/auth/controller/AuthController.java` |
| `controller/UserController.java` | `module/auth/controller/UserController.java` |
| `dto/LoginRequest.java` | `module/auth/dto/LoginRequest.java` |
| `dto/RegisterRequest.java` | `module/auth/dto/RegisterRequest.java` |
| `vo/LoginVO.java` | `module/auth/vo/LoginVO.java` |
| `vo/UserVO.java` | `module/auth/vo/UserVO.java` |

### 需要更新 import 的文件

| 文件 | 需更新的 import |
|------|----------------|
| `security/UserDetailsServiceImpl.java` | `entity.User` → `module.auth.entity.User` |
| `security/JwtAuthenticationFilter.java` | `security.LoginUser` 不变 |
| `common/base/BaseController.java` | `security.LoginUser` 不变，`utils.SecurityUtils` 不变 |
| `module/auth/*` 所有文件 | `entity.User` → `module.auth.entity.User` 等 |

---

## 三、执行步骤

1. 创建 `module/auth/` 及子包目录
2. 移动 12 个业务文件到新路径
3. 更新所有文件中的 package 声明和 import 语句
4. 删除空的旧目录（`entity/`, `mapper/`, `service/`, `controller/`, `dto/`, `vo/`）
5. `mvn compile` 验证编译通过

---

## 四、设计约定

| 约定 | 说明 |
|------|------|
| `module/xxx/` 每个模块内部完整包含 entity/mapper/service/controller/dto/vo | 模块自包含 |
| 模块间引用通过 Service 接口，禁止直接注入其他模块的 Mapper | 降低耦合 |
| 共享枚举放 `common/enums/`，模块私有枚举放模块内部 | 按需 |
| `security/` 只放框架层的认证基础设施，不放业务 Controller | 关注点分离 |
| User/Family 实体暂放 auth 模块，因为它们是认证的核心实体 | 可调整 |
