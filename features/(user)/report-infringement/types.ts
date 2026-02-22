export type ReportReason =
  | "copyright"
  | "spam"
  | "harassment"
  | "nudity"
  | "violence"
  | "hate"
  | "other";

export type ReportPayload = {
  postId?: string;
  reason: ReportReason;
  details?: string;
  context?: string;
};

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "copyright", label: "Copyright / Stolen artwork" },
  { value: "spam", label: "Spam or misleading" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "nudity", label: "Nudity / sexual content" },
  { value: "violence", label: "Violence or gore" },
  { value: "hate", label: "Hate or abuse" },
  { value: "other", label: "Other" },
] as const;