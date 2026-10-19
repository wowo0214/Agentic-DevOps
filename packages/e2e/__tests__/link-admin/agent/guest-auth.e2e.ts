import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("游客可以登录并退出", async ({ app, agent, browser, screen }) => {
  await app.open("/auth/sign-in");
  await expect(screen.getByRole("button", "Continue as guest")).toBeVisible();

  await agent.act("点击 Continue as guest，以游客身份登录。");
  await expect(browser).toHaveURL("/");
  await expect(screen.getByText("Playground", { exact: true })).toBeVisible();

  await expect(
    screen.getByRole("button", "用户菜单", { exact: true }),
  ).toBeVisible();
  await agent.act("点击侧边栏底部名为“用户菜单”的按钮，展开菜单。");
  await expect(screen.getByRole("menuitem", "Sign Out")).toBeVisible();

  await agent.act("点击用户菜单中的 Sign Out，退出当前账号。");
  await expect(browser).toHaveURL("/auth/sign-in");
  await expect(screen.getByRole("button", "Sign In")).toBeVisible();
  await expect(screen.getByRole("button", "Continue as guest")).toBeVisible();
});
