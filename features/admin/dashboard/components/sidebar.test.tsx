import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { Sidebar } from "@/features/admin/dashboard/components/sidebar";

const { signOutMock, clearQueryCacheMock } = vi.hoisted(() => ({
  signOutMock: vi.fn(),
  clearQueryCacheMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/dashboard",
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      layoutId,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { layoutId?: string }) => {
      void layoutId;
      return React.createElement("div", props);
    },
  },
}));

vi.mock("@/features/admin/artwork-verification/hooks/useReviews", () => ({
  usePendingReviewCount: () => ({ data: 3 }),
}));

vi.mock("@/features/(user)/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { email: "admin@example.com" },
    signOut: signOutMock,
  }),
}));

vi.mock("@/providers/react-query-provider", () => ({
  clearQueryCache: clearQueryCacheMock,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DropdownMenuGroup: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DropdownMenuSeparator: () => React.createElement("hr"),
  DropdownMenuItem: ({
    children,
    onSelect,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    onSelect?: (e: { preventDefault: () => void }) => void;
    disabled?: boolean;
  }) =>
    React.createElement(
      "button",
      {
        type: "button",
        disabled,
        onClick: () => onSelect?.({ preventDefault: () => undefined }),
        ...props,
      },
      children,
    ),
}));

describe("Admin Sidebar", () => {
  beforeEach(() => {
    signOutMock.mockReset();
    clearQueryCacheMock.mockReset();
    clearQueryCacheMock.mockResolvedValue(undefined);
    signOutMock.mockResolvedValue(undefined);
  });

  it("applies sticky viewport classes on desktop sidebar shell", () => {
    const { container } = render(
      <Sidebar isOpen={false} onToggle={vi.fn()} onClose={vi.fn()} />,
    );

    const aside = container.querySelector("aside");
    expect(aside).toBeInTheDocument();
    expect(aside).toHaveClass("sticky");
    expect(aside).toHaveClass("top-0");
    expect(aside).toHaveClass("h-screen");
  });

  it("renders hydrated admin identity from email", async () => {
    render(<Sidebar isOpen={true} onToggle={vi.fn()} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getAllByText("admin")[0]).toBeInTheDocument();
    });
    expect(screen.getAllByText("admin@example.com")[0]).toBeInTheDocument();
  });

  it("opens footer dropdown and runs logout flow with pending label", async () => {
    let resolveSignOut: () => void = () => {};
    signOutMock.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSignOut = resolve;
      }),
    );

    render(<Sidebar isOpen={false} onToggle={vi.fn()} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText("Log out"));

    await waitFor(() => {
      expect(screen.getByText("Logging out...")).toBeInTheDocument();
    });

    expect(clearQueryCacheMock).toHaveBeenCalledTimes(1);
    expect(signOutMock).toHaveBeenCalledTimes(1);

    resolveSignOut();
  });
});
