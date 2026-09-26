import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const reportMock = vi.fn();
const uploadMock = vi.fn();

vi.mock("@/features/user/auth/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: true, user: null, loading: false }),
}));

// Mock by resolved module path (the component uses relative imports, which
// resolve to these files from its own directory).
vi.mock("@/features/public/plagiarise-checker/server/report-plagiarism-match", () => ({
  reportPlagiarismMatch: (args: unknown) => reportMock(args),
}));
vi.mock(
  "@/features/public/plagiarise-checker/server/request-plagiarism-manual-review",
  () => ({ requestPlagiarismManualReview: vi.fn() }),
);
vi.mock("@/lib/cloudinary/direct-upload", () => ({
  uploadFileToCloudinary: (file: File, folder: string) =>
    uploadMock(file, folder),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { PendingActionBanner } from "../pending-action-banner";

// Valid base64 payload ("ABC") so atob() can rehydrate it into a File.
const PREVIEW_DATA_URL = "data:image/jpeg;base64,QUJD";

function seedPendingAction(extra: Record<string, unknown> = {}) {
  window.sessionStorage.setItem(
    "plagiarism-pending-action",
    JSON.stringify({
      action: "report",
      context: {
        origin: "internal",
        matchedArtworkId: "3213a9dc-ff10-40f2-8a1e-17017d1b40cb",
        matchedArtworkTitle: "PowerPuff Girls",
        matchedArtworkImageUrl: "https://cdn.test/matched.jpg",
        matchedArtworkUrl: "https://cdn.test/matched.jpg",
        similarity: 74.8,
        originalHash: "abc123",
        scanId: null,
      },
      filename: "my-original.png",
      proof: "This is my original work",
      details: "",
      ...extra,
    }),
  );
}

/** Opens the banner's report modal and waits for it to render. */
async function openModal(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /continue report/i }));
  return screen.findByRole("button", { name: /submit report/i });
}

describe("PendingActionBanner", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    reportMock.mockReset();
    uploadMock.mockReset();
    reportMock.mockResolvedValue({ success: true, message: "ok" });
    uploadMock.mockResolvedValue({
      secureUrl: "https://cdn.test/uploaded.jpg",
    });
  });

  it("restores the captured preview in the report modal", async () => {
    seedPendingAction({ originalPreviewDataUrl: PREVIEW_DATA_URL });
    const user = userEvent.setup();
    render(<PendingActionBanner />);

    await openModal(user);

    expect(screen.getByAltText("Artwork you uploaded")).toHaveAttribute(
      "src",
      PREVIEW_DATA_URL,
    );
  });

  it("re-uploads the restored preview so the report carries real evidence", async () => {
    seedPendingAction({ originalPreviewDataUrl: PREVIEW_DATA_URL });
    const user = userEvent.setup();
    render(<PendingActionBanner />);

    await user.click(await openModal(user));

    await waitFor(() => expect(reportMock).toHaveBeenCalled());
    expect(uploadMock).toHaveBeenCalledTimes(1);
    const [uploadedFile, folder] = uploadMock.mock.calls[0];
    expect(uploadedFile).toBeInstanceOf(File);
    expect(folder).toBe("plagiarism-review");

    // The admin receives a real Cloudinary URL, never a data URL.
    expect(reportMock.mock.calls[0][0]).toMatchObject({
      originalImageUrl: "https://cdn.test/uploaded.jpg",
      originalTitle: "my-original.png",
    });
  });

  it("still submits when the artwork cannot be attached", async () => {
    seedPendingAction({ originalPreviewDataUrl: PREVIEW_DATA_URL });
    uploadMock.mockRejectedValue(new Error("cloudinary down"));
    const user = userEvent.setup();
    render(<PendingActionBanner />);

    await user.click(await openModal(user));

    await waitFor(() => expect(reportMock).toHaveBeenCalled());
    // The reporter's statement must survive an upload failure.
    expect(reportMock.mock.calls[0][0].originalImageUrl).toBeNull();
    expect(reportMock.mock.calls[0][0].proof).toBe("This is my original work");
  });

  it("omits the upload entirely when no preview was captured", async () => {
    seedPendingAction();
    const user = userEvent.setup();
    render(<PendingActionBanner />);

    await user.click(await openModal(user));

    await waitFor(() => expect(reportMock).toHaveBeenCalled());
    expect(uploadMock).not.toHaveBeenCalled();
    expect(reportMock.mock.calls[0][0].originalImageUrl).toBeNull();
  });
});
