import { setTimeout as delay } from "node:timers/promises";
import { test } from "@e2e-dev/web";
import { credentials, expect, secrets } from "e2e";

test("OTP registration creates an account, signs in, and supports password login", async ({
  app,
  agent,
  browser,
  screen,
}) => {
  const user = credentials.user("registration");
  const name = "OTP Registration E2E";

  // One test keeps registration, sign-out and password sign-in in one browser context.
  await app.open("/auth/sign-up");
  await expect(
    screen.getByRole("button", "Continue as guest"),
  ).not.toBeVisible();
  await expect(screen.getByRole("button", /Continue with/)).not.toBeVisible();
  await expect(
    screen.getByRole("link", "Sign In", { exact: true }),
  ).toBeVisible();
  await screen.getByLabel("Name", { exact: true }).fill(name);
  await screen.getByLabel("Email", { exact: true }).fill(user.username);
  await expect(
    screen.getByLabel("Password", { exact: true }),
  ).not.toBeVisible();
  await agent.act("Click Send verification code to begin email registration.");
  await expect(
    screen.getByLabel("Verification code", { exact: true }),
  ).toBeVisible();
  await expect(
    screen.getByLabel("Password", { exact: true }),
  ).not.toBeVisible();

  // The runner resolves and redacts the OTP. Neither the model nor the browser gets the Resend key.
  await screen
    .getByLabel("Verification code", { exact: true })
    .fill(secrets.get("registration-otp"));
  await agent.act(
    "Click Verify email to submit the verification code already filled in.",
  );
  await expect(screen.getByLabel("Password", { exact: true })).toBeVisible();
  await screen.getByLabel("Password", { exact: true }).fill(user.password);

  await agent.act(
    "Click the Sign Up submit button once. Finish this action immediately after the click; do not wait for navigation or decide whether registration succeeded. The next test assertion checks the result.",
  );

  // The configured success destination is /, whose page redirects to /dashboard.
  await expect(browser).toHaveURL("/dashboard");
  await expect(
    screen.getByRole("heading", `Hello, ${name}`, { exact: true }),
  ).toBeVisible();
  await expect(
    screen.getByText(`Signed in as ${user.username}`, { exact: true }),
  ).toBeVisible();

  await agent.act(
    "Click the Sign out link in the dashboard content to sign out.",
  );
  await expect(browser).toHaveURL(/\/auth\/sign-in(?:\?|$)/);

  // Respect the server's send cooldown; do not bypass it through database edits.
  await delay(61_000);
  await app.open("/auth/sign-up");
  await screen
    .getByLabel("Name", { exact: true })
    .fill("Do Not Replace My Name");
  await screen.getByLabel("Email", { exact: true }).fill(user.username);
  await agent.act("Click Send verification code for the existing account.");
  await expect(
    screen.getByLabel("Verification code", { exact: true }),
  ).toBeVisible();
  await expect(
    screen.getByLabel("Password", { exact: true }),
  ).not.toBeVisible();
  await screen
    .getByLabel("Verification code", { exact: true })
    .fill(secrets.get("existing-account-otp"));
  await agent.act(
    "Click Verify email once. Finish immediately after clicking; the next assertion checks navigation.",
  );
  await expect(browser).toHaveURL("/dashboard");
  await expect(
    screen.getByRole("heading", `Hello, ${name}`, { exact: true }),
  ).toBeVisible();
  await expect(
    screen.getByText(`Signed in as ${user.username}`, { exact: true }),
  ).toBeVisible();

  await agent.act(
    "Click the Sign out link in the dashboard content to sign out.",
  );
  await expect(browser).toHaveURL(/\/auth\/sign-in(?:\?|$)/);

  await expect(screen.getByRole("button", "Continue as guest")).toBeVisible();
  await expect(
    screen.getByRole("button", /Continue with Google/),
  ).toBeVisible();
  await screen.getByLabel("Email", { exact: true }).fill(user.username);
  await screen.getByLabel("Password", { exact: true }).fill(user.password);
  await agent.act(
    "Click Sign In once using the email and password already filled in. Finish immediately after clicking; the next assertion checks navigation.",
  );
  await expect(browser).toHaveURL("/dashboard");
  await expect(
    screen.getByText(`Signed in as ${user.username}`, { exact: true }),
  ).toBeVisible();
});
