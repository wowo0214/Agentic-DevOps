"use client";

import { captchaPlugin, type CaptchaRenderProps } from "@better-auth-ui/react/plugins/captcha";
import { useAuth } from "@better-auth-ui/react";
import { Turnstile } from "@marsidev/react-turnstile";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type PropsWithChildren, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

export const CAPTCHA_REQUIRED_EVENT = "auth:captcha-required";

type ChallengeState = "idle" | "required" | "solved";

const CaptchaScope = createContext<{
  solved: () => void;
  finish: () => void;
} | null>(null);

/** Better Fetch options for the auth client: announce server-demanded challenges. */
export const captchaRequiredFetchOptions = {
  onError(context: { error: unknown }) {
    if ((context.error as { code?: string } | undefined)?.code === "CAPTCHA_REQUIRED" && typeof window !== "undefined") {
      window.dispatchEvent(new Event(CAPTCHA_REQUIRED_EVENT));
    }
  },
};

/**
 * The widget stays unmounted until the server answers CAPTCHA_REQUIRED
 * (suspicious or repeated activity). Once solved, the token rides on the
 * next submit and the widget is dropped again when the form resets.
 */
export function AuthCaptchaBoundary({ children }: PropsWithChildren) {
  const { plugins } = useAuth();
  const [state, setState] = useState<ChallengeState>("idle");
  const solved = useCallback(() => setState("solved"), []);
  const finish = useCallback(() => setState("idle"), []);
  const value = useMemo(() => ({ solved, finish }), [solved, finish]);
  const host = plugins.find((plugin) => plugin.captchaHost)?.captchaHost;

  useEffect(() => {
    if (!host) return;
    const onRequired = () => setState((current) => (current === "idle" ? "required" : current));
    window.addEventListener(CAPTCHA_REQUIRED_EVENT, onRequired);
    return () => window.removeEventListener(CAPTCHA_REQUIRED_EVENT, onRequired);
  }, [host]);

  return (
    <CaptchaScope.Provider value={value}>
      {children}
      {state !== "idle" && host}
    </CaptchaScope.Provider>
  );
}

/** Forms render this slot; the widget itself is mounted on demand by the boundary. */
function CaptchaPresence() {
  return null;
}

function TurnstileCaptcha({ siteKey, setToken, clearToken, setReset }: CaptchaRenderProps & { siteKey: string }) {
  const scope = useContext(CaptchaScope);
  const dialog = useRef<HTMLDialogElement>(null);
  const hasToken = useRef(false);
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);
  const finish = scope?.finish;
  const solved = scope?.solved;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    // Open right away so the user sees why they are waiting while Turnstile loads.
    if (done) element.close();
    else if (!element.open) element.showModal();
    return () => element.close();
  }, [mounted, done]);

  useEffect(() => {
    setReset(() => {
      // The request that triggered the challenge also resets the form: ignore it.
      if (!hasToken.current) return;
      hasToken.current = false;
      finish?.();
    });
    return () => setReset(null);
  }, [setReset, finish]);

  function fail() {
    hasToken.current = false;
    clearToken();
    setFailed(true);
  }

  function expire() {
    hasToken.current = false;
    clearToken();
    finish?.();
  }

  if (!mounted) return null;

  return createPortal(
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => event.preventDefault()}
      className="fixed inset-0 m-0 h-dvh w-screen max-h-none max-w-none border-0 bg-background p-6 text-foreground open:flex open:items-center open:justify-center backdrop:bg-background"
    >
    <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
      <div className="space-y-2">
        <h1 id={titleId} className="text-2xl font-semibold">Additional verification required</h1>
        <p className="text-sm text-muted-foreground">
          We noticed unusual activity. Verifying your browser, this may take a few seconds. You will return to your form automatically.
        </p>
      </div>
      <Turnstile
        siteKey={siteKey}
        options={{ theme: "auto", size: "flexible", action: "auth" }}
        onSuccess={(token) => {
          setFailed(false);
          hasToken.current = true;
          setToken(token);
          setDone(true);
          solved?.();
          toast.success("Verification complete. Please submit again.");
        }}
        onExpire={expire}
        onTimeout={expire}
        onError={fail}
        onUnsupported={fail}
        scriptOptions={{ onError: fail }}
      />
      {failed && (
        <p role="alert" className="text-sm text-destructive">
          Human verification could not load. Please refresh and try again.
        </p>
      )}
    </div>
    </dialog>,
    document.body,
  );
}

export function turnstilePlugin(siteKey: string): ReturnType<typeof captchaPlugin> & { captchaHost: ReactNode } {
  const plugin = captchaPlugin({
    render: (props) => <TurnstileCaptcha {...props} siteKey={siteKey} />,
  });
  return {
    ...plugin,
    captchaHost: plugin.captchaComponent,
    captchaComponent: <CaptchaPresence />,
  };
}
