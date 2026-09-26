import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ContactArtistModal } from "../ContactArtistModal";
import { EMPTY_MESSAGE_ERROR } from "../../lib/inquiry";

vi.mock("../../server/artist-contact", () => ({
  createArtworkInquiryMailto: vi.fn(),
}));

import { createArtworkInquiryMailto } from "../../server/artist-contact";

const mockCreate = vi.mocked(createArtworkInquiryMailto);

const baseProps = {
  open: true,
  artId: "11111111-1111-1111-1111-111111111111",
  artworkTitle: "Sunset over Manila",
  artistName: "Juan Dela Cruz",
};

function renderModal(
  overrides: Partial<typeof baseProps> = {},
) {
  const onOpenChange = vi.fn();
  render(
    <ContactArtistModal
      {...baseProps}
      onOpenChange={onOpenChange}
      {...overrides}
    />,
  );
  return { onOpenChange };
}

beforeEach(() => {
  mockCreate.mockReset();
});

describe("ContactArtistModal", () => {
  it("populates the artwork and artist read-only fields", () => {
    renderModal();

    const artworkInput = screen.getByLabelText("Artwork") as HTMLInputElement;
    const artistInput = screen.getByLabelText("Artist") as HTMLInputElement;

    expect(artworkInput.value).toBe("Sunset over Manila");
    expect(artworkInput.disabled).toBe(true);
    expect(artistInput.value).toBe("Juan Dela Cruz");
    expect(artistInput.disabled).toBe(true);
  });

  it("rejects an empty message without calling the server action", async () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: /send inquiry/i }));

    expect(await screen.findByText(EMPTY_MESSAGE_ERROR)).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects a whitespace-only message", async () => {
    renderModal();

    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: /send inquiry/i }));

    expect(await screen.findByText(EMPTY_MESSAGE_ERROR)).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("sends a valid message and shows success", async () => {
    mockCreate.mockResolvedValue({
      success: true,
      mailtoUrl:
        "mailto:artist@example.com?subject=Hi&body=Hello",
    });

    renderModal();

    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "I would like to license this artwork." },
    });
    fireEvent.click(screen.getByRole("button", { name: /send inquiry/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        baseProps.artId,
        "I would like to license this artwork.",
      );
    });

    expect(
      await screen.findByText(/your inquiry has been prepared for the artist/i),
    ).toBeInTheDocument();
  });

  it("shows a server error message when preparation fails", async () => {
    mockCreate.mockResolvedValue({
      success: false,
      message: "The artist has not provided a contact email for inquiries.",
    });

    renderModal();

    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "Hello!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send inquiry/i }));

    expect(
      await screen.findByText(
        /the artist has not provided a contact email/i,
      ),
    ).toBeInTheDocument();
  });

  it("cancel closes the dialog and notifies the parent", () => {
    const { onOpenChange } = renderModal();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

