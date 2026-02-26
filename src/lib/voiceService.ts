// Voice Input Service - Speech-to-Text
// Uses Web Speech API (Chrome/Edge built-in) as primary engine for reliability,
// with ElevenLabs Scribe as optional upgrade path.

export interface VoiceCallbacks {
  onPartial: (text: string) => void;
  onCommitted: (text: string) => void;
  onError: (error: string) => void;
  onStateChange: (listening: boolean) => void;
}

interface VoiceState {
  recognition: SpeechRecognition | null;
  listening: boolean;
  callbacks: VoiceCallbacks | null;
  accumulated: string;
}

const state: VoiceState = {
  recognition: null,
  listening: false,
  callbacks: null,
  accumulated: '',
};

function getSpeechRecognition(): SpeechRecognition | null {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  return new SR();
}

export function voiceReady(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isListening(): boolean {
  return state.listening;
}

export async function startListening(callbacks: VoiceCallbacks): Promise<void> {
  if (state.listening) return;

  const recognition = getSpeechRecognition();
  if (!recognition) {
    callbacks.onError('Speech recognition not supported in this browser');
    return;
  }

  state.callbacks = callbacks;
  state.recognition = recognition;
  state.accumulated = '';

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    state.listening = true;
    callbacks.onStateChange(true);
  };

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interim = '';
    let newFinal = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        newFinal += transcript;
      } else {
        interim += transcript;
      }
    }

    if (newFinal) {
      state.accumulated = (state.accumulated + ' ' + newFinal).trim();
      callbacks.onCommitted(state.accumulated);
    }

    if (interim) {
      callbacks.onPartial(interim);
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (event.error === 'no-speech' || event.error === 'aborted') return;
    console.warn('Speech recognition error:', event.error);
    callbacks.onError(`Mic error: ${event.error}`);
    cleanup();
  };

  recognition.onend = () => {
    if (state.listening) {
      // Auto-restart if still supposed to be listening (browser sometimes stops)
      try {
        recognition.start();
      } catch {
        cleanup();
      }
    }
  };

  try {
    recognition.start();
  } catch (err) {
    cleanup();
    callbacks.onError(err instanceof Error ? err.message : 'Failed to start mic');
  }
}

export function stopListening(): string {
  const finalText = state.accumulated;
  cleanup();
  return finalText;
}

function cleanup() {
  const wasListening = state.listening;

  if (state.recognition) {
    try {
      state.recognition.onend = null;
      state.recognition.stop();
    } catch {
      // already stopped
    }
    state.recognition = null;
  }

  state.listening = false;
  state.accumulated = '';

  if (wasListening && state.callbacks) {
    state.callbacks.onStateChange(false);
  }
}
