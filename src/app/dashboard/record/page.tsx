"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AudioRecorder } from "@/components/audio-recorder";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2, User, Building2, Zap } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  company: string;
}

type Step = "select-customer" | "record" | "processing";

const STATUS_MESSAGES = [
  "Uploading...",
  "Transcribing...",
  "Summarizing...",
];

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs > 0 ? hrs.toString().padStart(2, "0") + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function RecordPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [step, setStep] = useState<Step>("select-customer");
  const [statusIndex, setStatusIndex] = useState(0);
  const [recordDuration, setRecordDuration] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch((err) => console.error("Failed to fetch customers:", err));
  }, []);

  useEffect(() => {
    if (step !== "processing") return;
    const interval = setInterval(() => {
      setStatusIndex((prev) =>
        prev < STATUS_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [step]);

  // Track duration — only while timer is active
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setRecordDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const handleRecordingComplete = async (blob: Blob, duration: number, fileExtension: string = "webm") => {
    setTimerActive(false);
    setStep("processing");
    setStatusIndex(0);

    try {
      const formData = new FormData();
      formData.append("audio", blob, `recording.${fileExtension}`);
      formData.append("customerId", selectedCustomerId);
      formData.append("duration", duration.toString());

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      router.push(`/dashboard/calls/${data.callId}`);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed. Please try again.");
      setStep("record");
    }
  };

  // Step 1: Customer Selection
  if (step === "select-customer") {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-headline font-extrabold text-slate-900 tracking-tighter">
            New Call Recording
          </h2>
          <p className="text-lg text-slate-500">Select a customer to begin recording</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Customer</label>
            <Select
              value={selectedCustomerId}
              onValueChange={(val) => setSelectedCustomerId(val ?? "")}
            >
              <SelectTrigger className="h-14 text-base">
                <SelectValue placeholder="Choose a customer..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.company} — {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Consent banner */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              This call will be recorded for quality assurance. Please ensure
              all participants have been informed and have given their consent.
            </p>
          </div>

          <Button
            onClick={() => { setStep("record"); setRecordDuration(0); }}
            disabled={!selectedCustomerId}
            className="w-full h-14 bg-gradient-to-br from-primary to-blue-600 text-white rounded-full font-headline font-bold text-lg shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Continue to Recording
          </Button>
        </div>
      </div>
    );
  }

  // Step 3: Processing
  if (step === "processing") {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex flex-col items-center justify-center gap-6 py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center space-y-2">
            <p className="text-2xl font-headline font-bold text-slate-900">
              {STATUS_MESSAGES[statusIndex]}
            </p>
            <p className="text-slate-500">
              Please wait while we process your recording.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Recording (main designer view)
  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-12 py-2 sm:py-8">
      {/* Header Status */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2 sm:gap-4">
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-2 mb-1 sm:mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
            </span>
            <span className="text-xs font-bold text-destructive uppercase tracking-[0.2em]">
              Live Recording
            </span>
          </div>
          <h2 className="text-2xl sm:text-5xl font-headline font-extrabold text-slate-900 tracking-tighter leading-none">
            {selectedCustomer?.company ?? "Call Recording"}
          </h2>
          <p className="text-sm sm:text-lg text-slate-500">
            Sales Call • {selectedCustomer?.name}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-1">Duration</p>
          <p className="text-3xl sm:text-5xl font-headline font-extrabold text-slate-900 tracking-tighter tabular-nums">
            {formatTime(recordDuration)}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Waveform & Controls */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          <AudioRecorder onRecordingComplete={handleRecordingComplete} onRecordingStart={() => { setRecordDuration(0); setTimerActive(true); }} />
        </div>

        {/* Bookmarks Panel */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 sm:p-8 rounded-xl h-full flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h3 className="font-headline font-bold text-xl">Notes</h3>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                LIVE
              </span>
            </div>

            {/* Quick Note Input */}
            <div className="relative mb-6 sm:mb-8">
              <textarea
                className="w-full h-24 p-4 bg-slate-100 border-none rounded-xl resize-none text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                placeholder="Add a quick note..."
              />
            </div>

            {/* Placeholder Notes */}
            <div className="flex-1 space-y-5 overflow-y-auto">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="w-px h-full bg-slate-200 mt-2" />
                </div>
                <div className="pb-4">
                  <p className="text-[10px] text-primary font-bold tracking-[0.15em] mb-1">
                    RECORDING STARTED
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Call with {selectedCustomer?.company ?? "customer"} has begun.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-6 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 bg-slate-100 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-200 transition-all">
                Highlight
              </button>
              <button className="flex items-center justify-center gap-2 py-3 bg-slate-100 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-200 transition-all">
                Action Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Context Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
        <div className="bg-slate-100 p-5 sm:p-6 rounded-xl flex items-center gap-4 sm:gap-6">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold tracking-[0.15em]">CONTACT</p>
            <p className="text-sm font-headline font-bold text-slate-900">{selectedCustomer?.name ?? "—"}</p>
          </div>
        </div>
        <div className="bg-slate-100 p-5 sm:p-6 rounded-xl flex items-center gap-4 sm:gap-6">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold tracking-[0.15em]">ACCOUNT</p>
            <p className="text-sm font-headline font-bold text-slate-900">{selectedCustomer?.company ?? "—"}</p>
          </div>
        </div>
        <div className="bg-slate-100 p-5 sm:p-6 rounded-xl flex items-center gap-4 sm:gap-6 border-2 border-primary/10">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold tracking-[0.15em]">STATUS</p>
            <p className="text-sm font-headline font-bold text-primary">Active Recording</p>
          </div>
        </div>
      </div>
    </div>
  );
}
