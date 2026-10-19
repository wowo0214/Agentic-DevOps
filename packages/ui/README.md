# Shared UI

shadcn 组件、认证界面和主题样式由 `@repo/ui` 统一维护。

```tsx
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Auth, Settings } from "@repo/ui/auth";
```

应用添加 `"@repo/ui": "workspace:*"` 依赖，在全局 CSS 中引入：

```css
@import "@repo/ui/styles";
```

字体加载及字体变量由各应用配置。使用 Toaster 的应用需要提供 next-themes 的 ThemeProvider。

认证组件从 AuthProvider 获取客户端及导航配置。各应用保留页面路由、Providers、auth-client、服务端 auth 和环境变量；公共包提供 AuthProvider、Auth、Settings 和配套插件。

组件统一在本目录通过 `pnpm exec shadcn add <组件名>` 添加。应用目录不再维护 `components.json`，也不直接运行 shadcn CLI。

所有公开组件由 tsdown（基于 Rolldown）编译到 `dist`，同时生成 ESM、CommonJS 和类型声明，公共 CSS 同步到 `dist/styles.css`。配置集中在 `tsdown.config.mts`。

保留 shadcn 和第三方 registry 的默认目录结构，不移动下载文件，也不手动改写生成的 import。Better Auth UI 的组件下载到 `src/auth/`，插件下载到 `src/lib/auth/`。`src/auth.tsx` 通过显式的 `./auth/index` 保留现有聚合入口，避免与同名目录产生解析歧义。

`package.json.exports` 使用 `./*` 通配符统一映射到 `dist`，无需为每个组件新增配置，也不再通过脚本重写 package.json。`src/button.tsx` 和 `src/auth.tsx` 分别生成 `button`、`auth` 产物，使用地址保持 `@repo/ui/button`、`@repo/ui/auth`。CSS 保留独立的 `./styles` 导出。

tsdown 递归发现 `src` 下的 TypeScript 文件（排除声明、测试和 stories），按源码相对路径生成入口；`auth/*`、`lib/*` 和 hooks 均自动生成 JS 和类型声明，并由 exports 通配符公开，不需要逐个添加构建入口或聚合导出。构建保留模块结构和原有 `use client` 指令，以保留 Next.js 的组件边界。源码导入使用 `@repo/ui/button` 这样的包路径，不引用 `dist` 或 `.d.mts` 文件。

添加组件后运行 `pnpm build`，即可自动发现入口并生成产物。开发时运行 `pnpm dev`，启动时发现入口，之后监听源码和公共 CSS。监听运行期间新增或删除入口文件，需要重启 `pnpm dev`。

目录划分：

```text
packages/ui/src/
├─ button.tsx           # shadcn 公共组件，保留项目定制
├─ input.tsx
├─ sidebar.tsx
├─ sheet.tsx
├─ hooks/
│  └─ use-mobile.ts     # 导出为 @repo/ui/hooks/use-mobile
├─ auth.tsx             # 导出为 @repo/ui/auth
├─ auth/                # registry 默认组件目录，导出为 @repo/ui/auth/*
│  └─ anonymous/
│     └─ anonymous-button.tsx
├─ lib/                 # registry 默认工具目录，导出为 @repo/ui/lib/*
│  └─ auth/
│     └─ anonymous-plugin.ts
├─ counter-button/      # index.tsx、index.test.tsx
├─ link/                # index.tsx、index.test.tsx
└─ styles.css           # 公共主题
```

## 添加 Better Auth UI 插件

在 `packages/ui` 中运行：

```sh
pnpm exec shadcn add @better-auth-ui/anonymous
pnpm build
```

`components.json` 的 `components`、`ui` 和 `lib` 别名配合 `tsconfig.json`，会让 CLI 自动生成可用的包路径：

```tsx
import { AnonymousButton } from "@repo/ui/auth/anonymous/anonymous-button";
import { anonymousPlugin } from "@repo/ui/lib/auth/anonymous-plugin";
```

应用直接从插件路径导入并在 `AuthProvider` 注册，无需修改公共包的聚合入口。仍需按插件文档配置 Better Auth 服务端、客户端及数据库迁移；下载 UI 不会自动配置这些应用级能力。更新已有文件时先使用 `--dry-run --diff` 检查差异，避免覆盖项目定制。registry 可能声明 `@latest` 依赖，安装后应检查 package.json 和 lockfile 的版本变更。

运行 `pnpm test:registry` 可构建并验证 registry 默认路径的 ESM 导入、CommonJS 导出路径解析和类型声明产物。Better Auth UI 上游依赖仅提供 ESM 入口，因此认证模块面向 Next.js 等 ESM 消费场景；生成 CommonJS 文件不代表上游依赖支持原生 Node.js `require()`。
