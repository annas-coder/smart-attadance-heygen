// ElevenLabs Realtime Speech-to-Text (Scribe) Integration

const ELEVENLABS_CONFIG = {
  apiKey: 'sk_906f362747a55b1c968901fed248813565a7edca33e51382',
  wsUrl: 'wss://api.elevenlabs.io/v1/speech-to-text/realtime',
  tokenUrl: 'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
  sampleRate: 16000,
  language: 'en',
};

export interface VoiceCallbacks {
  onPartial: (text: string) => void;
  onCommitted: (text: string) => void;
  onError: (error: string) => void;
  onStateChange: (listening: boolean) => void;
}

interface VoiceState {
  ws: WebSocket | null;
  mediaStream: MediaStream | null;
  audioContext: AudioContext | null;
  processor: ScriptProcessorNode | null;
  source: MediaStreamAudioSourceNode | null;
  listening: boolean;
  callbacks: VoiceCallbacks | null;
}

const state: VoiceState = {
  ws: null,
  mediaStream: null,
  audioContext: null,
  processor: null,
  source: null,
  listening: false,
  callbacks: null,
};

export function voiceReady(): boolean {
  return !!ELEVENLABS_CONFIG.apiKey && ELEVENLABS_CONFIG.apiKey !== 'YOUR_ELEVENLABS_API_KEY';
}

export function isListening(): boolean {
  return state.listening;
}

async function getSingleUseToken(): Promise<string> {
  const res = await fetch(ELEVENLABS_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_CONFIG.apiKey,
    },
  });
  if (!res.ok) {
    throw new Error(`Token request failed: ${res.status}`);
  }
  const data = await res.json();
  if (data?.token) return data.token;
  throw new Error('No token in response');
}

function float32ToPcm16Base64(float32: Float32Array): string {
  const pcm16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function downsampleBuffer(
  buffer: Float32Array,
  inputSampleRate: number,
  outputSampleRate: number,
): Float32Array {
  if (inputSampleRate === outputSampleRate) return buffer;
  const ratio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const idx = Math.round(i * ratio);
    result[i] = buffer[Math.min(idx, buffer.length - 1)];
  }
  return result;
}

function connectWebSocket(token: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      token,
      model_id: 'scribe_v1',
      language_code: ELEVENLABS_CONFIG.language,
      commit_strategy: 'vad',
      audio_format: `pcm_${ELEVENLABS_CONFIG.sampleRate}`,
      vad_silence_threshold_secs: '1.5',
      vad_threshold: '0.4',
    });

    const ws = new WebSocket(`${ELEVENLABS_CONFIG.wsUrl}?${params}`);

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('WebSocket connection timeout'));
    }, 10000);

    ws.onopen = () => {
      clearTimeout(timeout);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.message_type) {
          case 'session_started':
            resolve(ws);
            break;
          case 'partial_transcript':
            if (msg.text && state.callbacks) {
              state.callbacks.onPartial(msg.text);
            }
            break;
          case 'committed_transcript':
            if (msg.text?.trim() && state.callbacks) {
              state.callbacks.onCommitted(msg.text.trim());
            }
            break;
          case 'error':
          case 'auth_error':
          case 'quota_exceeded':
          case 'rate_limited':
            if (state.callbacks) {
              state.callbacks.onError(msg.error || 'STT error');
            }
            cleanup();
            break;
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('WebSocket connection failed'));
    };

    ws.onclose = () => {
      clearTimeout(timeout);
      if (state.listening) {
        cleanup();
      }
    };
  });
}

function startAudioCapture() {
  if (!state.audioContext || !state.mediaStream || !state.ws) return;

  state.source = state.audioContext.createMediaStreamSource(state.mediaStream);
  // 4096 buffer size gives ~256ms chunks at 16kHz, good balance of latency vs overhead
  state.processor = state.audioContext.createScriptProcessor(4096, 1, 1);

  state.processor.onaudioprocess = (e) => {
    if (!state.ws || state.ws.readyState !== WebSocket.OPEN) return;
    const inputData = e.inputBuffer.getChannelData(0);
    const downsampled = downsampleBuffer(
      inputData,
      state.audioContext!.sampleRate,
      ELEVENLABS_CONFIG.sampleRate,
    );
    const base64 = float32ToPcm16Base64(downsampled);
    state.ws.send(
      JSON.stringify({
        message_type: 'input_audio_chunk',
        audio_base_64: base64,
        commit: false,
        sample_rate: ELEVENLABS_CONFIG.sampleRate,
      }),
    );
  };

  state.source.connect(state.processor);
  state.processor.connect(state.audioContext.destination);
}

function cleanup() {
  const wasListening = state.listening;

  if (state.processor) {
    state.processor.disconnect();
    state.processor = null;
  }
  if (state.source) {
    state.source.disconnect();
    state.source = null;
  }
  if (state.audioContext) {
    state.audioContext.close().catch(() => {});
    state.audioContext = null;
  }
  if (state.mediaStream) {
    state.mediaStream.getTracks().forEach((t) => t.stop());
    state.mediaStream = null;
  }
  if (state.ws) {
    if (state.ws.readyState === WebSocket.OPEN) {
      state.ws.close();
    }
    state.ws = null;
  }

  state.listening = false;
  if (wasListening && state.callbacks) {
    state.callbacks.onStateChange(false);
  }
}

export async function startListening(callbacks: VoiceCallbacks): Promise<void> {
  if (state.listening) return;
  if (!voiceReady()) {
    callbacks.onError('ElevenLabs API key not configured');
    return;
  }

  state.callbacks = callbacks;

  try {
    state.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: ELEVENLABS_CONFIG.sampleRate,
      },
    });

    state.audioContext = new AudioContext({ sampleRate: ELEVENLABS_CONFIG.sampleRate });

    const token = await getSingleUseToken();
    state.ws = await connectWebSocket(token);

    startAudioCapture();

    state.listening = true;
    callbacks.onStateChange(true);
  } catch (err) {
    cleanup();
    const message = err instanceof Error ? err.message : 'Failed to start voice input';
    callbacks.onError(message);
  }
}

export function stopListening(): void {
  cleanup();
}
