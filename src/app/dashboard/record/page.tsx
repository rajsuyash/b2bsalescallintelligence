"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AudioRecorder } from "@/components/audio-recorder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
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

const STEP_LABELS = [
  { key: "select-customer", label: "Select" },
  { key: "record", label: "Record" },
  { key: "processing", label: "Process" },
];

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const stepIndex = STEP_LABELS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center w-full px-4 sm:px-0">
      {STEP_LABELS.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                i <= stepIndex
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-500"
              )}
            >
              {i + 1}
            </div>
            <span className="text-xs mt-1 text-slate-500 font-medium">{s.label}</span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className={cn(
                "w-12 sm:w-20 h-0.5 mx-2 mb-5 transition-colors",
                i < stepIndex ? "bg-blue-600" : "bg-slate-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function RecordPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [step, setStep] = useState<Step>("select-customer");
  const [statusIndex, setStatusIndex] = useState(0);

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

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    setStep("processing");
    setStatusIndex(0);

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      formData.append("customerId", selectedCustomerId);
      formData.append("duration", duration.toString());

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      router.push(`/dashboard/calls/${data.callId}`);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed. Please try again.");
      setStep("record");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 w-full px-4 sm:px-0">
      <h1 className="text-2xl font-bold">Record a Call</h1>

      <StepIndicator currentStep={step} />

      {/* Step 1: Select Customer */}
      {step === "select-customer" && (
        <Card>
          <CardHeader>
            <CardTitle>Select Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={selectedCustomerId}
              onValueChange={(val) => setSelectedCustomerId(val ?? "")}
            >
              <SelectTrigger>
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

            {/* Consent banner */}
            <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">
                This call will be recorded for quality assurance. Please ensure
                all participants have been informed and have given their consent.
              </p>
            </div>

            <Button
              onClick={() => setStep("record")}
              disabled={!selectedCustomerId}
              className="w-full"
            >
              Continue to Recording
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Record */}
      {step === "record" && (
        <Card>
          <CardHeader>
            <CardTitle>Recording</CardTitle>
          </CardHeader>
          <CardContent>
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          </CardContent>
        </Card>
      )}

      {/* Step 3: Processing */}
      {step === "processing" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg font-medium">
              {STATUS_MESSAGES[statusIndex]}
            </p>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your recording.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
