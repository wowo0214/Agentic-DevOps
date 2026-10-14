# Shared UI

shadcn 组件、认证界面和主题样式由 `@repo/ui` 统一维护。

```tsx
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Auth, Settings } from "@repo/ui/auth"
```

应用添加 `"@repo/ui": "workspace:*"` 依赖，在全局 CSS 中引入：

```css
@import "@repo/ui/styles";
```

字体加载及字体变量由各应用配置。使用 Toaster 的应用需要提供 next-themes 的 ThemeProvider。

认证组件从 AuthProvider 获取客户端及导航配置。各应用保留页面路由、Providers、auth-client、服务端 auth 和环境变量；公共包提供 AuthProvider、Auth、Settings 和配套插件。

组件统一在本目录通过 `pnpm exec shadcn add <组件名>` 添加。应用目录不再维护 `components.json`，也不直接运行 shadcn CLI。

所有公开组件由 Bunchee 编译到 `dist`，公共 CSS 同步到 `dist/styles.css`。Auth 的辅助文件属于内部实现，不单独导出。

shadcn 组件保留 CLI 默认生成的单文件形式，不再手动移到组件文件夹。第三方多文件模块通过目录中的 `index.tsx` 或 `index.ts` 公开 API。同名组件只保留一个入口，不能同时存在 `button.tsx` 和 `button/index.tsx`。

`package.json.exports` 使用 `./*` 通配符统一映射到 `dist`，无需为每个组件新增配置，也不再通过脚本重写 package.json。`src/button.tsx` 和 `src/auth/index.tsx` 都分别生成 `button`、`auth` 产物，使用地址保持 `@repo/ui/button`、`@repo/ui/auth`。CSS 保留独立的 `./styles` 导出。

`scripts/entry-points.mjs` 只负责选择构建入口：公开 `src` 顶层源码文件、模块目录的 index 入口和 `src/hooks` 下的共享 Hook；排除测试、类型声明及模块内部文件。Auth、Link、CounterButton 和 lib 的内部路径通过 exports 中的 null 映射禁止外部访问。新增多文件模块时可以同样增加一条 `./模块名/*: null`，仍然只公开模块的 index。`src/lib` 是内部工具目录。源码导入公共组件统一使用 `@repo/ui/button` 这样的路径，不引用 `dist` 或 `.d.mts` 文件。

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
├─ lib/                # 内部工具
├─ auth/                # 公共认证组件，index.tsx 是唯一公开入口
│  └─ lib/              # Auth 内部工具，不对外导出
├─ counter-button/      # index.tsx、index.test.tsx
├─ link/                # index.tsx、index.test.tsx
└─ styles.css           # 公共主题
```
