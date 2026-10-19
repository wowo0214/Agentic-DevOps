# Browser E2E

中央浏览器测试包。当前实现 TesterArmy/e2e + DeepSeek 的 link-admin 游客登录/退出、管理员邮箱密码登录/退出、GitHub 账号选择登录三个用例；Playwright Test 后续按实际需求加入。

## 目录

```text
e2e.config.ts                  # 单个 Agent 配置入口，保持在包根目录
shared/env.ts                  # 加载测试包环境变量
shared/apps.ts                 # 应用 ID、地址、Agent 页面上下文
config/agent.ts                   # 按应用生成配置和测试匹配路径
scripts/run-agent.ts              # 选择应用、串行批量执行、汇总退出状态
__tests__/link-admin/agent/
  guest-auth.e2e.ts
```

没有数据工厂，也不预建未来应用、fixtures 或 pages 空目录。单元与数据库集成测试留在所属应用。

## 环境

支持原生 Windows；WSL 可选。使用仓库要求的 Node.js 24.20+、pnpm 12.10.1，不要跨操作系统共享 node_modules。

在 `.env.local` 中填写密钥和 `LINK_ADMIN_E2E_URL`。登录账号默认使用 `admin@next.com`，密码通过 `E2E_USER_ADMIN_PASSWORD` 设置；可用 `E2E_USER_ADMIN_USERNAME` 覆盖邮箱。密码由测试框架的 credentials 机制填入和脱敏，不要写入测试源码或 Agent 指令。应用脚本通过 `run-agent.ts` 设置 `E2E_APP=link-admin`，只发现该应用命名空间内的测试。

必须指定应用及其专属地址；地址缺失、空值或非法时立即报错。不再提供直接运行模式，不读取 `E2E_APP_URL`，不回退到 localhost。私有环境文件中已有的 `E2E_APP_URL` 可自行删除。

Vitest 单元与集成测试保留在所属模块，通过支持该框架的编辑器按钮运行。Agent 测试通过 package 命令执行，不绑定编辑器通用测试按钮；Playwright 后续采用同样的应用命名空间边界，但本次不新增 Playwright runner。

所有命令都加载 **packages/e2e/.env.local**，不加载 link-admin 的 `.env`。进程环境优先；`E2E_ENV_FILE` 可指定其他环境文件，相对路径以测试包为基准，显式指定不存在的文件会报错。模型默认 `deepseek-flash`，替换时需确认视觉和工具调用能力。

请先自行启动被测应用；测试不负责启动或关闭 Next.js。

## 命令

在仓库根目录：

```sh
# 只发现测试，不打开浏览器、不调用模型
pnpm --filter @repo/e2e test:agent:list

# 中央选择一个应用
pnpm --filter @repo/e2e test:agent link-admin --headed --no-cache

# 中央批量执行所有已注册应用，目前只有 link-admin
pnpm --filter @repo/e2e test:agent:all

# 由应用 package.json 约束测试范围
pnpm --filter link-admin test:agent:headed

# 安装 Agent Web 引擎使用的 Chromium
pnpm --filter @repo/e2e exec e2e-web install chromium
```

在 `apps/link-admin` 中：

```sh
# 全部 Agent 测试，有界面，关闭动作重放
pnpm test:agent:headed

# 按文件筛选（有同名文件时用相对于 packages/e2e 的路径）
pnpm test:agent:file guest-auth.e2e.ts --headed --no-cache

# 按测试标题正则筛选
pnpm test:agent:name "管理员可以使用邮箱密码登录并退出" --headed --no-cache

# 按 describe 标题筛选其下的用例
pnpm test:agent:name "账号认证" --headed --no-cache

# 同时限定文件和标题
pnpm test:agent:file guest-auth.e2e.ts --grep "管理员" --headed --no-cache

# 只验证匹配结果，不打开浏览器、不调用模型
pnpm test:agent:file guest-auth.e2e.ts --list
pnpm test:agent:name "管理员" --list
```

`test:agent:file` 使用原生文件筛选，请传入文件名；省略文件参数会运行应用的全部测试。`test:agent:name` 使用原生 `--grep`，必须传入正则表达式；匹配的是 describe 层级和测试标题拼接后的完整名称，可匹配 test/it 用例或一组 describe。`^...$` 可用于完整名称匹配，不匹配源码函数名。

两个筛选入口默认无界面，追加 `--headed` 即可显示浏览器。所有筛选仅作用于 link-admin，不改变应用地址。

`test:agent` 的第一个参数是应用 ID 或 `all`；未知 ID 立即报错。`--list` 转成原生测试发现命令，其他参数直接传给 e2e CLI。批量执行采用串行，任一应用失败则最终非零退出，不重新实现断言、重试或分片。

## 注意

- Agent 调用消耗 DeepSeek 余额，并可能发送页面语义内容和截图。不要测试含生产敏感信息的页面。
- 三个用例放在 `账号认证` serial 分组中，共享同一个浏览器上下文，按游客、管理员、GitHub 的顺序执行；不仅是设置 `workers: 1`。游客用例真实创建匿名用户；游客和管理员用例验证退出，GitHub 用例选择 `ruru077` 并验证返回首页，不主动退出。测试不自动清库，请勿使用生产管理员凭据。
- GitHub 用例要求测试浏览器中已具备可选择的 `ruru077` GitHub 会话；组内共享上下文，但新运行仍不继承日常浏览器的登录状态。若 GitHub 要求重新输入账号密码或二次验证，需要另行配置测试会话，不能仅靠 Select 完成。用例不主动退出不代表浏览器关闭后会保留会话。
- 保留原有限制：1 worker、0 retries、测试 180 秒、整次运行 240 秒，agent 最多 8 steps / 8 model calls。这不是费用上限。
- `.e2e/` 保存报告、trace、动作缓存，已被 Git 忽略。新路径/target 名称可能使旧动作缓存不再命中。
- `--no-cache` 禁用 Agent 动作重放；不要用 Turbo 缓存跳过真实浏览器验证，也不要同时中央批跑和应用命令扇出造成重复执行。
- 如需在 CLI 启动前禁用遥测，在进程环境设置 `E2E_TELEMETRY_DISABLED=1`；经本包脚本启动时，环境文件会先于 CLI 加载。
