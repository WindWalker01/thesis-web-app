import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { ArtworkDropzone } from "@/features/(user)/upload-artwork/components/artwork-dropzone";

type DropzoneOverrides = Partial<
  React.ComponentProps<typeof ArtworkDropzone>
>;

function renderDropzone(overrides: DropzoneOverrides = {}) {
  const inputRef = React.createRef<HTMLInputElement>();
  const props: React.ComponentProps<typeof ArtworkDropzone> = {
    file: undefined,
    previewUrl: null,
    dragOver: false,
    setDragOver: vi.fn(),
    inputRef,
    showProgressView: false,
    fileError: undefined,
    onDrop: vi.fn(),
    onFileSelect: vi.fn(),
    onRemoveFile: vi.fn(),
    ...overrides,
  };

  const utils = render(<ArtworkDropzone {...props} />);
  return { ...utils, props, inputRef };
}

describe("ArtworkDropzone", () => {
  it("renders the empty-state prompt when no file is selected", () => {
    renderDropzone();

    expect(
      screen.getByText("Drag and drop your artwork here"),
    ).toBeInTheDocument();
  });

  it("derives supported-format badges (includes PNG and SVG)", () => {
    renderDropzone();

    expect(screen.getAllByText("PNG").length).toBeGreaterThan(0);
    expect(screen.getByText("SVG")).toBeInTheDocument();
  });

  it("disables the file input while the pipeline is running", () => {
    const { inputRef } = renderDropzone({ showProgressView: true });

    expect(inputRef.current).toBeDisabled();
  });

  it("invokes onFileSelect with the chosen file", () => {
    const onFileSelect = vi.fn();
    const { inputRef } = renderDropzone({ onFileSelect });

    const file = new File(["data"], "art.png", { type: "image/png" });
    fireEvent.change(inputRef.current!, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it("sets drag state on drag over when interactive", () => {
    const setDragOver = vi.fn();
    renderDropzone({ setDragOver });

    fireEvent.dragOver(screen.getByRole("button"));

    expect(setDragOver).toHaveBeenCalledWith(true);
  });

  it("ignores drag over while the pipeline is running", () => {
    const setDragOver = vi.fn();
    renderDropzone({ setDragOver, showProgressView: true });

    fireEvent.dragOver(screen.getByRole("button"));

    expect(setDragOver).not.toHaveBeenCalled();
  });

  it("shows a file error message when provided", () => {
    renderDropzone({ fileError: "Unsupported file format." });

    expect(screen.getByText("Unsupported file format.")).toBeInTheDocument();
  });
});
