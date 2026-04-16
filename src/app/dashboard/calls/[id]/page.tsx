"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OutcomeBadge } from "@/components/outcome-badge";
import {
  Loader2, Save, ArrowLeft, Clock, User, Building2,
  Brain, FileText, AlertTriangle, ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

interface CallData {
  id: string;
  audioPath: string | null;
  outcomeLabel: string;
  outcomeConfidence: number | null;
  complaintSeverity: string | null;
  duration: number;
  createdAt: string;
  user: { name: string };
  customer: { company: string; name: string };
  transcript: { text: string } | null;
  summary: {
    summaryText: string;
    extractedFields: string | null;
    overrideLabel: string | null;
    overrideReason: string | null;
  } | null;
}

const SEVERITY_CONFIG: Record<string, { color: string; label: string }> = {
  low: { color: "bg-yellow-100 text-yellow-800", label: "Low Severity" },
  medium: { color: "bg-orange-100 text-orange-800", label: "Medium Severity" },
  high: { color: "bg-red-100 text-red-800", label: "High Severity" },
  critical: { color: "bg-red-200 text-red-900", label: "Critical" },
};

function FormattedTranscript({ text }: { text: string }) {
  const lines = text.split("\n").filter((line) => line.trim());

  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0 && colonIndex < 40) {
          const speaker = line.slice(0, colonIndex).trim();
          const content = line.slice(colonIndex + 1).trim();
          const isCustomer = speaker.toLowerCase().includes("customer") ||
            speaker.toLowerCase().includes("suresh") ||
            speaker.toLowerCase().includes("anil") ||
            speaker.toLowerCase().includes("ramesh") ||
            speaker.toLowerCase().includes("deepak") ||
            speaker.toLowerCase().includes("kiran") ||
            speaker.toLowerCase().includes("manoj") ||
            speaker.toLowerCase().includes("sanjay") ||
            speaker.toLowerCase().includes("prakash");

          return (
            <div key={i} className={`flex gap-3 ${i > 0 ? "pt-2" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isCustomer ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                {speaker.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${isCustomer ? "text-amber-700" : "text-blue-700"}`}>
                  {speaker}
                </p>
                <p className="text-sm text-slate-700 leading-relaxed mt-0.5">
                  {content}
                </p>
              </div>
            </div>
          );
        }
        return (
          <p key={i} className="text-sm text-slate-600 leading-relaxed">{line}</p>
        );
      })}
    </div>
  );
}

function ExtractedFieldCard({ label, value }: { label: string; value: string }) {
  const formattedLabel = label.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

  return (
    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">
        {formattedLabel}
      </p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

export default function CallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params.id as string;

  const [call, setCall] = useState<CallData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const [outcomeOverride, setOutcomeOverride] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const audioBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    fetch(`/api/calls/${callId}`)
      .then((res) => res.json())
      .then((data: CallData) => {
        setCall(data);
        setEditedSummary(data.summary?.summaryText ?? "");
        setOutcomeOverride(data.outcomeLabel ?? "");
      })
      .catch((err) => console.error("Failed to fetch call:", err))
      .finally(() => setLoading(false));
  }, [callId]);

  useEffect(() => {
    if (!call?.audioPath) return;
    let cancelled = false;

    fetch(`/api/calls/${call.id}/audio`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load audio");
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        audioBlobUrlRef.current = url;
        setAudioBlobUrl(url);
      })
      .catch((err) => console.error("Audio blob fetch failed:", err));

    return () => {
      cancelled = true;
      if (audioBlobUrlRef.current) {
        URL.revokeObjectURL(audioBlobUrlRef.current);
        audioBlobUrlRef.current = null;
      }
    };
  }, [call?.id, call?.audioPath]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, string> = { summaryText: editedSummary };
      if (outcomeOverride !== call?.outcomeLabel) {
        body.overrideLabel = outcomeOverride;
        body.overrideReason = overrideReason;
      }

      const res = await fetch(`/api/calls/${callId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const refreshRes = await fetch(`/api/calls/${callId}`);
        const refreshed = await refreshRes.json();
        setCall(refreshed);
        setEditedSummary(refreshed.summary?.summaryText ?? "");
        setOutcomeOverride(refreshed.outcomeLabel ?? "");
        toast.success("Changes saved successfully");
      } else {
        toast.error("Failed to save changes");
      }
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Call not found.
      </div>
    );
  }

  const extractedFields = call.summary?.extractedFields
    ? JSON.parse(call.summary.extractedFields)
    : {};

  const durationMinutes = Math.floor(call.duration / 60);
  const durationSeconds = call.duration % 60;
  const confidencePercent = call.outcomeConfidence
    ? Math.round(call.outcomeConfidence * 100)
    : null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-headline font-extrabold text-slate-900 tracking-tight">
              {call.customer.company}
            </h1>
            <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {call.customer.name}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {durationMinutes}:{String(durationSeconds).padStart(2, "0")}
              </span>
              <span>{format(new Date(call.createdAt), "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <OutcomeBadge outcome={call.outcomeLabel} />
          {confidencePercent !== null && (
            <Badge variant="outline" className="text-xs font-mono">
              {confidencePercent}% confidence
            </Badge>
          )}
          {call.complaintSeverity && SEVERITY_CONFIG[call.complaintSeverity] && (
            <Badge className={`${SEVERITY_CONFIG[call.complaintSeverity].color} text-xs`}>
              <AlertTriangle className="h-3 w-3 mr-1" />
              {SEVERITY_CONFIG[call.complaintSeverity].label}
            </Badge>
          )}
        </div>
      </div>

      {/* AI Summary Banner */}
      {call.summary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Brain className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-[0.1em] mb-1">
                AI Summary
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {call.summary.summaryText}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Fields Grid */}
      {Object.keys(extractedFields).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(extractedFields).map(([key, value]) => (
            <ExtractedFieldCard key={key} label={key} value={String(value)} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Audio + Transcript */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                </div>
                Audio Recording
              </CardTitle>
            </CardHeader>
            <CardContent>
              {call.audioPath ? (
                <div className="bg-slate-50 rounded-lg p-3">
                  {audioBlobUrl ? (
                    <audio
                      controls
                      preload="metadata"
                      playsInline
                      className="w-full"
                      src={audioBlobUrl}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <div className="flex items-center justify-center h-12 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading audio...
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No audio — transcript generated from seeded data
                  </p>
                </div>
              )}
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <span>{call.user.name}</span>
                <span>&bull;</span>
                <span>{call.customer.company}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              {call.transcript?.text ? (
                <div className="max-h-[500px] overflow-y-auto pr-2">
                  <FormattedTranscript text={call.transcript.text} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No transcript available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Editable Summary + Outcome */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Edit Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                rows={5}
                placeholder="Edit call summary..."
                className="text-sm"
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Outcome Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={outcomeOverride}
                onValueChange={(val) => setOutcomeOverride(val ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Order">
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="h-3.5 w-3.5 text-green-600" />
                      Order
                    </span>
                  </SelectItem>
                  <SelectItem value="Complaint">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                      Complaint
                    </span>
                  </SelectItem>
                  <SelectItem value="Normal Visit">Normal Visit</SelectItem>
                </SelectContent>
              </Select>

              {outcomeOverride !== call.outcomeLabel && (
                <Input
                  placeholder="Reason for override..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                />
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full"
            size="lg"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
