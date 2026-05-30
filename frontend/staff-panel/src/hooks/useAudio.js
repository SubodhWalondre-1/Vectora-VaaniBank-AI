/*
   VaaniBank AI — Audio Recording & Playback Hook
   Union Bank of India | Team Vectora
   */

import { useRef, useState, useCallback, useEffect } from 'react';

// Audio constraints
// We try 3 levels from strictest to bare minimum:
// Level 1: ideal sampleRate + noise cancellation (preferred)
// Level 2: just noise cancellation, no sampleRate constraint
// Level 3: { audio: true } — works on every device/browser
//
// Only NotAllowedError / NotFoundError propagate — those need user action.
const CONSTRAINT_LEVELS = [
  {
    audio: {
      channelCount: { ideal: 1 },
      sampleRate:   { ideal: 16000 },
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl:  true,
    },
    video: false,
  },
  {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl:  true,
    },
    video: false,
  },
  { audio: true, video: false },
];

// Errors that require user/OS action — don’t retry
const UNRECOVERABLE = new Set(['NotAllowedError', 'PermissionDeniedError', 'NotFoundError', 'DevicesNotFoundError']);

async function getAudioStream() {
  // Secure-context / HTTPS check
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const err = new Error(
      'Microphone API not available. Make sure the app is running on https:// or localhost.'
    );
    err.name = 'SecurityError';
    throw err;
  }

  let lastErr;
  for (let i = 0; i < CONSTRAINT_LEVELS.length; i++) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(CONSTRAINT_LEVELS[i]);
      if (i > 0) {
        console.warn(`[Audio] Using fallback constraint level ${i + 1}`);
      }
      return stream;
    } catch (err) {
      lastErr = err;
      console.warn(`[Audio] Constraint level ${i + 1} failed:`, err.name, err.message);
      // Stop retrying if user denied or no mic present
      if (UNRECOVERABLE.has(err.name)) throw err;
      // Otherwise try next level
    }
  }
  // All levels exhausted
  throw lastErr;
}

// Preferred MIME types in order
const MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/ogg',
  'audio/mp4',
];

function getSupportedMimeType() {
  for (const mimeType of MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  return '';
}

export function useAudio() {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState(null);

  // Refs
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const playbackSourceRef = useRef(null);
  const playbackContextRef = useRef(null);
  const resolveBlobRef = useRef(null);
  const html5AudioRef = useRef(null);

  // Cleanup audio analysis
  const stopAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Cleanup duration timer
  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  // Audio level analysis (waveform data)
  const startAnalysis = useCallback((stream) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate RMS level (0-100)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const level = Math.min(100, Math.round((rms / 128) * 100));

        setAudioLevel(level);
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err) {
      console.warn('[Audio] Analysis setup failed:', err);
    }
  }, []);

  // Start Recording
  const startRecording = useCallback(async () => {
    setError(null);

    try {
      // Request microphone — tries preferred constraints, falls back to basic
      const stream = await getAudioStream();
      streamRef.current = stream;

      // Get supported MIME type
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : {};

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Collect audio data chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // On stop → build blob and resolve promise
      mediaRecorder.onstop = () => {
        const mType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mType });
        chunksRef.current = [];

        if (resolveBlobRef.current) {
          resolveBlobRef.current(blob);
          resolveBlobRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('[Audio] MediaRecorder error:', event.error);
        setError('Recording failed. Please try again.');
        setIsRecording(false);
        stopAnalysis();
        stopDurationTimer();
      };

      // Start recording with 250ms timeslice for chunked data
      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      const startTime = Date.now();
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Start audio level analysis
      startAnalysis(stream);

      if (import.meta.env.DEV) {
        console.log(
          '%c[Audio] 🎙 Recording started',
          'color: #E8231A; font-weight: bold;',
          { mimeType: mediaRecorder.mimeType || mimeType || 'audio/webm' }
        );
      }
    } catch (err) {
      // Always log full error details for debugging
      console.error('[Audio] Mic access failed — name:', err.name, '| message:', err.message);

      let errorMsg;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Microphone blocked. Click the 🔒 icon in your browser address bar → allow microphone, then refresh.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No microphone found. Please connect a microphone and try again.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = 'Mic is in use by another app (Teams / Zoom / Discord). Close it and retry.';
      } else if (err.name === 'SecurityError') {
        errorMsg = err.message || 'Microphone not available — app must run on https:// or localhost.';
      } else {
        errorMsg = `Microphone error (${err.name || 'unknown'}): ${err.message || 'Please try again.'}`;
      }

      setError(errorMsg);
      setIsRecording(false);

      // Re-throw so BottomBar catch block can also handle it
      const thrownErr = new Error(errorMsg);
      thrownErr.name = err.name || 'MicError';
      throw thrownErr;
    }
  }, [startAnalysis, stopAnalysis, stopDurationTimer]);

  // Stop Recording → Returns audioBlob
  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      stopAnalysis();
      stopDurationTimer();

      if (
        !mediaRecorderRef.current ||
        mediaRecorderRef.current.state === 'inactive'
      ) {
        setIsRecording(false);
        resolve(null);
        return;
      }

      resolveBlobRef.current = resolve;
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all tracks on the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Cleanup audio context used for analysis
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
        analyserRef.current = null;
      }

      if (import.meta.env.DEV) {
        console.log(
          '%c[Audio] 🛑 Recording stopped',
          'color: #D97706; font-weight: bold;'
        );
      }
    });
  }, [stopAnalysis, stopDurationTimer]);

  // Play Audio from URL
  const playAudio = useCallback(async (url) => {
    setError(null);

    try {
      // Stop any currently playing audio
      if (playbackSourceRef.current) {
        try {
          playbackSourceRef.current.stop();
        } catch {
          // already stopped
        }
        playbackSourceRef.current = null;
      }

      setIsPlaying(true);

      // Fix double-slash in URL (e.g. https://host//audio/file.wav)
      const cleanUrl = url.replace(/([^:])(\/\/+)/g, '$1/');

      // Check if URL is cross-origin (CORS-sensitive external CDN URL)
      let isCross = false;
      try {
        const parsed = new URL(cleanUrl);
        if (parsed.origin !== window.location.origin) {
          isCross = true;
        }
      } catch {
        // not a full URL, same origin local path
      }

      if (isCross) {
        console.log('[Audio] Cross-origin URL detected, using HTML5 Audio directly:', cleanUrl);
        try {
          const audio = new Audio();
          html5AudioRef.current = audio;

          await new Promise((resolve, reject) => {
            audio.onended = () => {
              setIsPlaying(false);
              html5AudioRef.current = null;
            };
            audio.onerror = () => {
              reject(new Error(`HTML5 Audio error code: ${audio.error?.code}`));
            };
            audio.src = cleanUrl;
            audio.play().then(resolve).catch(reject);
          });

          if (import.meta.env.DEV) {
            console.log(
              '%c[Audio] 🔊 Playing (HTML5 Cross-Origin)',
              'color: #16A34A; font-weight: bold;',
              { url: cleanUrl }
            );
          }
        } catch (err) {
          console.error('[Audio] HTML5 playback failed for cross-origin URL:', err);
          setError('Audio playback failed. Please try again.');
          setIsPlaying(false);
        }
        return;
      }

      const response = await fetch(cleanUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      playbackContextRef.current = audioCtx;

      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;

      // Add slight gain for clarity
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 1.0;
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      playbackSourceRef.current = source;

      source.onended = () => {
        setIsPlaying(false);
        playbackSourceRef.current = null;
        if (playbackContextRef.current) {
          playbackContextRef.current.close().catch(() => {});
          playbackContextRef.current = null;
        }
      };

      source.start(0);

      if (import.meta.env.DEV) {
        console.log(
          '%c[Audio] 🔊 Playing',
          'color: #16A34A; font-weight: bold;',
          { url, duration: audioBuffer.duration.toFixed(2) + 's' }
        );
      }
    } catch (err) {
      console.error('[Audio] Playback failed:', err);
      setError('Audio playback failed. Please try again.');
      setIsPlaying(false);
    }
  }, []);

  // Stop Audio Playback
  const stopAudio = useCallback(() => {
    if (playbackSourceRef.current) {
      try {
        playbackSourceRef.current.stop();
      } catch {
        // already stopped
      }
      playbackSourceRef.current = null;
    }

    if (playbackContextRef.current) {
      playbackContextRef.current.close().catch(() => {});
      playbackContextRef.current = null;
    }

    if (html5AudioRef.current) {
      html5AudioRef.current.pause();
      html5AudioRef.current.src = '';
      html5AudioRef.current = null;
    }

    setIsPlaying(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop recording if active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // Stop stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Clear duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      // Close audio contexts
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }

      // Stop playback
      if (playbackSourceRef.current) {
        try {
          playbackSourceRef.current.stop();
        } catch {
          // already stopped
        }
      }

      if (html5AudioRef.current) {
        html5AudioRef.current.pause();
        html5AudioRef.current.src = '';
        html5AudioRef.current = null;
      }

      if (playbackContextRef.current) {
        playbackContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    startRecording,
    stopRecording,
    playAudio,
    stopAudio,
    isRecording,
    isPlaying,
    audioLevel,
    recordingDuration,
    error,
  };
}

export default useAudio;
