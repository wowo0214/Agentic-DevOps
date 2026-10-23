import { describe, test } from "@e2e-dev/web";
import { credentials, expect } from "e2e";

describe("账号认证", { serial: true }, () => {
  test("游客可以登录并退出", async ({ app, agent, browser, screen }) => {
    await app.open("/auth/sign-in");
    await expect(screen.getByRole("button", "Continue as guest")).toBeVisible();

    await agent.act("点击 Continue as guest，以游客身份登录。");
    await expect(browser).toHaveURL("/");
    await expect(screen.getByText("Playground", { exact: true })).toBeVisible();

    await expect(screen.getByRole("button", "用户菜单", { exact: true })).toBeVisible();
    await agent.act("点击侧边栏底部名为“用户菜单”的按钮，展开菜单。");
    await expect(screen.getByRole("menuitem", "Sign Out")).toBeVisible();

    await agent.act("点击用户菜单中的 Sign Out，退出当前账号。");
    await expect(browser).toHaveURL("/auth/sign-in");
    await expect(screen.getByRole("button", "Sign In")).toBeVisible();
    await expect(screen.getByRole("button", "Continue as guest")).toBeVisible();
  });

  test("管理员可以使用邮箱密码登录并退出", async ({ app, agent, browser, screen }) => {
    const admin = credentials.user("admin");
    await app.open("/auth/sign-in");
    await expect(screen.getByRole("button", "Sign In")).toBeVisible();

    await screen.getByLabel("Email", { exact: true }).fill(admin.username);
    await screen.getByLabel("Password", { exact: true }).fill(admin.password);
    await agent.act("点击 Sign In 按钮，使用填写的邮箱和密码登录。");
    await expect(browser).toHaveURL("/");
    await expect(screen.getByText("Playground", { exact: true })).toBeVisible();

    await expect(screen.getByRole("button", "用户菜单", { exact: true })).toBeVisible();
    await agent.act("点击侧边栏底部名为“用户菜单”的按钮，展开菜单。");
    await expect(screen.getByRole("menuitem", "Sign Out")).toBeVisible();

    await agent.act("点击用户菜单中的 Sign Out，退出当前账号。");
    await expect(browser).toHaveURL("/auth/sign-in");
    await expect(screen.getByRole("button", "Sign In")).toBeVisible();
    await expect(screen.getByRole("button", "Continue as guest")).toBeVisible();
  });

  test("用户可以使用 GitHub 的 ruru077 账号登录", async ({ app, agent, browser, screen }) => {
    await app.open("/auth/sign-in");
    await expect(
      screen.getByRole("button", "GitHub Continue with GitHub", {
        exact: true,
      }),
    ).toBeVisible();

    await agent.act("点击 Continue with GitHub 按钮，进入 GitHub 登录流程。");
    await agent.act(
      "在 GitHub 账号选择页面选择 ruru077 账号对应的 Select 按钮。若出现 OAuth 授权确认，完成本应用的登录授权并返回应用。不要选择其他账号，不要修改账号设置，不要退出登录。",
    );

    await expect(browser).toHaveURL("/");
    await expect(screen.getByText("Playground", { exact: true })).toBeVisible();
    await expect(screen.getByRole("button", "用户菜单", { exact: true })).toBeVisible();
  });
});
