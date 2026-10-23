type AuthFetchOptions = {
  method: "POST";
  headers?: Record<string, string>;
  body: Record<string, unknown>;
};

type AuthFetch = (
  path: string,
  options: AuthFetchOptions,
) => Promise<{ error: { message?: string } | null }>;

/** Better Auth's client exposes `$fetch`, but `AuthClient` from better-auth-ui does not type it. */
export function authFetch(authClient: unknown): AuthFetch {
  return (path, options) => (authClient as { $fetch: AuthFetch }).$fetch(path, options);
}
