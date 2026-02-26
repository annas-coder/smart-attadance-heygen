// HeyGen Streaming Avatar Integration

const HEYGEN_CONFIG = {
  serverUrl: 'https://api.heygen.com',
  apiKey: 'sk_V2_hgu_k1Qz2fiafEg_bbWqllRnvf2oNrFe53Itf0zXcdob2RjZ',
  avatarName: 'Graham_Black_Suit_public',
  voiceId: '',
};

const SESSION_DURATION_MS = 3 * 60 * 1000; // 3 minutes

interface HeyGenState {
  sessionToken: string | null;
  sessionInfo: any | null;
  room: any | null;
  mediaStream: MediaStream | null;
  active: boolean;
  timerInterval: NodeJS.Timeout | null;
  endAt: number;
}

const state: HeyGenState = {
  sessionToken: null,
  sessionInfo: null,
  room: null,
  mediaStream: null,
  active: false,
  timerInterval: null,
  endAt: 0,
};

export function heygenReady(): boolean {
  return !!HEYGEN_CONFIG.apiKey && HEYGEN_CONFIG.apiKey.trim() !== '';
}

export function isSessionActive(): boolean {
  return state.active;
}

async function getSessionToken(): Promise<string> {
  const res = await fetch(`${HEYGEN_CONFIG.serverUrl}/v1/streaming.create_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': HEYGEN_CONFIG.apiKey },
  });
  const data = await res.json();
  if (data?.data?.token) {
    state.sessionToken = data.data.token;
    return state.sessionToken;
  }
  throw new Error('Failed to get session token');
}

export async function startSession(
  videoEl: HTMLVideoElement,
  onActive: () => void,
  onDisconnect: () => void,
  onTimerUpdate: (text: string) => void,
  onTimerEnd: () => void,
): Promise<void> {
  if (!heygenReady() || state.active) return;

  await getSessionToken();

  const body: any = {
    quality: 'high',
    avatar_name: HEYGEN_CONFIG.avatarName,
    version: 'v2',
    video_encoding: 'H264',
    background: {
      type: 'color',
      value: '#0f1729',
    },
  };
  if (HEYGEN_CONFIG.voiceId) {
    body.voice = { voice_id: HEYGEN_CONFIG.voiceId, rate: 1.0 };
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
  if (!json?.data) throw new Error(json.message || 'streaming.new failed');

  state.sessionInfo = json.data;
  state.mediaStream = new MediaStream();

  // Dynamic import livekit-client
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
        // Send welcome message
        const welcomeMsg = "Good evening and welcome to FutureFin Expo 2026. I'm Nadim, your virtual assistant. I can help you with check-in, finding your way around the venue, session schedules, speaker information, dining options, and much more.";
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

  // Start timer
  startTimer(onTimerUpdate, onTimerEnd);
}

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

export async function closeSession(): Promise<void> {
  stopTimer();
  if (!state.sessionInfo) {
    state.active = false;
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
