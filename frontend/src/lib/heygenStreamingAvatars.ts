/**
 * HeyGen streaming avatars change by account; use GET /v1/streaming/avatar.list for truth.
 * We filter pose_name / avatar_id for hijab / modest / Arabic-leaning looks (heuristic).
 */

export type StreamingAvatarRow = {
  avatar_id: string;
  pose_name?: string;
  status?: string;
};

/** Shown if the API fails or returns nothing matching — extend with IDs from your avatar.list */
export const FALLBACK_HIJAB_STYLE_AVATARS: { id: string; label: string }[] = [
  { id: 'Salma_headscarf_Front', label: 'Salma — headscarf (front)' },
];

const HIJAB_ARABIC_LOOK_RE =
  /headscarf|hijab|abaya|niqab|burqa|khimar|modest|hijabi|arab|middle[\s_-]*east|muslim|salma|leila|layla|amina|amira|fatima|noor|zahra|yasmin|noura|hanan|mariam|maryam/i;

export function filterHijabArabicLookAvatars(rows: StreamingAvatarRow[]): StreamingAvatarRow[] {
  return rows.filter((row) => {
    const id = (row.avatar_id || '').toLowerCase();
    const pose = (row.pose_name || '').toLowerCase();
    if (row.status && !/active/i.test(String(row.status))) return false;
    return HIJAB_ARABIC_LOOK_RE.test(id) || HIJAB_ARABIC_LOOK_RE.test(pose);
  });
}

export function mergeHijabStyleChoices(
  fromApi: StreamingAvatarRow[],
  fallbacks: { id: string; label: string }[],
): { id: string; label: string }[] {
  const filtered = filterHijabArabicLookAvatars(fromApi);
  const map = new Map<string, string>();
  for (const r of filtered) {
    if (r.avatar_id) map.set(r.avatar_id, (r.pose_name || r.avatar_id).trim());
  }
  for (const f of fallbacks) {
    if (!map.has(f.id)) map.set(f.id, f.label);
  }
  return Array.from(map.entries())
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
}
