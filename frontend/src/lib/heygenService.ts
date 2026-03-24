import type { StreamingAvatarRow } from './heygenStreamingAvatars';

const HEYGEN_CONFIG = {
  serverUrl: 'https://api.heygen.com',
  apiKey: import.meta.env.VITE_HEYGEN_API_KEY || '',
  voiceId: 'e27cd18abc7942f5825c8cd7cf75488e',
};

/** Avatar ID candidates to try in order with streaming.new */
const AVATAR_CANDIDATES = [
  'Marianne_Red_Suit_public',
  'Marianne_ProfessionalLook_public',
  'Salma_headscarf_Front',
  'Salma_headscarf_Front_public',
];

/** Avatar group id for Salma (v2 general API) */
const SALMA_GROUP_ID = '1721844012';

const SESSION_DURATION_MS = 3 * 60 * 1000;

interface HeyGenState {
  sessionToken: string | null;
  sessionInfo: any | null;
  room: any | null;
  mediaStream: MediaStream | null;
  active: boolean;
  timerInterval: ReturnType<typeof setInterval> | null;
  endAt: number;
  resolvedAvatarId: string | null;
}

const state: HeyGenState = {
  sessionToken: null,
  sessionInfo: null,
  room: null,
  mediaStream: null,
  active: false,
  timerInterval: null,
  endAt: 0,
  resolvedAvatarId: null,
};

export function heygenReady(): boolean {
  return !!HEYGEN_CONFIG.apiKey && HEYGEN_CONFIG.apiKey.trim() !== '';
}

export function isSessionActive(): boolean {
  return state.active;
}

/* ---------- Avatar list fetching + resolution ---------- */

export async function fetchStreamingAvatarList(): Promise<StreamingAvatarRow[]> {
  if (!heygenReady()) return [];
  const res = await fetch(`${HEYGEN_CONFIG.serverUrl}/v1/streaming/avatar.list`, {
    method: 'GET',
    headers: { 'X-Api-Key': HEYGEN_CONFIG.apiKey },
  });
  const j = await res.json();
  const raw = j?.data;
  let arr: unknown[] = [];
  if (Array.isArray(raw)) arr = raw;
  else if (raw && typeof raw === 'object' && Array.isArray((raw as { avatars?: unknown[] }).avatars)) {
    arr = (raw as { avatars: unknown[] }).avatars;
  } else if (raw && typeof raw === 'object' && Array.isArray((raw as { list?: unknown[] }).list)) {
    arr = (raw as { list: unknown[] }).list;
  }
  return arr
    .filter((x): x is StreamingAvatarRow => !!x && typeof (x as StreamingAvatarRow).avatar_id === 'string')
    .map((x) => ({
      avatar_id: x.avatar_id,
      pose_name: typeof x.pose_name === 'string' ? x.pose_name : undefined,
      status: typeof x.status === 'string' ? x.status : undefined,
    }));
}

async function fetchGroupLookIds(): Promise<string[]> {
  if (!heygenReady()) return [];
  try {
    const res = await fetch(
      `${HEYGEN_CONFIG.serverUrl}/v2/avatar_group/${encodeURIComponent(SALMA_GROUP_ID)}/avatars`,
      { method: 'GET', headers: { 'X-Api-Key': HEYGEN_CONFIG.apiKey } },
    );
    const j = await res.json();
    const list = j?.data?.avatar_list;
    if (!Array.isArray(list)) return [];
    return list
      .filter((x: any) => typeof x?.id === 'string' && (!x.status || x.status === 'completed'))
      .map((x: any) => x.id as string);
  } catch (e) {
    console.warn('[HeyGen] fetchGroupLookIds error', e);
    return [];
  }
}

/**
 * Build ordered list of avatar_id candidates to try with streaming.new.
 * Priority: exact Salma IDs → matches from streaming list → group look IDs → first available streaming avatar.
 */
export async function resolveSalmaAvatarCandidates(): Promise<string[]> {
  const streamingList = await fetchStreamingAvatarList();
  console.log('[HeyGen] streaming/avatar.list →', streamingList.length, 'avatars:');
  console.table(streamingList.map((r) => ({ avatar_id: r.avatar_id, pose_name: r.pose_name, status: r.status })));

  const candidates: string[] = [...AVATAR_CANDIDATES];

  const salmaFromList = streamingList.filter(
    (r) => /salma|headscarf|hijab/i.test(r.avatar_id + '|' + (r.pose_name || '')),
  );
  if (salmaFromList.length) {
    console.log('[HeyGen] Salma matches in streaming list:', salmaFromList);
    for (const r of salmaFromList) {
      if (!candidates.includes(r.avatar_id)) candidates.push(r.avatar_id);
    }
  } else {
    console.log('[HeyGen] No Salma/headscarf/hijab match in streaming list');
  }

  const groupIds = await fetchGroupLookIds();
  if (groupIds.length) {
    console.log('[HeyGen] Salma group look IDs:', groupIds);
    for (const id of groupIds) {
      if (!candidates.includes(id)) candidates.push(id);
    }
  }

  if (streamingList.length) {
    const first = streamingList[0].avatar_id;
    if (!candidates.includes(first)) candidates.push(first);
  }

  console.log('[HeyGen] Avatar ID candidates (will try in order):', candidates);
  return candidates;
}

/* ---------- Token ---------- */

async function getSessionToken(): Promise<string> {
  const res = await fetch(`${HEYGEN_CONFIG.serverUrl}/v1/streaming.create_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': HEYGEN_CONFIG.apiKey },
  });
  const data = await res.json();
  if (data?.data?.token) {
    const token = data.data.token as string;
    state.sessionToken = token;
    return token;
  }
  throw new Error('Failed to get session token');
}

/* ---------- Session ---------- */

async function tryStreamingNew(avatarId: string, voiceId?: string): Promise<any | null> {
  const body: any = {
    quality: 'high',
    avatar_id: avatarId,
    version: 'v2',
    video_encoding: 'H264',
    background: { type: 'color', value: '#0f1729' },
  };
  const effectiveVoice = (voiceId?.trim() || HEYGEN_CONFIG.voiceId || '').trim();
  if (effectiveVoice) {
    body.voice = { voice_id: effectiveVoice, rate: 1.0 };
  }

  const res = await fetch(`${HEYGEN_CONFIG.serverUrl}/v1/streaming.new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${state.sessionToken}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json?.data) return json.data;
  console.warn(`[HeyGen] streaming.new failed for "${avatarId}":`, json?.message || json?.error || json);
  return null;
}

export async function startSession(
  videoEl: HTMLVideoElement,
  onActive: () => void,
  onDisconnect: () => void,
  onTimerUpdate: (text: string) => void,
  onTimerEnd: () => void,
  customWelcome?: string,
  /** When set, start only this avatar (e.g. male); omit for default female candidate chain */
  avatarIdOverride?: string,
  /** When set (e.g. male voice), used for streaming.new; otherwise default kiosk voice */
  voiceIdOverride?: string,
): Promise<void> {
  if (!heygenReady()) return;

  // Ensure any previous session is torn down (e.g. gender toggle while in chat)
  if (state.active || state.sessionInfo || state.room) {
    await closeSession();
  }

  await getSessionToken();

  let candidates: string[];
  if (avatarIdOverride?.trim()) {
    state.resolvedAvatarId = null;
    candidates = [avatarIdOverride.trim()];
  } else if (state.resolvedAvatarId) {
    candidates = [state.resolvedAvatarId];
  } else {
    candidates = await resolveSalmaAvatarCandidates();
  }

  let sessionData: any = null;
  let usedId = '';

  for (const id of candidates) {
    console.log(`[HeyGen] Trying avatar_id: "${id}" …`);
    sessionData = await tryStreamingNew(id, voiceIdOverride);
    if (sessionData) {
      usedId = id;
      state.resolvedAvatarId = id;
      console.log(`[HeyGen] ✓ streaming.new succeeded with avatar_id: "${id}"`);
      break;
    }
  }

  if (!sessionData) {
    const tried = candidates.join('", "');
    console.error(
      `[HeyGen] All avatar candidates failed. Tried: "${tried}"\n` +
      'Salma may not be enabled as an Interactive Avatar on your account.\n' +
      'Go to https://app.heygen.com/streaming-avatar → Select Avatar → find Salma and enable/upgrade her for streaming.',
    );
    throw new Error(
      `Avatar not found. Tried ${candidates.length} IDs including Salma variants. ` +
      'Check browser console [HeyGen] logs for the full streaming avatar list — ' +
      'Salma must be enabled as an Interactive Avatar in your HeyGen dashboard.',
    );
  }

  state.sessionInfo = sessionData;
  state.mediaStream = new MediaStream();

  const LivekitClient = await import('livekit-client');
  state.room = new LivekitClient.Room({ adaptiveStream: true, dynacast: true });

  state.room.on(LivekitClient.RoomEvent.TrackSubscribed, (track: any) => {
    if (track.kind === 'video' || track.kind === 'audio') {
      state.mediaStream!.addTrack(track.mediaStreamTrack);
      if (state.mediaStream!.getVideoTracks().length > 0) {
        videoEl.srcObject = state.mediaStream;
        state.active = true;
        videoEl.play().catch(() => {});
        onActive();
        const welcomeMsg = customWelcome
          || "Welcome to FutureFin Expo 2026! I'm your AI assistant. How can I help you today?";
        sendTextToAvatar(welcomeMsg, 'repeat');
      }
    }
  });

  state.room.on(LivekitClient.RoomEvent.TrackUnsubscribed, (track: any) => {
    if (track.mediaStreamTrack && state.mediaStream) {
      state.mediaStream.removeTrack(track.mediaStreamTrack);
    }
  });

  state.room.on(LivekitClient.RoomEvent.Disconnected, () => {
    state.active = false;
    onDisconnect();
  });

  await fetch(`${HEYGEN_CONFIG.serverUrl}/v1/streaming.start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${state.sessionToken}`,
    },
    body: JSON.stringify({ session_id: state.sessionInfo.session_id }),
  });

  await state.room.connect(state.sessionInfo.url, state.sessionInfo.access_token);
  state.active = true;

  startTimer(onTimerUpdate, onTimerEnd);
}

/* ---------- Timer ---------- */

function startTimer(onUpdate: (text: string) => void, onEnd: () => void) {
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.endAt = Date.now() + SESSION_DURATION_MS;

  const update = () => {
    const left = Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000));
    const m = Math.floor(left / 60);
    const s = left % 60;
    onUpdate(`Session: ${m}:${s < 10 ? '0' : ''}${s} remaining`);
    if (left <= 0) {
      if (state.timerInterval) clearInterval(state.timerInterval);
      state.timerInterval = null;
      onEnd();
    }
  };
  update();
  state.timerInterval = setInterval(update, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  state.endAt = 0;
}

/* ---------- Close / Interrupt / Speak ---------- */

export async function closeSession(): Promise<void> {
  stopTimer();
  if (!state.sessionInfo) {
    state.active = false;
    state.resolvedAvatarId = null;
    return;
  }
  try {
    await fetch(`${HEYGEN_CONFIG.serverUrl}/v1/streaming.stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.sessionToken}`,
      },
      body: JSON.stringify({ session_id: state.sessionInfo.session_id }),
    });
  } catch (_) {}

  if (state.room) {
    state.room.disconnect();
    state.room = null;
  }

  state.sessionToken = null;
  state.sessionInfo = null;
  state.mediaStream = null;
  state.active = false;
  state.resolvedAvatarId = null;
}

export function interruptAvatar(): void {
  if (!state.active || !state.sessionInfo || !state.sessionToken) return;
  fetch(`${HEYGEN_CONFIG.serverUrl}/v1/streaming.interrupt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${state.sessionToken}`,
    },
    body: JSON.stringify({ session_id: state.sessionInfo.session_id }),
  }).catch(() => {});
}

export function sendTextToAvatar(text: string, taskType: string = 'repeat'): void {
  if (!state.active || !state.sessionInfo || !state.sessionToken) return;
  const plainText = text.replace(/<[^>]+>/g, '');
  fetch(`${HEYGEN_CONFIG.serverUrl}/v1/streaming.task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${state.sessionToken}`,
    },
    body: JSON.stringify({
      session_id: state.sessionInfo.session_id,
      text: plainText,
      task_type: taskType,
    }),
  }).catch(() => {});
}
