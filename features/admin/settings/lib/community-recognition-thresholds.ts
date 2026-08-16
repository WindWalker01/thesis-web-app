export type CommunityRecognitionThresholds = {
  Recognized: number;
  Acclaimed: number;
  Master: number;
};

export function normalizeCommunityRecognitionThresholds(
  raw?: unknown,
): CommunityRecognitionThresholds {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const values = raw as Record<string, unknown>;
    return {
      Recognized: Number(values.Recognized ?? 5),
      Acclaimed: Number(values.Acclaimed ?? 8),
      Master: Number(values.Master ?? 11),
    };
  }

  return {
    Recognized: 5,
    Acclaimed: 8,
    Master: 11,
  };
}

export function updateCommunityRecognitionThresholds(
  current: CommunityRecognitionThresholds,
  key: keyof CommunityRecognitionThresholds,
  nextValue: number,
): CommunityRecognitionThresholds {
  const next: CommunityRecognitionThresholds = {
    ...current,
    [key]: nextValue,
  };

  const validated: CommunityRecognitionThresholds = {
    Recognized: Math.min(Math.max(next.Recognized, 0), 100),
    Acclaimed: Math.min(Math.max(next.Acclaimed, 1), 100),
    Master: Math.min(Math.max(next.Master, 1), 100),
  };

  if (validated.Recognized >= validated.Acclaimed) {
    validated.Acclaimed = Math.min(100, validated.Recognized + 1);
  }
  if (validated.Acclaimed >= validated.Master) {
    validated.Master = Math.min(100, validated.Acclaimed + 1);
  }

  return validated;
}
