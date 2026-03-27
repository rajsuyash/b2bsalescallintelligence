"use client";

import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { Mic, MicOff, Pause, Play, StopCircle, Volume2 } from "lucide-react";
import { useEffect, useRef, useMemo } from "react";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs > 0 ? hrs.toString().padStart(2, "0") + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function WaveformVisualization({ isActive }: { isActive: boolean }) {
  const bars = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => {
      const height = Math.random() * 80 + 20;
      const delay = i * 0.05;
      return { height, delay };
    });
  }, []);

  return (
    <div className="flex items-center justify-center h-40 gap-[3px]">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="waveform-bar rounded-full"
          style={{
            height: isActive ? undefined : `${bar.height * 0.3}px`,
            ["--wave-height" as string]: `${bar.height}px`,
            animationDelay: `${bar.delay}s`,
            animationPlayState: isActive ? "running" : "paused",
            opacity: isActive ? 0.8 : 0.3,
            transition: "opacity 0.3s",
          }}
        />
      ))}
    </div>
  );
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const { status, startRecording, stopRecording, audioBlob, duration } =
    useAudioRecorder();

  const onCompleteRef = useRef(onRecordingComplete);
  onCompleteRef.current = onRecordingComplete;
  const durationRef = useRef(duration);
  durationRef.current = duration;
  const calledRef = useRef(false);

  useEffect(() => {
    if (status === "stopped" && audioBlob && !calledRef.current) {
      calledRef.current = true;
      onCompleteRef.current(audioBlob, durationRef.current);
    }
    if (status === "idle" || status === "recording") {
      calledRef.current = false;
    }
  }, [status, audioBlob]);

  const isRecording = status === "recording";

  return (
    <div className="space-y-8">
      {/* Waveform Canvas */}
      <div className="h-80 bg-white rounded-xl flex items-center justify-center overflow-hidden relative shadow-sm">
        <WaveformVisualization isActive={isRecording} />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />

        {/* Bottom indicator */}
        <div className="absolute bottom-6 left-8 flex items-center gap-3">
          {isRecording && (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
              </span>
              <span className="text-xs font-bold text-destructive uppercase tracking-widest">
                Live Recording
              </span>
            </>
          )}
          {!isRecording && status === "idle" && (
            <span className="text-sm text-slate-400">Click start to begin recording</span>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between p-6 sm:p-8 bg-slate-100 rounded-xl">
        <div className="flex gap-3">
          {isRecording ? (
            <>
              <button className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-slate-500 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm">
                <Pause className="h-5 w-5" />
              </button>
              <button className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-slate-500 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm">
                <MicOff className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-slate-500 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm">
              <Volume2 className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Center action */}
        {status === "idle" || status === "stopped" ? (
          <button
            onClick={startRecording}
            className="px-8 sm:px-10 py-4 bg-gradient-to-br from-primary to-blue-600 text-white rounded-full font-headline font-bold text-base sm:text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
          >
            <Mic className="h-5 w-5" />
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-8 sm:px-10 py-4 bg-gradient-to-br from-primary to-blue-600 text-white rounded-full font-headline font-bold text-base sm:text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
          >
            <StopCircle className="h-5 w-5" />
            Stop &amp; Summarize
          </button>
        )}

        <div className="flex gap-3">
          <button className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-slate-500 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm">
            <Volume2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
