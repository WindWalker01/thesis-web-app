/**
 * Gateway-timeout / connection-issue detection.
 *
 * Central place for deciding whether a thrown error represents a gateway
 * timeout (502/503/504 from Supabase, Vercel, or the digital-art API) or a
 * network-level failure, so the shared ConnectionIssueModal can be shown
 * instead of a generic error toast.
 *
 * Note: string error codes from PostgREST (e.g. "PGRST116") and HTTP-level
 * app errors (400/401/404) are intentionally NOT treated as connection
 * issues — those have their own domain-specific handling.
 */

const GATEWAY_STATUS_CODES = new Set([502, 503, 504, 522, 524, 529]);

const GATEWAY_MESSAGE_PATTERN =
  /gateway\s?-?timeout|timed?\s?-?out|etimedout|econnaborted|enotfound|econnrefused|eai_again|failed to fetch|load failed|networkerror|network error|fetch failed|status code (?:502|503|504|522|524|529)/i;

/**
 * Returns true when the error looks like a gateway timeout (502/503/504 and
 * related Cloudflare/Supabase codes) or a network-level failure, as opposed
 * to an application/data error (e.g. 400 validation, 401 auth, 404).
 */
export function isGatewayTimeoutError(error: unknown): boolean {
  if (error === null || error === undefined) return false;

  // Browser fetch/network failures surface as TypeError ("Failed to fetch");
  // timeout aborts surface as DOMException AbortError/TimeoutError.
  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    return error.name === "AbortError" || error.name === "TimeoutError";
  }
  if (error instanceof TypeError) return true;

  if (typeof error === "object") {
    const candidate = error as {
      status?: unknown;
      statusCode?: unknown;
      code?: unknown;
      cause?: unknown;
    };

    for (const key of ["status", "statusCode", "code"] as const) {
      const value = candidate[key];
      if (typeof value === "number" && GATEWAY_STATUS_CODES.has(value)) {
        return true;
      }
      if (typeof value === "string" && GATEWAY_MESSAGE_PATTERN.test(value)) {
        return true;
      }
    }

    // Unwrap wrapped errors (e.g. new Error("...", { cause: upstreamError }))
    if (candidate.cause) {
      return isGatewayTimeoutError(candidate.cause);
    }
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  return GATEWAY_MESSAGE_PATTERN.test(message);
}
