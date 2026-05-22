# 前端转全栈 — 数据库知识补充详解

---

# 第 1 点：SQL 基础

## 1.1 聚合与分组

聚合函数把多行数据**压缩成一个值**：

```sql
-- 常用聚合函数
SELECT
    COUNT(*),           -- 行数
    SUM(amount),        -- 求和
    AVG(age),           -- 平均值
    MAX(created_at),    -- 最大值
    MIN(price)          -- 最小值
FROM orders;
```

`GROUP BY` 按指定列分组，每组分别聚合：

```sql
-- 统计每个部门的平均薪水和人数
SELECT
    department_id,
    COUNT(*) AS headcount,
    AVG(salary) AS avg_salary
FROM employees
GROUP BY department_id;
```

**HAVING vs WHERE** — 前端类比：类似数组的 `filter`，但作用阶段不同：

```
WHERE  → 对原始行过滤（分组前）
HAVING → 对聚合结果过滤（分组后）
```

```sql
-- 找出人数 > 5 的部门（HAVING 不能换成 WHERE）
SELECT department_id, COUNT(*) AS cnt
FROM employees
WHERE status = 'active'        -- 先筛掉离职的
GROUP BY department_id
HAVING COUNT(*) > 5;           -- 再筛掉人数少的部门
```

执行顺序（重要）：

```
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
```

---

## 1.2 多表连接 JOIN

用一张图理解：

```
  表A (users)          表B (orders)
 ┌──────┬──────┐    ┌──────┬─────────┬──────┐
 │  id  │ name │    │  id  │ user_id │ amt  │
 ├──────┼──────┤    ├──────┼─────────┼──────┤
 │  1   │ 张三 │    │ 101  │    1    │ 100  │
 │  2   │ 李四 │    │ 102  │    1    │ 200  │
 │  3   │ 王五 │    │ 103  │    3    │ 150  │
 └──────┴──────┘    │ 104  │   99    │ 300  │  ← user_id=99 不存在
                    └──────┴─────────┴──────┘
```

| 类型 | 结果 | 类比 |
|------|------|------|
| `INNER JOIN` | 只保留两表都匹配的行 | JS 的 `array.filter(有匹配)` |
| `LEFT JOIN` | 左表全保留，右表没匹配填 NULL | 左表是主体 |
| `RIGHT JOIN` | 右表全保留，左表没匹配填 NULL | 基本不用，换 LEFT 即可 |

```sql
-- INNER JOIN: 只返回有订单的用户（张三、王五）
SELECT u.name, o.amt
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN: 所有用户都列出，没订单的 amt 为 NULL
SELECT u.name, o.amt
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
-- 结果: 张三/100, 张三/200, 李四/NULL, 王五/150
```

**实际开发建议**：90% 的情况用 `LEFT JOIN`，明确只需要匹配行时才用 `INNER JOIN`。

---

## 1.3 子查询

子查询就是**查询里面套查询**，三种常见用法：

```sql
-- ① 用在 WHERE 里（最常见）
SELECT * FROM users
WHERE id IN (
    SELECT DISTINCT user_id FROM orders WHERE amount > 1000
);

-- ② 用在 FROM 里（当临时表）
SELECT dept_name, avg_salary
FROM (
    SELECT department_id, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department_id
) AS dept_avg
JOIN departments d ON dept_avg.department_id = d.id;

-- ③ 用在 SELECT 里（标量子查询，只返回一个值）
SELECT
    u.name,
    (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
FROM users u;
```

**子查询 vs JOIN**：功能上经常能互换，但 JOIN 通常性能更好，因为优化器更容易优化。

---

## 1.4 窗口函数（进阶但很实用）

前端类比：类似数组的 `map`，但能"看到"同一组内的其他行。

```sql
-- 每个员工的薪水在自己部门内的排名
SELECT
    name,
    department_id,
    salary,
    RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dept_rank
FROM employees;

-- 累计销售额
SELECT
    order_date,
    amount,
    SUM(amount) OVER (ORDER BY order_date) AS running_total
FROM orders;
```

与 `GROUP BY` 的区别：
- `GROUP BY`：每组只返回**一行**
- 窗口函数：每行都保留，额外附加聚合计算结果

---

# 第 2 点：索引

## 2.1 索引是什么

前端类比：**索引就是数据库的"目录"**。

```
没有索引：找"王五" → 从第1行扫到最后一行（全表扫描，O(n)）
有了索引：找"王五" → 在目录里定位到第 37 页，直接翻过去（O(log n)）
```

MySQL InnoDB 用的是 **B+Tree**，长这样：

```
                        [30]
                      /      \
                   [10|20]   [40|50]
                  /   |   \    |    \
  [数据行1] [数据行2] [数据行3] [数据行4] [数据行5]

特点：
- 非叶子节点只存 key，叶子节点存数据
- 叶子节点之间用链表串起来（支持范围查询快）
- 树高度通常 2~4 层，千万级数据只需 3~4 次 IO
```

---

## 2.2 索引类型

| 类型 | 说明 | 场景 |
|------|------|------|
| **主键索引** | 自动创建，不允许 NULL 和重复 | `id` 列 |
| **唯一索引** | 值不能重复，允许 NULL | `email`、`phone` |
| **普通索引** | 最基本的索引，无约束 | 经常查询的列 |
| **联合索引** | 多列组合成一个索引 | 多条件查询 |

```sql
-- 创建索引
CREATE INDEX idx_user_email ON users(email);
CREATE UNIQUE INDEX uk_phone ON users(phone);
CREATE INDEX idx_order_user_status ON orders(user_id, status);  -- 联合索引

-- 查看表的索引
SHOW INDEX FROM users;

-- 删除索引
DROP INDEX idx_user_email ON users;
```

---

## 2.3 最左前缀原则（联合索引的核心）

联合索引 `(a, b, c)` 实际等同于建了三个索引：

```
(a, b, c)  → 能用
(a, b)     → 能用
(a)        → 能用
(b)        → 不能用 ❌
(b, c)     → 不能用 ❌
(c)        → 不能用 ❌
```

原理：B+Tree 是按定义顺序排列的。先排 a，a 相同再排 b，b 相同再排 c。跳过 a 直接查 b，树没法定位。

```sql
-- 联合索引 idx_order_user_status (user_id, status)

-- ✅ 能命中索引
SELECT * FROM orders WHERE user_id = 1;
SELECT * FROM orders WHERE user_id = 1 AND status = 'PAID';

-- ❌ 不能命中索引
SELECT * FROM orders WHERE status = 'PAID';

-- ⚠️ 部分命中：能用 user_id 定位，但 status 的范围查询会退化为扫描
SELECT * FROM orders WHERE user_id = 1 AND status > 'PAID';
```

**实战建议**：联合索引的列顺序，按以下原则排列：

```
区分度高的列放前面（如 user_id）
经常单独查询的列放前面
范围查询的列放最后（>、<、BETWEEN）
```

---

## 2.4 索引失效的常见场景

这是**面试必考**、**线上事故高发**知识点：

```sql
-- 假设 name 列有索引 idx_name

-- ❌ 对列使用函数
SELECT * FROM users WHERE LEFT(name, 1) = '张';
-- ✅ 改写
SELECT * FROM users WHERE name LIKE '张%';

-- ❌ 隐式类型转换（name 是 VARCHAR，传了数字）
SELECT * FROM users WHERE name = 13800138000;
-- ✅ 保持类型一致
SELECT * FROM users WHERE name = '13800138000';

-- ❌ LIKE 左模糊
SELECT * FROM users WHERE name LIKE '%三';     -- 索引失效
SELECT * FROM users WHERE name LIKE '%三%';    -- 索引失效
-- ✅ 右模糊可以命中
SELECT * FROM users WHERE name LIKE '张%';     -- 索引有效

-- ❌ OR 连接无索引列
SELECT * FROM users WHERE name = '张三' OR age = 25;
-- age 没有索引 → 整个查询走全表扫描
-- ✅ 给 age 也加索引，或拆成两个查询

-- ❌ 不等于
SELECT * FROM users WHERE status != 1;
-- ✅ 视情况改写为 IN
SELECT * FROM users WHERE status IN (0, 2, 3);
```

---

## 2.5 EXPLAIN（最重要的调优技能）

每一条慢查询都应该先 `EXPLAIN`：

```sql
EXPLAIN SELECT * FROM orders WHERE user_id = 1;
```

输出关键字段：

| 字段 | 含义 | 关注什么 |
|------|------|---------|
| **type** | 访问类型 | 从好到差：`const` > `eq_ref` > `ref` > `range` > `index` > **`ALL`（全表扫描，要避免）** |
| **key** | 实际用了哪个索引 | 如果是 `NULL` 说明没命中 |
| **rows** | 预估扫描行数 | 越少越好 |
| **Extra** | 额外信息 | `Using filesort`（额外排序，需优化）、`Using temporary`（临时表，需优化） |

```sql
-- type 字段速记
-- const   → 主键/唯一索引等值查询，最多一行（最优）
-- eq_ref  → JOIN 时主键/唯一索引匹配
-- ref     → 普通索引等值查询
-- range   → 索引范围扫描（BETWEEN, >, <）
-- index   → 全索引扫描（比 ALL 好一点）
-- ALL     → 全表扫描（必须优化！）
```

---

## 2.6 索引的代价

索引不是越多越好：

| 代价 | 说明 |
|------|------|
| **写入变慢** | 每次 INSERT/UPDATE/DELETE 都要同步更新索引 |
| **占用磁盘** | 索引本身占空间，联合索引可能比数据还大 |
| **优化器选错** | 索引多了，MySQL 可能选错索引 |

经验值：一张表 **5~8 个索引** 合理，超过就该审视了。

---

# 第 3 点：表设计 / 范式

## 3.1 三大范式

范式的核心目的：**减少数据冗余，避免插入/更新/删除异常**。

### 第一范式（1NF）：每列不可再分

```sql
-- ❌ 违反 1NF：address 包含多个信息
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50),
    address VARCHAR(200)   -- "北京市朝阳区建国路88号"
);

-- ✅ 满足 1NF：拆成独立字段
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50),
    province VARCHAR(20),
    city VARCHAR(20),
    street VARCHAR(100)
);
```

前端类比：类似 JSON 要扁平化，不要在一个字段里塞结构化数据。实际开发中用 JSON 列存储灵活字段是常见做法，但需要权衡查询需求。

### 第二范式（2NF）：在 1NF 基础上，非主键列必须完全依赖主键

```sql
-- ❌ 违反 2NF：联合主键 (order_id, product_id)
--    但 product_name 只依赖 product_id，不依赖 order_id
CREATE TABLE order_items (
    order_id BIGINT,
    product_id BIGINT,
    quantity INT,
    product_name VARCHAR(100),   -- 冗余！只依赖 product_id
    PRIMARY KEY (order_id, product_id)
);

-- ✅ 满足 2NF：拆表
CREATE TABLE order_items (
    order_id BIGINT,
    product_id BIGINT,
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE products (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100)
);
```

### 第三范式（3NF）：在 2NF 基础上，非主键列之间不能有传递依赖

```sql
-- ❌ 违反 3NF：department_name 依赖 department_id，department_id 依赖 user_id
--    即 user_id → department_id → department_name（传递依赖）
CREATE TABLE employees (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50),
    department_id BIGINT,
    department_name VARCHAR(50)   -- 冗余！通过 department_id 就能查到
);

-- ✅ 满足 3NF：部门信息单独建表
CREATE TABLE employees (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50),
    department_id BIGINT
);

CREATE TABLE departments (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50)
);
```

### 一句话总结范式

```
1NF → 字段不可再分
2NF → 没有部分依赖（联合主键场景要注意）
3NF → 没有传递依赖
```

---

## 3.2 反范式：什么时候故意冗余

范式理论上完美，但实际开发中**经常需要反范式**，用冗余换性能：

```sql
-- 场景：订单列表需要展示商品名称
--      严格 3NF → 每次都要 JOIN products 表

-- 反范式：在 order_items 里冗余商品名称
CREATE TABLE order_items (
    order_id BIGINT,
    product_id BIGINT,
    product_name VARCHAR(100),  -- 冗余字段！
    price DECIMAL(10, 2),       -- 冗余字段！下单时的价格，不是商品当前价格
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);
```

**为什么要冗余**：
- 商品改名了，历史订单应该显示**下单时的名称和价格**，不是当前值
- 列表查询避免 JOIN，分页性能更好

**冗余的原则**：

| 适合冗余 | 不适合冗余 |
|---------|----------|
| 变更频率低（状态、分类名） | 变更频率高（库存、余额） |
| 需要保留历史快照（订单价格） | 始终要最新值（用户头像） |
| 查询远多于修改 | 修改频率高且要实时一致 |

---

## 3.3 主键选择

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| **自增 ID** | 简单、索引性能好（顺序写入） | 分布式环境可能冲突 | 单机、大多数场景 |
| **UUID** | 全局唯一、无需协调 | 无序写入导致索引碎片、36字符太长 | 几乎不用作主键 |
| **雪花算法** | 有序、全局唯一、性能好 | 需要时钟回拨处理 | 分布式系统 |

```java
// MyBatis-Plus 雪花算法配置（一行搞定）
@TableId(type = IdType.ASSIGN_ID)  // 默认就是雪花算法
private Long id;
```

**InnoDB 为什么推荐自增主键**：B+Tree 叶子节点是有序链表，自增 ID 是追加写入，不需要移动已有数据。随机主键（UUID）会导致频繁的页分裂。

---

## 3.4 字段类型选择

```sql
-- 整数
TINYINT       -- 1字节，-128~127，适合 status、type 枚举
SMALLINT      -- 2字节
INT           -- 4字节，约 ±21亿，大多数场景够用
BIGINT        -- 8字节，ID、金额相关（防溢出）

-- 字符串
VARCHAR(50)   -- 变长，最常用
CHAR(32)      -- 定长，适合 MD5、UUID 等固定长度
TEXT          -- 大文本，但不能设默认值、索引要指定前缀长度

-- 时间
DATETIME      -- 8字节，范围 1000~9999 年，不受时区影响
TIMESTAMP     -- 4字节，范围 1970~2038 年，自动时区转换
-- 建议：业务用 DATETIME，created_at/updated_at 用 TIMESTAMP 或 DATETIME 均可

-- 金额（重点！）
DECIMAL(10, 2)  -- 精确小数，金融必须用这个
-- 绝对不要用 FLOAT/DOUBLE，会有精度丢失
-- 或者用 BIGINT 存"分"，展示时除以 100
```

**常见错误**：

```sql
-- ❌ 用 FLOAT 存金额
price FLOAT   -- 0.1 + 0.2 = 0.30000000000000004

-- ✅ 用 DECIMAL
price DECIMAL(10, 2)   -- 精确到分

-- ❌ VARCHAR 长度随便写 VARCHAR(5000)
-- ✅ 按实际需要设，VARCHAR 只占用实际长度+1~2字节，但 MySQL 内存分配和索引前缀会受定义长度影响
```

---

## 3.5 必备审计字段

每张表都应该有：

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    -- ... 业务字段 ...
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted TINYINT NOT NULL DEFAULT 0   -- 软删除标记，不用物理删除
);
```

软删除（`deleted` 字段）的好处：
- 数据可恢复
- 审计追踪
- 注意：唯一索引要加上 `deleted` 条件，否则删了再建同名会冲突

---

# 第 4 点：常见坑

## 4.1 N+1 查询

这是 ORM 用户**最容易踩**的坑，没有之一。

### 什么是 N+1

```java
// 需求：查询订单列表，每个订单要显示用户名

// ❌ N+1 写法
List<Order> orders = orderMapper.selectList(null);   // 1 次查询
for (Order order : orders) {
    User user = userMapper.selectById(order.getUserId());  // N 次查询！
    order.setUserName(user.getName());
}
// 总共 1 + N 次数据库请求，100 条订单 = 101 次 SQL
```

前端类比：你不会在循环里逐个发 `fetch` 请求，而是一次批量获取。数据库也一样。

### 解决方案

```java
// ✅ 方案一：JOIN 一次查出
List<OrderVO> orders = orderMapper.selectWithUser();  // 1 次 SQL 搞定
// 对应 SQL：
// SELECT o.*, u.name AS user_name FROM orders o LEFT JOIN users u ON o.user_id = u.id

// ✅ 方案二：先查 ID，再批量查
List<Order> orders = orderMapper.selectList(null);
List<Long> userIds = orders.stream().map(Order::getUserId).distinct().toList();
List<User> users = userMapper.selectBatchIds(userIds);  // WHERE id IN (...)
Map<Long, User> userMap = users.stream().collect(Collectors.toMap(User::getId, u -> u));
for (Order order : orders) {
    order.setUserName(userMap.get(order.getUserId()).getName());
}
// 总共 2 次 SQL，无论多少条数据
```

### 判断标准

```
循环里有数据库调用 → 大概率是 N+1 → 必须优化
一个接口执行超过 10 次 SQL → 检查是否有 N+1
```

---

## 4.2 大事务

### 什么是大事务

一个事务里做了**太多不应该在事务里做的事**：

```java
// ❌ 典型大事务
@Transactional
public void createOrder(OrderDTO dto) {
    // 1. 数据库操作（应该在事务内）
    Order order = new Order(dto);
    orderMapper.insert(order);

    // 2. 远程调用支付接口（不应该在事务内！可能耗时 3~5 秒）
    paymentService.pay(order);           // ← 网络调用

    // 3. 发通知（不应该在事务内）
    notificationService.sendEmail(...);  // ← 网络调用

    // 4. 更新库存（应该在事务内）
    inventoryService.deduct(dto.getProductId(), dto.getQuantity());
}
// 整个事务持有数据库锁，直到支付+发邮件都完成才释放
// 支付慢 → 锁持有久 → 其他事务等待 → 超时 → 雪崩
```

### 事务的核心原则

**事务里只放必须原子化的数据库操作，其他全部移出去。**

```java
// ✅ 拆分后
public void createOrder(OrderDTO dto) {
    // 阶段一：事务内 — 只做数据库操作
    Order order = orderService.saveOrder(dto);  // @Transactional 在这个方法内部

    // 阶段二：事务外 — 网络/IO 操作
    try {
        paymentService.pay(order);
    } catch (PaymentException e) {
        orderService.markAsFailed(order.getId());  // 单独的小事务
        throw e;
    }

    // 阶段三：异步 — 通知类操作
    notificationService.sendEmailAsync(...);  // MQ 异步发送
}
```

### 大事务的危害

```
大事务
  → 锁持有时间长
    → 其他事务等待
      → 连接池耗尽
        → 所有请求超时
          → 系统雪崩
```

### 怎么发现大事务

```sql
-- MySQL 查看运行中的事务
SELECT * FROM information_schema.INNODB_TRX
ORDER BY trx_started ASC;

-- 关注：
-- trx_started     → 开始时间，太久就是大事务
-- trx_tables_locked → 锁了多少表
-- trx_rows_locked   → 锁了多少行
```

---

## 4.3 没设超时

### 查询超时

```sql
-- ❌ 一条烂 SQL 查了 10 分钟还没返回
SELECT * FROM orders WHERE remark LIKE '%abc%';  -- 全表扫描 + 无索引
```

```yaml
# ✅ MySQL 连接配置超时（application.yml）
spring:
  datasource:
    hikari:
      connection-timeout: 3000      # 获取连接超时 3s
      validation-timeout: 1000      # 连接校验超时 1s
    url: jdbc:mysql://localhost:3306/db?connectTimeout=3000&socketTimeout=10000
    #  connectTimeout  → TCP 连接超时
    #  socketTimeout   → 读写超时（单条 SQL 最大执行时间）
```

### 事务超时

```java
// ✅ Spring 事务超时（超时自动回滚）
@Transactional(timeout = 5)  // 5 秒超时
public void createOrder(OrderDTO dto) {
    // ...
}
```

### HTTP 调用超时

```java
// ✅ RestTemplate / Feign 也要设超时
RestTemplate restTemplate = new RestTemplate();
HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
factory.setConnectTimeout(3000);   // 连接超时 3s
factory.setReadTimeout(5000);      // 读取超时 5s
restTemplate.setRequestFactory(factory);
```

### 超时配置原则

```
数据库连接  → 3s
单条 SQL    → 5~10s（超过就该优化 SQL，而不是加长超时）
事务        → 10~30s（事务越小越好）
外部 HTTP   → 3~5s（外部服务不可控，必须设短）
```

**核心理念：超时是安全网，不是解决方案。频繁超时说明设计有问题。**

---

## 4.4 其他常见坑速查

| 坑 | 说明 | 解决 |
|----|------|------|
| **SELECT *** | 返回不需要的列，浪费带宽和内存 | 明确写需要的列 |
| **OR 改 UNION** | 复杂 OR 条件导致索引失效 | 拆成多条查询 UNION |
| **隐式排序依赖** | 没有 ORDER BY 但依赖了"自然顺序" | 始终显式 ORDER BY |
| **LIMIT 不设上限** | 前端没传分页参数就查全表 | 强制 LIMIT 上限 |
| **datetime 直接比较字符串** | `WHERE created_at > '2024-01-01'` 可能走不了索引 | 用参数绑定而非字符串拼接 |

---

# 第 5 点：锁机制

## 5.1 为什么需要锁

回到事务隔离级别的底层实现 — 隔离是目标，**锁是手段**。

```
两个事务同时改同一行数据，谁先改？改完另一个怎么办？

事务A: UPDATE account SET balance = balance - 100 WHERE id = 1
事务B: UPDATE account SET balance = balance - 50  WHERE id = 1

没有锁 → 两个都读到 balance=1000 → 各减各的 → 最终 900（应该是 850）
有了锁 → A 先拿到锁 → B 等待 → A 提交 → B 拿锁 → 读到 900 → 减到 850
```

---

## 5.2 锁的分类

### 按粒度分

```
表级锁  → 锁整张表，并发最差，MyISAM 只有这个
行级锁  → 只锁一行，并发最好，InnoDB 默认
间隙锁  → 锁住两行之间的"间隙"，防止插入
```

### 按模式分

```
共享锁（S Lock / 读锁）→ 多个事务可以同时持有，只能读不能改
排他锁（X Lock / 写锁）→ 只有一个事务能持有，其他事务读写都不行
```

组合关系：

|  | 已有 S 锁 | 已有 X 锁 |
|--|----------|----------|
| 请求 S 锁 | ✅ 兼容 | ❌ 等待 |
| 请求 X 锁 | ❌ 等待 | ❌ 等待 |

前端类比：S 锁类似浏览器缓存（多人可读），X 锁类似文件独占写入。

---

## 5.3 InnoDB 行锁的细节

### InnoDB 自动加锁规则

```sql
-- 这些操作自动加行级排他锁
UPDATE users SET name = '张三' WHERE id = 1;     -- 锁 id=1 这一行
DELETE FROM users WHERE id = 1;                   -- 锁 id=1 这一行
INSERT INTO users (name) VALUES ('李四');          -- 锁新插入的行

-- 普通 SELECT 不加任何锁（快照读，MVCC）
SELECT * FROM users WHERE id = 1;                 -- 不加锁
```

### 关键区分：快照读 vs 当前读

```
快照读（普通 SELECT）→ 读 MVCC 快照，不加锁，性能好
当前读（加锁读）     → 读最新已提交数据，加锁

什么时候触发当前读：
SELECT ... FOR UPDATE        → 加 X 锁（排他锁）
SELECT ... LOCK IN SHARE MODE → 加 S 锁（共享锁）
UPDATE / DELETE              → 加 X 锁
```

---

## 5.4 间隙锁（Gap Lock）

这是 InnoDB 在 REPEATABLE READ 级别下解决幻读的关键。

```
假设 users 表有 id = 5, 10, 15 三行

事务A 执行：
SELECT * FROM users WHERE id BETWEEN 8 AND 12 FOR UPDATE;

不仅锁了 id=10 这一行，还锁了 (5, 10) 和 (10, 15) 两个间隙

事务B 此时：
INSERT INTO users (id) VALUES (7);   -- ❌ 被阻塞（7 在间隙 (5,10) 内）
INSERT INTO users (id) VALUES (12);  -- ❌ 被阻塞（12 在间隙 (10,15) 内）
INSERT INTO users (id) VALUES (20);  -- ✅ 正常（20 在间隙外）
```

**Next-Key Lock = 行锁 + 间隙锁**，InnoDB 默认就是这种组合锁。

---

## 5.5 死锁

### 什么是死锁

```
事务A: 锁了行1 → 等待行2
事务B: 锁了行2 → 等待行1
       → 双方都在等对方释放 → 死锁
```

```sql
-- 事务A
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- 锁 id=1
UPDATE accounts SET balance = balance + 100 WHERE id = 2;  -- 等待 id=2...

-- 事务B（同时执行）
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 2;   -- 锁 id=2
UPDATE accounts SET balance = balance + 50 WHERE id = 1;   -- 等待 id=1...
-- 💀 死锁！
```

### InnoDB 的死锁处理

InnoDB 自动检测死锁，回滚**代价最小的事务**（通常是修改行数少的那个）。所以死锁不会导致系统永久卡住，但会导致业务报错。

### 怎么减少死锁

```
1. 固定加锁顺序 — 所有事务都按 id 升序操作
2. 事务尽量短 — 减少锁持有时间
3. 加索引 — 没索引的话行锁会退化为表锁！
4. 降低隔离级别 — READ COMMITTED 下间隙锁更少
```

```java
// ✅ 固定顺序：按 ID 排序后再操作
List<Long> accountIds = Arrays.asList(2L, 1L);
accountIds.sort(Comparator.naturalOrder());  // 统一升序
for (Long id : accountIds) {
    accountMapper.updateBalance(id, delta);
}
```

---

## 5.6 乐观锁 vs 悲观锁

这是**应用层**的并发控制策略，不是数据库内置的锁类型。

### 悲观锁：假设一定会冲突，先锁再改

```java
// 场景：高并发抢票、库存扣减
@Transactional
public void deductStock(Long productId, int quantity) {
    // 先加锁查询
    Product product = productMapper.selectForUpdate(productId);
    // SQL: SELECT * FROM product WHERE id = #{id} FOR UPDATE

    if (product.getStock() < quantity) {
        throw new BizException("库存不足");
    }
    product.setStock(product.getStock() - quantity);
    productMapper.updateById(product);
}
```

```
优点：强一致，不会超卖
缺点：串行执行，并发性能差
适合：写多读少、竞争激烈（秒杀、库存）
```

### 乐观锁：假设一般不冲突，改了再检查

```java
// 方式一：版本号（MyBatis-Plus 内置支持）
@Data
public class Product {
    private Long id;
    private Integer stock;
    @Version              // ← MyBatis-Plus 乐观锁注解
    private Integer version;
}

// 更新时自动变成：
// UPDATE product SET stock = new, version = version + 1
// WHERE id = 1 AND version = old_version
// 匹配不到 → 说明被别人改了 → 返回 0

@Transactional
public void deductStock(Long productId, int quantity) {
    Product product = productMapper.selectById(productId);
    if (product.getStock() < quantity) {
        throw new BizException("库存不足");
    }
    product.setStock(product.getStock() - quantity);
    int rows = productMapper.updateById(product);  // 乐观锁生效
    if (rows == 0) {
        throw new BizException("并发冲突，请重试");  // version 不匹配
    }
}
```

```
优点：不加数据库锁，性能好
缺点：冲突时需要重试
适合：读多写少、冲突概率低（状态更新、配置修改）
```

### 选择建议

| 场景 | 推荐 |
|------|------|
| 库存扣减、余额操作 | 悲观锁 |
| 状态流转（待审核→已审核） | 乐观锁 |
| 并发 < 100 QPS | 乐观锁够用 |
| 并发 > 1000 QPS | 悲观锁 + Redis 预扣 |

---

## 5.7 一个容易忽略的点：没有索引导致行锁变表锁

```sql
-- 假设 name 列没有索引

-- 事务A
UPDATE users SET status = 1 WHERE name = '张三';
-- 你以为只锁了张三那一行？错了！
-- 因为 name 没索引，MySQL 必须全表扫描找到张三
-- 扫描过程中所有行都加了锁 → 等于锁了整张表

-- 事务B
UPDATE users SET status = 2 WHERE name = '李四';
-- ❌ 被阻塞！明明改的是不同的行
```

**结论：UPDATE/DELETE 的 WHERE 条件一定要命中索引，否则行锁退化为表锁。**

---

# 第 6 点：连接池

## 6.1 为什么需要连接池

前端类比：**连接池类似浏览器对 HTTP 连接的 Keep-Alive 复用**。

```
没有连接池：
请求1 → TCP 三次握手 → MySQL 认证 → 执行 SQL → 关闭连接
请求2 → TCP 三次握手 → MySQL 认证 → 执行 SQL → 关闭连接
请求3 → TCP 三次握手 → MySQL 认证 → 执行 SQL → 关闭连接
（每次都重新建立连接，耗时约 5~50ms）

有连接池：
启动时创建 10 个连接 → 放在池子里
请求1 → 从池子里取一个连接 → 执行 SQL → 还回池子
请求2 → 从池子里取一个连接 → 执行 SQL → 还回池子
（复用连接，几乎没有建立连接的开销）
```

MySQL 连接建立成本：
- TCP 三次握手：~1ms（本机） / ~10ms（跨机房）
- MySQL 认证（用户名密码校验）：~1ms
- 设置字符集、时区等初始化：~1ms
- **单次连接建立约 5~50ms，对于一条只需 1ms 的 SQL 来说太浪费了**

---

## 6.2 连接池工作原理

```
                        应用线程
                           |
                    ① 请求获取连接
                           |
                      ┌────▼────┐
                      │  连接池   │  maxPoolSize = 20
                      │         │
                      │ ○ ○ ○   │  ← 空闲连接（已创建，等待使用）
                      │ ● ●     │  ← 活跃连接（正在被使用）
                      │         │
                      └────┬────┘
                           |
                    ② 有空闲 → 直接返回
                      没空闲且未达上限 → 新建一个
                      没空闲且已达上限 → 等待（直到 connectionTimeout）
                           |
                    ③ 使用完毕 → 还回池子（不是关闭）
```

---

## 6.3 HikariCP 核心参数详解

Spring Boot 2.x+ 默认连接池就是 HikariCP，无需额外引入依赖。

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: xxx
    hikari:
      # === 连接池大小 ===
      maximum-pool-size: 20        # 最大连接数（含活跃+空闲）
      minimum-idle: 5              # 最小空闲连接数

      # === 超时控制 ===
      connection-timeout: 3000     # 获取连接最大等待时间（ms），超时抛异常
      idle-timeout: 600000         # 空闲连接存活时间（ms），默认 10 分钟
      max-lifetime: 1800000        # 连接最大存活时间（ms），默认 30 分钟
      validation-timeout: 1000     # 连接校验超时（ms）

      # === 连接校验 ===
      connection-test-query: SELECT 1   # 校验 SQL（MySQL 可不配，HikariCP 自带）

      # === 泄漏检测 ===
      leak-detection-threshold: 60000   # 连接持有超过 60s 记录警告日志
```

### 各参数详解

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| `maximum-pool-size` | CPU 核心数 × 2 ~ 核心数 × 3 | 不是越大越好（见下方公式） |
| `minimum-idle` | 与 maximum 相同或一半 | 空闲时保持的最小连接数 |
| `connection-timeout` | 3000ms | 获取不到连接时的等待上限 |
| `idle-timeout` | 600000ms（10min） | 空闲连接超过此时间会被回收 |
| `max-lifetime` | 1800000ms（30min） | 连接活得太久可能有内存泄漏，定期换新 |
| `leak-detection-threshold` | 60000ms | 开发环境建议开启，线上可关闭 |

---

## 6.4 maximum-pool-size 怎么算

**最常见的错误：连接池越大越好。**

公式（来自 HikariCP 官方 Wiki）：

```
连接数 = (核心数 * 2) + 有效磁盘数
```

为什么不是越多越好：

```
连接数太多
  → MySQL 需要为每个连接分配线程和内存
    → CPU 上下文切换成本增加
      → 每个连接反而更慢
        → 整体吞吐量下降
```

实际经验值：

| 应用规模 | maximum-pool-size |
|---------|-------------------|
| 个人项目 / 开发环境 | 5~10 |
| 中等流量 Web 应用 | 10~20 |
| 高并发核心服务 | 20~50 |
| 超过 50 通常说明需要优化 SQL 或加缓存了 |

---

## 6.5 连接池常见问题

### 连接泄漏

```java
// ❌ 获取连接后没有关闭
Connection conn = dataSource.getConnection();
// 异常抛出，conn 没有 close
// 连接永远不归还 → 池子慢慢耗尽 → 所有请求超时

// ✅ 用 try-with-resources（Spring 事务管理已自动处理，一般不用手动获取连接）
@Transactional
public void doSomething() {
    // Spring 在方法开始时获取连接，方法结束（正常或异常）自动归还
    // 开发者不需要手动管理
}
```

**所以：绝大多数场景下用 `@Transactional` 就够了，不要手动管理连接。**

### 连接池耗尽的表现

```
应用日志：HikariPool-1 - Connection is not available, request timed out after 3000ms
MySQL: SHOW PROCESSLIST → 大量 Sleep 状态连接

排查步骤：
1. 是否有长事务没提交？
2. 是否有非数据库的耗时操作放在事务里？
3. 是否有未关闭的手动连接？
4. SQL 是否太慢导致连接占用时间长？
```

```sql
-- MySQL 查看当前连接数
SHOW PROCESSLIST;

-- 查看最大连接数配置
SHOW VARIABLES LIKE 'max_connections';
-- 默认 151，HikariCP 20 个连接远低于上限，不会冲突

-- 应用侧监控连接池状态（Spring Boot Actuator）
// 访问 /actuator/metrics/hikaricp.connections.active
// 访问 /actuator/metrics/hikaricp.connections.idle
```

### 连接断开（MySQL 8 小时断连）

MySQL 默认 `wait_timeout = 28800`（8小时），空闲超过 8 小时会主动断开连接。连接池里的连接可能已经被 MySQL 踢了，但池子还以为它活着。

```yaml
# HikariCP 已经自动处理了（max-lifetime < wait_timeout 即可）
hikari:
  max-lifetime: 1800000   # 30 分钟，远小于 MySQL 的 8 小时
  # 连接最多活 30 分钟就会被换新，不会遇到断连问题
```

---

## 6.6 开发 vs 生产配置对比

```yaml
# === 开发环境 ===
spring:
  datasource:
    hikari:
      maximum-pool-size: 5
      minimum-idle: 2
      connection-timeout: 5000
      leak-detection-threshold: 30000    # 开发时开启泄漏检测

# === 生产环境 ===
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
      connection-timeout: 3000           # 生产超时要短，快速失败
      max-lifetime: 1800000
      leak-detection-threshold: 0        # 生产关闭（有性能开销）
```

---

## 6.7 监控与调优

```java
// Spring Boot Actuator 接入后，关键指标：
// hikaricp.connections.active       — 当前活跃连接数
// hikaricp.connections.idle         — 当前空闲连接数
// hikaricp.connections.pending      — 等待获取连接的线程数（>0 说明池子不够）
// hikaricp.connections.timeout      — 获取连接超时次数（>0 必须排查）

// 健康判断：
// active ≈ maximum → 池子打满了，考虑扩容或优化 SQL
// pending > 0      → 有线程在等连接，一定有问题
// timeout > 0      → 获取连接超时了，必须排查
```

---

# 总结

| 知识点 | 一句话记忆 |
|--------|-----------|
| **SQL 基础** | GROUP BY 是分组聚合，JOIN 是拼表，窗口函数保留明细行 |
| **索引** | WHERE 频繁的列加索引，联合索引遵循最左前缀，慢查询先 EXPLAIN |
| **表设计** | 范式减少冗余，反范式用冗余换性能，金额用 DECIMAL |
| **常见坑** | N+1 最常见，大事务最危险，超时是安全网 |
| **锁机制** | 乐观锁适合读多写少，悲观锁适合写多竞争大，UPDATE 的 WHERE 必须命中索引 |
| **连接池** | HikariCP 开箱即用，连接数不是越多越好，用 `@Transactional` 不要手动管理连接 |
