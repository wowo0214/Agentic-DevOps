This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Better Auth 管理员插件

服务端和客户端已启用 Better Auth Admin 插件。新用户默认仍为 `user`，不会自动获得管理员权限；管理员角色为 `admin`。插件提供管理 API，不会自动生成用户管理页面。

### 数据库迁移

部署新配置前，先备份数据库。在本应用目录 `apps/link-admin` 中，确保 `DATABASE_URL` 指向预期数据库，然后运行 Better Auth CLI 的迁移命令，检查并确认变更：

```bash
pnpm dlx auth migrate
```

Admin 插件需要为 `user` 表增加 `role`、`banned`、`banReason`、`banExpires` 字段，为 `session` 表增加 `impersonatedBy` 字段。仅修改认证配置不会自动更新数据库。

### 首次授权管理员

迁移完成后，通过受控的数据库运维连接，为经过核实的现有账号设置管理员角色。下面的 SQL 使用 PostgreSQL 参数，`$1` 必须绑定为该账号的实际用户 ID：

```sql
UPDATE "user"
SET "role" = 'admin'
WHERE "id" = $1
RETURNING "id", "email", "role";
```

检查返回结果，确认只授权了预期账号，然后让管理员退出并重新登录。不要将该 SQL 暴露为公开接口，也不要将注册用户的默认角色改为 `admin`。

### 管理员重置用户密码

核实目标用户身份后，可在已登录的管理员会话中使用 `authClient.admin.setUserPassword({ userId, newPassword })`。它无需旧密码，Better Auth 会负责密码校验及哈希处理。

重置成功后，再调用 `authClient.admin.revokeUserSessions({ userId })` 撤销目标用户的现有会话。两次调用都需要检查返回的 `error`；若密码已更新但撤销会话失败，应单独重试撤销操作，不要将其报告为全部成功。通过安全渠道交付临时密码，并让用户登录后立即修改；插件不会自动强制首次登录改密。

服务端对应接口为 `auth.api.setUserPassword` 和 `auth.api.revokeUserSessions`，调用时必须传入携带当前管理员会话的 `headers`。普通用户和未登录请求无权执行这些管理操作。

## API 响应约定

共享包 `@repo/http-contract` 提供 HTTP 响应契约和 `R` 工厂。带响应体的结果统一为 `HResponse<T>`，结构为 `code / msg / data`；工厂同时设置真实 HTTP 状态，保证响应体 `code` 与 HTTP 状态一致。

```ts
import { R, type HResponse } from "@repo/http-contract";

return R.ok(); // HTTP 200，{ code: 200, msg: '操作成功', data: [] }
return R.ok(user, "更新成功"); // HTTP 200，code: 200，data 为实际结果
return R.created(user, "创建成功"); // HTTP 201，code: 201
return R.noContent(); // HTTP 204，无响应体
return R.resetContent(); // HTTP 205，无响应体
return R.error("用户不存在", 404); // HTTP 404，code: 404，data: []
return R.error("更新用户角色失败"); // HTTP 500，code: 500
```

- 响应体固定为 `{ code, msg, data }`。`code` 由封装根据 HTTP 状态自动填写，业务代码不得手工维护两份状态码。
- 未提供数据或数据为 `null` 时使用 `[]`，保留 `0`、`false` 和空字符串。
- `R.ok` 固定返回 200，`R.created` 固定返回 201；它们都返回 JSON 响应体。
- `R.noContent` 返回 204，表示操作成功但没有内容；`R.resetContent` 返回 205，额外要求客户端重置当前文档视图。RFC 9110 规定这两个状态不能携带响应内容，因此它们返回空响应，不使用 `HResponse<T>`。
- `R.error` 只接受 4xx/5xx，防止把错误包装为 HTTP 200。
- 前端使用 `response.ok` 判断成功与否，读取 `msg` 展示提示，使用 `data` 更新页面；不能把“HTTP 成功”当作未经数据库确认的写入凭据。
- 工厂不负责鉴权、执行数据库操作或捕获异常。只在确认写入成功后调用 `R.ok`；未知异常记录在服务端，向客户端返回通用错误信息。
- 当前仅在 `/api/crud` 的 PATCH 中示范使用；该示例尚未增加管理员鉴权，不应作为公开的提权接口部署。其他演示方法与 Better Auth 路由的返回格式保持原样。

参考：[RuoYi-Cloud R](https://github.com/yangzongzhuan/RuoYi-Cloud/blob/master/ruoyi-common/ruoyi-common-core/src/main/java/com/ruoyi/common/core/domain/R.java)、[RuoYi-Vue AjaxResult](https://github.com/yangzongzhuan/RuoYi-Vue/blob/master/ruoyi-common/src/main/java/com/ruoyi/common/core/domain/AjaxResult.java)。Cloud 的方法为 `ok` / `fail`，Vue 的方法为 `success` / `error`。本项目保留 RuoYi 的 `code / msg / data` 结构，但进一步让 `code` 与真实 HTTP 状态同步，前端仍应优先使用 `response.ok` 判断 HTTP 请求是否成功。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
