export type PhotoApproval = { assetId: string; sourceId: string; approved: true; reviewedBy: string; reviewedAt: string };
/** Appearance and a caption are not evidence of a particular product's identity. */
export function isApprovedPhoto(input: unknown): input is PhotoApproval {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const value = input as Record<string, unknown>;
  return value.approved === true && typeof value.assetId === 'string' && value.assetId.length > 0
    && typeof value.sourceId === 'string' && /^DT\d+$/.test(value.sourceId)
    && typeof value.reviewedBy === 'string' && value.reviewedBy.trim().length > 0
    && typeof value.reviewedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.reviewedAt)
    && Number.isFinite(Date.parse(value.reviewedAt));
}
