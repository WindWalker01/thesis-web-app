"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/client-utils";
import { MAX_EVIDENCE_FILE_SIZE, ALLOWED_EVIDENCE_MIME_TYPES, isAllowedFileType } from "@/features/reports/schemas/report-schemas";
import { toast } from "sonner";

type ReplyBoxProps = {
  reportId: string;
  onSend: (message: string) => Promise<void>;
  onUploadEvidence?: (file: File, description?: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
};

export function ReplyBox({
  reportId,
  onSend,
  onUploadEvidence,
  disabled = false,
  placeholder = "Type your message...",
}: ReplyBoxProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await onSend(trimmed);
      setMessage("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadEvidence) return;

    // Validate file size
    if (file.size > MAX_EVIDENCE_FILE_SIZE) {
      toast.error("File must be under 10MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate file type
    if (!isAllowedFileType(file.type, file.name)) {
      toast.error("Unsupported file type");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    try {
      await onUploadEvidence(file);
      toast.success("Evidence uploaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload evidence");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Textarea
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          rows={3}
          className="min-h-[80px] resize-none"
          aria-label="Reply message"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isUploading || !onUploadEvidence}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <svg
                  className="mr-1.5 h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg
                  className="mr-1.5 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                Attach File
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EVIDENCE_MIME_TYPES.join(",")}
            className="hidden"
            onChange={handleFileChange}
            aria-label="Upload evidence file"
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim() || isSending}
          size="sm"
        >
          {isSending ? (
            <>
              <svg
                className="mr-1.5 h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Sending...
            </>
          ) : (
            <>
              Send
              <svg
                className="ml-1.5 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}