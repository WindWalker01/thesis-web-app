"use server";

import type { CompareResponse } from "@/features/plagiarise-checker/types";

const API_BASE = process.env.DIGITAL_ART_API_URL ?? "http://localhost:8000";

/**
 * Server action: submit two files for direct image-to-image comparison.
 */
export async function checkPlagiarismCompare(
  prevState: unknown,
  formData: FormData,
): Promise<{ success: boolean; data?: CompareResponse; error?: string }> {
  try {
    const file1 = formData.get("file1");
    const file2 = formData.get("file2");

    if (!file1 || !(file1 instanceof File) || !file2 || !(file2 instanceof File)) {
      return { success: false, error: "Two files are required for comparison." };
    }

    const res = await fetch(`${API_BASE}/plagiarism/compare`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      return {
        success: false,
        error: detail?.detail ?? `Server error: ${res.status}`,
      };
    }

    const data: CompareResponse = await res.json();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}