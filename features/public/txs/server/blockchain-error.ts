// ============================================
// Blockchain error message formatting
// ============================================
// Converts low-level ethers.js / JSON-RPC errors into human-readable
// messages suitable for UI surfaces, audit logs, and user notifications.

type EthersErrorLike = Error & {
  /** Machine-readable ethers error code, e.g. "UNKNOWN_ERROR". */
  code?: string;
  /** ethers' short, human-readable error message (when available). */
  shortMessage?: string;
  /** For "could not coalesce error": the original provider error body. */
  error?: { message?: string };
};

/**
 * Formats a blockchain-related error into a readable, user-facing message.
 *
 * ethers.js wraps unrecognized JSON-RPC errors (such as Polygon Amoy's
 * "Temporary internal error. Please retry") as "could not coalesce error"
 * and attaches the original provider response to the `.error` property.
 * This helper surfaces that original message instead of the cryptic wrapper.
 */
export function formatBlockchainError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Blockchain registration failed.";
  }

  const ethersError = error as EthersErrorLike;

  if (ethersError.code === "UNKNOWN_ERROR" && ethersError.error?.message) {
    const rpcMessage = ethersError.error.message.trim();

    if (/temporary internal error/i.test(rpcMessage)) {
      return "The Polygon Amoy RPC node returned a temporary internal error. Please retry the registration.";
    }

    return `The Polygon Amoy RPC node returned an unexpected error: ${rpcMessage}`;
  }

  // Known ethers errors (insufficient funds, nonce, reverts, etc.) already
  // carry a short, readable message; fall back to the full message otherwise.
  return ethersError.shortMessage ?? error.message;
}
