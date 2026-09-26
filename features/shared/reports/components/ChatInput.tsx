"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  MAX_EVIDENCE_FILE_SIZE,
  ALLOWED_EVIDENCE_MIME_TYPES,
  isAllowedFileType,
} from "@/features/reports/schemas/report-schemas";

type ChatInputProps = {
  onSend: (message: string) => Promise<void>;
  onUploadEvidence?: (file: File, description?: string) => Promise<void>;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ChatInput({
  onSend,
  onUploadEvidence,
  onTyping,
  onStopTyping,
  disabled = false,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSend = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await onSend(trimmed);
      setMessage("");
      onStopTyping?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  }, [message, isSending, onSend, onStopTyping]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);

      // Typing indicator
      onTyping?.();

      // Reset typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping?.();
      }, 3000);
    },
    [onTyping, onStopTyping]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onUploadEvidence) return;

      if (file.size > MAX_EVIDENCE_FILE_SIZE) {
        toast.error("File must be under 10MB");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      if (!isAllowedFileType(file.type, file.name)) {
        toast.error("Unsupported file type");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setIsUploading(true);
      try {
        await onUploadEvidence(file);
        toast.success("File attached successfully");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to upload file");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [onUploadEvidence]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            placeholder={placeholder}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            rows={1}
            className="min-h-[40px] resize-none rounded-2xl bg-muted/50 pr-10 text-sm"
            aria-label="Chat message"
          />
        </div>
        <div className="flex items-center gap-1">
          {onUploadEvidence && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled || isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                aria-label="Attach file"
              >
                {isUploading ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_EVIDENCE_MIME_TYPES.join(",")}
                className="hidden"
                onChange={handleFileChange}
                aria-label="Upload file"
              />
            </>
          )}
          <Button
            onClick={handleSend}
            disabled={disabled || !message.trim() || isSending}
            size="icon"
            className="h-9 w-9 rounded-full"
            aria-label="Send message"
          >
            {isSending ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}