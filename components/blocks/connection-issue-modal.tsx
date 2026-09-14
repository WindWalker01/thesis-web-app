"use client";

/**
 * ConnectionIssueModal — global modal for gateway-timeout / slow-connection
 * failures (HTTP 502/503/504, network errors, request timeouts).
 *
 * Shown automatically by the TanStack Query caches (see
 * `providers/react-query-provider.tsx`) whenever a query or mutation fails
 * with a connection-class error, and can also be triggered imperatively:
 *
 *   import { showConnectionIssueModal } from "@/components/blocks/connection-issue-modal";
 *   showConnectionIssueModal({ retry: () => myFetchAgain() });
 *
 * Uses a tiny module-level store (useSyncExternalStore) so any code — hooks,
 * non-React utilities, error handlers — can open the modal without prop
 * drilling or context wiring.
 */

import { useSyncExternalStore } from "react";
import { WifiOff, RotateCcw } from "lucide-react";
import { cn } from "@/lib/client-utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ConnectionIssueOptions {
  /** Optional callback re-running the failed request (Retry button). */
  retry?: () => void;
  /** Optional context snippet, e.g. "while uploading your artwork". */
  context?: string;
}

interface ConnectionIssueState {
  open: boolean;
  retry?: () => void;
  context?: string;
}

let state: ConnectionIssueState = { open: false };
const listeners = new Set<() => void>();

function emit(next: ConnectionIssueState) {
  state = next;
  for (const listener of listeners) listener();
}

/** Opens the modal. Duplicate calls while open refresh retry/context. */
export function showConnectionIssueModal(options: ConnectionIssueOptions = {}) {
  emit({ open: true, retry: options.retry, context: options.context });
}

/** Closes the modal (retry callback is discarded). */
export function hideConnectionIssueModal() {
  emit({ open: false });
}

function useConnectionIssue(): ConnectionIssueState {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => state,
    () => state,
  );
}

export function ConnectionIssueModal() {
  const { open, retry, context } = useConnectionIssue();

  const handleRetry = () => {
    hideConnectionIssueModal();
    retry?.();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) hideConnectionIssueModal();
      }}
    >
      <DialogContent className={cn("sm:max-w-md")}>
        <DialogHeader>
          <div className="bg-destructive/10 text-destructive mx-auto flex size-12 items-center justify-center rounded-full">
            <WifiOff className="size-6" aria-hidden />
          </div>
          <DialogTitle className="text-center">
            Slow connection detected
          </DialogTitle>
          <DialogDescription className="text-center">
            Your internet connection might be slow, or the server is taking too
            long to respond
            {context ? ` ${context}` : ""}. Please check your connection and
            try again in a moment.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={() => hideConnectionIssueModal()}>
            Dismiss
          </Button>
          {retry && (
            <Button onClick={handleRetry}>
              <RotateCcw className="size-4" aria-hidden />
              Try again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
