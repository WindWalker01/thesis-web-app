"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ReviewNotesSectionProps {
  reviewNotes: string;
  isSaving: boolean;
  isDisabled: boolean;
  onChange: (value: string) => void;
}

export const ReviewNotesSection = memo(function ReviewNotesSection({
  reviewNotes,
  isSaving,
  isDisabled,
  onChange,
}: ReviewNotesSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Review Notes</span>
          {isSaving && (
            <span className="text-[10px] text-muted-foreground">Saving...</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Add your review notes here..."
          value={reviewNotes}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="text-sm resize-none"
          disabled={isDisabled}
        />
      </CardContent>
    </Card>
  );
});