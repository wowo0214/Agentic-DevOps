# 测试架构

## 已实现

- 中央浏览器测试包 `packages/e2e`，只注册当前使用的 `link-admin`。
- `shared/apps.ts` 是地址与应用 ID 的单一注册入口。
- `shared/env.ts` 加载测试包环境；应用脚本只选择 scope，不读取应用 `.env`。
- 单一根配置 `e2e.config.ts`，`config/agent.ts` 根据应用 ID 匹配 `__tests__/<app>/agent/**/*.e2e.ts`。
- `scripts/run-agent.ts` 接收应用 ID 或 `all`，串行调用原生 runner，汇总退出码。应用脚本固定自己的 ID。
- 现有游客流程原样迁移至 `__tests__/link-admin/agent/guest-auth.e2e.ts`。
- 应用地址必须显式配置 `LINK_ADMIN_E2E_URL`；必须选择应用，不支持无应用 ID 的本地模式，不读取 `E2E_APP_URL`。缺失或无效时立即报错，不修改私有环境文件。
- link-admin 提供 `test:agent:file <file>` 与 `test:agent:name <pattern>`，分别转发原生文件筛选和 `--grep`。名称匹配包含 describe 层级，所有筛选限制在应用命名空间内。

## 后续按需加入

- Playwright Test：包根 `playwright.config.ts`，共享应用地址，原生 projects 匹配 `__tests__/<app>/playwright/**/*.spec.ts`。
- `fixtures/playwright/<app>.ts`：准备及释放登录状态、浏览器上下文；登录流程测试本身不使用预登录 fixture。
- `pages/<app>/`：只在确定性操作出现实际复用时提取。不要把 Agent 替换为预写点击脚本。
- `__tests__/cross-app/`：真正的联动测试使用独立上下文，先确认接收端订阅就绪，再在发送端触发操作，并关联本次消息。若接收端只有 WS 服务，则使用协议客户端。
- Vitest：单元、组件、数据库集成测试留在所属应用/包，不在本次迁移中改动现有 Jest/Vitest。

不创建 data/Faker/测试数据工厂。使用测试环境已有数据；修改类测试仍需限定允许修改的记录及恢复方案，不无范围清库。

## 新应用加入方式

1. 在 `shared/apps.ts` 注册唯一 ID、环境地址与必要的 Agent 上下文。
2. 创建 `__tests__/<app>/agent/` 并加入测试。
3. 在应用 package.json 转发 `pnpm --filter @repo/e2e test:agent <app>`。

无需新增应用专属 Agent config；中央 `test:agent:all` 自动遍历注册表。各 runner 的 fixture、Page 和认证状态不强制共用。未来存在并行运行需求时，再按 runner/app/run 隔离产物并设置并发上限。

## 运行边界

- 原生 Windows 可运行，WSL 是可选环境。
- 默认连接已启动应用；后续 CI 由唯一编排层管理服务生命周期。
- 浏览器测试不启用 Turbo 结果缓存；中央批跑与应用转发扇出二选一。
- Agent 模型仅在 Agent 配置中构造；未来确定性 Playwright 测试不应需要模型密钥。
- 报告、截图、认证状态与模型对话可能含敏感信息，不提交 Git。

具体配置与命令见 [README](./README.md)。
