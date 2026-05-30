/*
   VaaniBank AI — Customer Panel Audio Hook
   Union Bank of India | Team Vectora
   */

import { useRef, useState, useCallback, useEffect } from 'react';

// Shared Audio Context for mobile/browser persistence
let sharedPlaybackContext = null;

function getPlaybackContext() {
  if (typeof window === 'undefined') return null;
  if (!sharedPlaybackContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      sharedPlaybackContext = new AudioContextClass();
    }
  }
  return sharedPlaybackContext;
}

// Audio constraints with noise suppression
const AUDIO_CONSTRAINTS = {
  audio: {
    channelCount: 1,
    sampleRate: 16000,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: false,
};

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
  // html5AudioRef: fallback Audio element for browsers where Web Audio decodeAudioData fails
  const html5AudioRef = useRef(null); // eslint-disable-line react-hooks/rules-of-hooks
  const pendingAudioRef = useRef(null);

  // Streaming PCM audio refs
  const recordingContextRef = useRef(null);
  const recordingProcessorRef = useRef(null);

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
  const startRecording = useCallback(async (onAudioChunk) => {
    setError(null);

    try {
      // Request microphone access with noise suppression
      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
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

      // Web Audio PCM streaming setup (starts in parallel)
      if (onAudioChunk) {
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          const recordingContext = new AudioContextClass({ sampleRate: 16000 });
          recordingContextRef.current = recordingContext;

          const source = recordingContext.createMediaStreamSource(stream);
          const processor = recordingContext.createScriptProcessor(2048, 1, 1);
          recordingProcessorRef.current = processor;

          processor.onaudioprocess = (e) => {
            const inputBuffer = e.inputBuffer; // safe access
            const inputData = inputBuffer.getChannelData(0);
            // Send a copy of Float32Array PCM chunk to callback
            const chunk = new Float32Array(inputData);
            onAudioChunk(chunk);
          };

          source.connect(processor);
          processor.connect(recordingContext.destination);

          if (import.meta.env.DEV) {
            console.log('%c[Audio] 📡 PCM Streaming initialized at 16kHz', 'color: #7C3AED; font-weight: bold;');
          }
        } catch (webAudioErr) {
          console.warn('[Audio] Web Audio streaming setup failed:', webAudioErr);
        }
      }

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
          { mimeType: mimeType || 'default' }
        );
      }
    } catch (err) {
      console.error('[Audio] Failed to start recording:', err);

      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else if (err.name === 'NotReadableError') {
        setError('Microphone is in use by another application.');
      } else {
        setError('Failed to access microphone. Please try again.');
      }

      setIsRecording(false);
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

      // Cleanup audio context used for streaming
      if (recordingProcessorRef.current) {
        recordingProcessorRef.current.disconnect();
        recordingProcessorRef.current.onaudioprocess = null;
        recordingProcessorRef.current = null;
      }
      if (recordingContextRef.current) {
        recordingContextRef.current.close().catch(() => {});
        recordingContextRef.current = null;
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
  const playAudio = useCallback(async (url, isGesture = false) => {
    setError(null);

    // Fix double-slash in URL (e.g. https://host//audio/file.wav)
    const cleanUrl = url.replace(/([^:])(\/\/+)/g, '$1/');

    // Stop any currently playing Web Audio
    if (playbackSourceRef.current) {
      try { playbackSourceRef.current.stop(); } catch { /* already stopped */ }
      playbackSourceRef.current = null;
    }
    // Stop any currently playing HTML5 Audio
    if (html5AudioRef.current) {
      html5AudioRef.current.pause();
      html5AudioRef.current.src = '';
      html5AudioRef.current = null;
    }

    setIsPlaying(true);

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
      console.log('[Audio] Cross-origin URL detected, attempting fetch + blob to bypass CORS/Network issues:', cleanUrl);
      try {
        // Strategy: Fetch the audio as a blob first
        // This is more resilient to network changes and CORS issues than the <audio> tag.
        const response = await fetch(cleanUrl, { credentials: 'omit' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const audio = new Audio();
        html5AudioRef.current = audio;

        await new Promise((resolve, reject) => {
          audio.onended = () => {
            setIsPlaying(false);
            html5AudioRef.current = null;
            URL.revokeObjectURL(blobUrl);
          };
          audio.onerror = () => {
            URL.revokeObjectURL(blobUrl);
            reject(new Error(`HTML5 Audio error code: ${audio.error?.code}`));
          };
          audio.src = blobUrl;
          audio.play().then(resolve).catch(reject);
        });

        // Clear any pending audio since playback succeeded
        pendingAudioRef.current = null;

        if (import.meta.env.DEV) {
          console.log(
            '%c[Audio] 🔊 Playing (HTML5 Blob)',
            'color: #16A34A; font-weight: bold;',
            { url: cleanUrl }
          );
        }
      } catch (err) {
        console.warn('[Audio] Blob-based playback failed (likely CORS), falling back to direct URL:', err.message);
        
        // Fallback Strategy: Direct URL
        // If fetch fails (CORS error), we must use the direct URL. 
        // Browsers often allow media tags to play cross-origin even without CORS headers.
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
          
          pendingAudioRef.current = null;
          if (import.meta.env.DEV) {
            console.log('%c[Audio] 🔊 Playing (HTML5 Direct Fallback)', 'color: #16A34A; font-weight: bold;');
          }
        } catch (fallbackErr) {
          console.error('[Audio] All cross-origin playback attempts failed:', fallbackErr);
          
          const isAutoplayBlock = 
            fallbackErr.name === 'NotAllowedError' || 
            fallbackErr.message.includes('play() failed') || 
            fallbackErr.message.includes('user gesture') ||
            fallbackErr.message.includes('gesture');

          if (isAutoplayBlock) {
            console.log('[Audio] HTML5 fallback blocked by autoplay. Queueing URL:', cleanUrl);
            pendingAudioRef.current = cleanUrl;
          } else {
            setError('Audio playback failed. Please try again.');
          }
          setIsPlaying(false);
        }
      }
      return;
    }

    // Try Web Audio API first
    try {
      const response = await fetch(cleanUrl, { credentials: 'omit' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength < 44) throw new Error('Audio data too small');

      const audioCtx = getPlaybackContext();
      if (!audioCtx) throw new Error('Web Audio context not supported');

      // Safe resume check
      if (audioCtx.state === 'suspended') {
        if (!isGesture) {
          console.log('[Audio] AudioContext is suspended. Queueing URL for user gesture:', cleanUrl);
          pendingAudioRef.current = cleanUrl;
          setIsPlaying(false);
          return; // Return silently, no error shown
        } else {
          await audioCtx.resume().catch(() => {});
        }
      }

      playbackContextRef.current = audioCtx;

      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;

      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 1.0;
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      playbackSourceRef.current = source;

      source.onended = () => {
        setIsPlaying(false);
        playbackSourceRef.current = null;
        // Keep the shared audio context running for subsequent playbacks!
      };

      source.start(0);

      // Clear any pending audio since playback succeeded
      pendingAudioRef.current = null;

      if (import.meta.env.DEV) {
        console.log(
          '%c[Audio] 🔊 Playing (Web Audio)',
          'color: #16A34A; font-weight: bold;',
          { url: cleanUrl, duration: audioBuffer.duration.toFixed(2) + 's' }
        );
      }
    } catch (webAudioErr) {
      // Fallback: HTML5 Audio element
      console.warn('[Audio] Web Audio failed, using HTML5 fallback:', webAudioErr.message);

      try {
        const audio = new Audio();
        html5AudioRef.current = audio;

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Audio load timeout')), 10000);

          audio.oncanplaythrough = () => {
            clearTimeout(timeout);
            audio.play().then(resolve).catch(reject);
          };
          audio.onended = () => {
            setIsPlaying(false);
            html5AudioRef.current = null;
          };
          audio.onerror = () => {
            clearTimeout(timeout);
            reject(new Error(`HTML5 Audio error code: ${audio.error?.code}`));
          };
          audio.src = cleanUrl;
          audio.load();
        });

        // Clear any pending audio since playback succeeded
        pendingAudioRef.current = null;

        if (import.meta.env.DEV) {
          console.log(
            '%c[Audio] 🔊 Playing (HTML5 fallback)',
            'color: #16A34A; font-weight: bold;',
            { url: cleanUrl }
          );
        }
      } catch (html5Err) {
        console.error('[Audio] Both Web Audio and HTML5 failed:', html5Err);
        
        // Catch user interaction requirement / autoplay errors and queue silently
        const isAutoplayBlock = 
          html5Err.name === 'NotAllowedError' || 
          html5Err.message.includes('play() failed') || 
          html5Err.message.includes('user gesture') ||
          html5Err.message.includes('gesture');

        if (isAutoplayBlock) {
          console.log('[Audio] HTML5 fallback blocked by autoplay. Queueing URL:', cleanUrl);
          pendingAudioRef.current = cleanUrl;
          setIsPlaying(false);
        } else {
          setError('Audio playback failed. Please try again.');
          setIsPlaying(false);
        }
      }
    }
  }, []);

  // Unlock Web Audio Context (Pre-warming for Mobile)
  const unlockAudio = useCallback(async () => {
    try {
      const audioCtx = getPlaybackContext();
      if (audioCtx) {
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
          // Play a short silent buffer to warm up iOS Safari graph
          const buffer = audioCtx.createBuffer(1, 1, 22050);
          const source = audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtx.destination);
          source.start(0);
          console.log('[Audio] Web Audio context pre-warmed & unlocked successfully.');
        }

        // Check if there is a pending audio URL to play inside this user gesture!
        if (pendingAudioRef.current) {
          const urlToPlay = pendingAudioRef.current;
          pendingAudioRef.current = null; // Clear first to avoid re-entry
          console.log('[Audio] Playing pending queued audio inside user gesture:', urlToPlay);
          playAudio(urlToPlay, true).catch((err) => {
            console.error('[Audio] Failed to play pending queued audio:', err);
          });
        }
      }
    } catch (err) {
      console.warn('[Audio] Failed to pre-warm audio context:', err);
    }
  }, [playAudio]);

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

      // Close streaming contexts
      if (recordingProcessorRef.current) {
        recordingProcessorRef.current.disconnect();
        recordingProcessorRef.current.onaudioprocess = null;
        recordingProcessorRef.current = null;
      }
      if (recordingContextRef.current) {
        recordingContextRef.current.close().catch(() => {});
        recordingContextRef.current = null;
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
      // Note: We do NOT close the shared/persistent playback context on unmount so it stays unlocked!
    };
  }, []);

  return {
    startRecording,
    stopRecording,
    playAudio,
    stopAudio,
    unlockAudio,
    isRecording,
    isPlaying,
    audioLevel,
    recordingDuration,
    error,
  };
}

export default useAudio;
