"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type RecorderStatus = "idle" | "recording" | "paused" | "stopped";

export function useAudioRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = useCallback(async () => {
    try {
      chunksRef.current = [];
      setAudioBlob(null);
      setDuration(0);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm;codecs=opus",
        });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setStatus("stopped");

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(1000);
      setStatus("recording");

      intervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      setStatus("idle");
    }
  }, [audioUrl]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, []);

  return {
    status,
    startRecording,
    stopRecording,
    audioBlob,
    duration,
    audioUrl,
  };
}
