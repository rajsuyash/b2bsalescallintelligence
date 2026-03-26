"use client";

import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";
import { useEffect } from "react";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const { status, startRecording, stopRecording, audioBlob, duration } =
    useAudioRecorder();

  useEffect(() => {
    if (status === "stopped" && audioBlob) {
      onRecordingComplete(audioBlob, duration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, audioBlob]);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Timer display */}
      <div className="text-5xl font-mono font-bold tabular-nums">
        {formatTime(duration)}
      </div>

      {/* Recording label */}
      {status === "recording" && (
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-600">Recording</span>
        </div>
      )}

      {/* Recording controls */}
      <div className="flex items-center gap-4">
        {status === "idle" || status === "stopped" ? (
          <button
            onClick={startRecording}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:scale-105 flex items-center justify-center transition-transform shadow-lg"
          >
            <Mic className="h-8 w-8 text-white" />
          </button>
        ) : (
          <>
            <button
              onClick={() => {}}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg animate-recording-glow"
              disabled
            >
              <Mic className="h-8 w-8 text-white" />
            </button>

            <Button
              variant="destructive"
              size="lg"
              onClick={stopRecording}
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Recording
            </Button>
          </>
        )}
      </div>

      {/* Status text */}
      <p className="text-sm text-muted-foreground">
        {status === "idle" && "Click the button to start recording"}
        {status === "recording" && "Recording in progress..."}
        {status === "stopped" && "Recording complete"}
      </p>
    </div>
  );
}
