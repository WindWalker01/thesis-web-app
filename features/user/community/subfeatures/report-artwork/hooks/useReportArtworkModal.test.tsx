import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { useReportArtworkModal } from "@/features/user/community/subfeatures/report-artwork/hooks/useReportArtworkModal";

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("useReportArtworkModal", () => {
  it("clears validation errors when the user edits a field", async () => {
    const onSubmit = vi.fn().mockResolvedValue({
      success: true,
      message: "ok",
    });

    const { result } = renderHook(
      () =>
        useReportArtworkModal({
          open: true,
          onOpenChange: vi.fn(),
          onSubmit,
          postId: "11111111-1111-4111-8111-111111111111",
        }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.error).toBeTruthy();

    act(() => {
      result.current.setDetails("This artwork was traced without permission.");
    });

    expect(result.current.error).toBeNull();
  });

  it("resets form fields when the modal reopens", async () => {
    const { result, rerender } = renderHook(
      ({ open }: { open: boolean }) =>
        useReportArtworkModal({
          open,
          onOpenChange: vi.fn(),
          onSubmit: vi.fn().mockResolvedValue({ success: true, message: "ok" }),
          postId: "11111111-1111-4111-8111-111111111111",
        }),
      {
        initialProps: { open: true },
        wrapper: createWrapper(),
      },
    );

    act(() => {
      result.current.setReason("other");
      result.current.setDetails("Some details");
      result.current.setContext("Some context");
    });

    rerender({ open: false });
    rerender({ open: true });

    await waitFor(() => {
      expect(result.current.reason).toBe("copyright");
      expect(result.current.details).toBe("");
      expect(result.current.context).toBe("");
      expect(result.current.error).toBeNull();
    });
  });
});
