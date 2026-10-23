import { setTimeout as delay } from "node:timers/promises";

const SUBJECT = "Your Memo verification code";
const TIMEOUT_MS = 45_000;
const consumedEmailIds = new Set<string>();

type SentEmail = {
  id: string;
  to: string[];
  subject: string;
  created_at: string;
  text?: string | null;
  html?: string | null;
};

async function readResend<T>(path: string, deadline: number): Promise<T> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing RESEND_API_KEY in packages/e2e/.env");

  while (Date.now() < deadline) {
    const response = await fetch(`https://api.resend.com${path}`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(
        Math.min(10_000, Math.max(1, deadline - Date.now())),
      ),
    });
    if (response.status === 429 || response.status >= 500) {
      await response.body?.cancel();
      await delay(Math.min(2000, Math.max(0, deadline - Date.now())));
      continue;
    }
    if (!response.ok) {
      // Do not attach response bodies: they may include account information.
      throw new Error(
        `Resend read failed (HTTP ${response.status}). Check API key read permissions.`,
      );
    }
    return (await response.json()) as T;
  }
  throw new Error("Timed out reading the registration email from Resend.");
}

export async function readRegistrationOtp(): Promise<string> {
  const recipient = process.env.E2E_USER_REGISTRATION_USERNAME;
  const startedAt = Number(process.env.E2E_REGISTRATION_STARTED_AT);
  if (!recipient || !Number.isFinite(startedAt)) {
    throw new Error("Run registration tests through scripts/run-agent.ts.");
  }
  const deadline = Date.now() + TIMEOUT_MS;

  while (Date.now() < deadline) {
    let after: string | undefined;
    do {
      const page: { data: SentEmail[]; has_more: boolean } = await readResend(
        `/emails?limit=100${after ? `&after=${encodeURIComponent(after)}` : ""}`,
        deadline,
      );
      const email = page.data.find(
        (item) =>
          item.to.some(
            (address) => address.toLowerCase() === recipient.toLowerCase(),
          ) &&
          item.subject === SUBJECT &&
          !consumedEmailIds.has(item.id) &&
          Date.parse(item.created_at) >= startedAt - 5000,
      );
      if (email) {
        await delay(750);
        const detail = await readResend<SentEmail>(
          `/emails/${encodeURIComponent(email.id)}`,
          deadline,
        );
        if (!detail.to.includes(recipient) || detail.subject !== SUBJECT) {
          throw new Error(
            "Registration email metadata did not match this test run.",
          );
        }
        const content =
          detail.text || detail.html?.replace(/<[^>]*>/g, " ") || "";
        const codes = [...content.matchAll(/\b\d{6}\b/g)];
        if (codes.length !== 1) {
          throw new Error(
            "Expected exactly one six-digit registration code in the email.",
          );
        }
        consumedEmailIds.add(email.id);
        return codes[0]![0];
      }
      const last = page.data.at(-1);
      after =
        page.has_more && last && Date.parse(last.created_at) >= startedAt - 5000
          ? last.id
          : undefined;
      if (after) await delay(750);
    } while (after && Date.now() < deadline);
    await delay(Math.min(2000, Math.max(0, deadline - Date.now())));
  }
  throw new Error(
    "No matching registration email arrived in Resend within 45 seconds.",
  );
}
