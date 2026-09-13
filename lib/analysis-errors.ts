/**
 * Maps transport-level failures of a server-bound request (server action,
 * route handler, or direct backend call) into actionable user-facing
 * messages. Detection errors reported by the backend itself (e.g. JSON
 * `detail` fields, "Server error (500): ...") are surfaced verbatim so users
 * can copy them into an error report.
 *
 * Shared across features so every upload/analysis surface maps errors the
 * same way.
 */
export function describeAnalysisError(err: unknown): string {
  // DOMException (what AbortSignal.timeout throws) is not an `Error` subclass,
  // so extract `message` from any object carrying one.
  if (typeof err === "object" && err !== null && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string" && m) {
      return describeTransport(m);
    }
  }
  return "An unexpected error occurred.";
}

function describeTransport(message: string): string {
  // Next Server Action transport failure — on serverless hosts this is
  // typically the platform's request-body cap rejecting large uploads.
  if (message.includes("An unexpected response was received from the server")) {
    return "The analysis request was blocked before it could reach the service. This usually means the selected image(s) are too large — please use smaller or re-compressed images and try again.";
  }

  // Browser fetch network failure ("Failed to fetch" = Chrome, "Load failed" = Safari).
  if (message.includes("Failed to fetch") || message.includes("Load failed")) {
    return "Could not reach the analysis service. Check your internet connection and try again.";
  }

  // AbortSignal.timeout / user abort / gateway timeout.
  if (/aborted|timed ?out|timeout/i.test(message)) {
    return "The analysis request timed out. The service may be busy — please try again.";
  }

  return message;
}
