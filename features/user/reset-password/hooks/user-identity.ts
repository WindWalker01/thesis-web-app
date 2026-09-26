/**
 * Determines whether the user signing in via the recovery session has no
 * password-based credential yet (e.g. an account created through Google
 * OAuth). Such users are setting a password for the first time, which
 * *adds* email sign-in alongside their existing OAuth provider sign-in.
 *
 * We rely on `identities` (the authoritative per-provider list in
 * `auth.identities`) and fall back to `app_metadata.provider` for older
 * session payloads that may not include identities.
 */
export function isOAuthOnlyUser(
  user: {
    app_metadata?: { provider?: string };
    identities?: { provider: string }[] | null;
  } | null,
): boolean {
  if (!user) return false;

  if (user.identities && user.identities.length > 0) {
    // A password credential is represented by an "email" identity.
    return !user.identities.some((identity) => identity.provider === "email");
  }

  return Boolean(user.app_metadata?.provider && user.app_metadata.provider !== "email");
}
