export type PhotoApproval = { assetId: string; sourceId: string; approved: true; reviewedBy: string; reviewedAt: string };
/** Appearance and a caption are not evidence of a particular product's identity. */
export function isApprovedPhoto(input: unknown): input is PhotoApproval {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const value = input as Record<string, unknown>;
  if (!(value.approved === true && typeof value.assetId === 'string' && /^[a-z0-9][a-z0-9-]{0,120}$/.test(value.assetId)
    && typeof value.sourceId === 'string' && /^DT\d+$/.test(value.sourceId)
    && typeof value.reviewedBy === 'string' && value.reviewedBy.trim().length > 0
    && typeof value.reviewedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.reviewedAt))) return false;
  const date = new Date(value.reviewedAt);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value.reviewedAt;
}
export function approvedPhotoPath(approvals: Record<string, unknown>, sourceId: string, photos: readonly { id: string; variants: readonly { src: string }[] }[]): string | undefined {
  const approval = approvals[sourceId];
  if (!isApprovedPhoto(approval) || approval.sourceId !== sourceId) return undefined;
  return photos.find(photo => photo.id === approval.assetId)?.variants.at(-1)?.src;
}
