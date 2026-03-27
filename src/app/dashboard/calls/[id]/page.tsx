"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
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
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface CallData {
  id: string;
  audioPath: string | null;
  outcomeLabel: string;
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

export default function CallDetailPage() {
  const params = useParams();
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

  // Fetch audio via fetch() so session cookies are sent on mobile browsers
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Call Detail</h1>
        <OutcomeBadge outcome={call.outcomeLabel} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Audio + Transcript */}
        <div className="space-y-6">
          <Card className="shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle>Audio Recording</CardTitle>
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
                <p className="text-sm text-muted-foreground italic">
                  No audio recording available (seeded data).
                </p>
              )}
              <div className="mt-2 text-sm text-muted-foreground">
                {call.customer.company} &mdash; {call.user.name}
                {call.duration && (
                  <span className="ml-2">
                    ({Math.floor(call.duration / 60)}:{String(call.duration % 60).padStart(2, "0")})
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle>Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                {call.transcript?.text || (
                  <span className="text-muted-foreground italic">
                    No transcript available.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Summary + Fields + Outcome */}
        <div className="space-y-6">
          <Card className="shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                rows={6}
                placeholder="Edit call summary..."
              />
            </CardContent>
          </Card>

          {Object.keys(extractedFields).length > 0 && (
            <Card className="shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle>Extracted Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(extractedFields).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      <span className="font-semibold">{key}:</span>&nbsp;{String(value)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle>Outcome Override</CardTitle>
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
                  <SelectItem value="Order">Order</SelectItem>
                  <SelectItem value="Complaint">Complaint</SelectItem>
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
