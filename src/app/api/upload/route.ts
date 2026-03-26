import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { transcribeAudio } from "@/lib/ai/transcribe";
import { summarizeTranscript } from "@/lib/ai/summarize";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const audio = formData.get("audio") as File | null;
  const customerId = formData.get("customerId") as string | null;
  const duration = parseInt(formData.get("duration") as string) || 0;

  if (!audio || !customerId) {
    return NextResponse.json(
      { error: "Audio file and customerId are required" },
      { status: 400 }
    );
  }

  // Save audio file
  const buffer = Buffer.from(await audio.arrayBuffer());
  const filename = `call_${Date.now()}.webm`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  // Ensure upload directory exists
  const { mkdir } = await import("fs/promises");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);

  // Create call record
  const call = await prisma.call.create({
    data: {
      userId: session.user.id,
      customerId,
      status: "uploaded",
      audioPath: `/uploads/${filename}`,
      duration,
    },
  });

  try {
    // Transcribe
    await prisma.call.update({
      where: { id: call.id },
      data: { status: "transcribing" },
    });

    const transcriptText = await transcribeAudio(filePath);

    await prisma.transcript.create({
      data: { callId: call.id, text: transcriptText },
    });

    // Summarize
    await prisma.call.update({
      where: { id: call.id },
      data: { status: "summarizing" },
    });

    const result = await summarizeTranscript(transcriptText);

    await prisma.summary.create({
      data: {
        callId: call.id,
        summaryText: result.summaryText,
        extractedFields: JSON.stringify(result.extractedFields),
      },
    });

    // Complete
    await prisma.call.update({
      where: { id: call.id },
      data: {
        status: "complete",
        outcomeLabel: result.outcomeLabel,
        outcomeConfidence: result.outcomeConfidence,
        complaintSeverity: result.complaintSeverity ?? null,
      },
    });

    return NextResponse.json({ callId: call.id, status: "complete" });
  } catch (error) {
    console.error("AI pipeline error:", error);
    await prisma.call.update({
      where: { id: call.id },
      data: { status: "complete", outcomeLabel: "Normal Visit", outcomeConfidence: 0 },
    });
    return NextResponse.json({ callId: call.id, status: "complete", warning: "AI processing failed" });
  }
}
