import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readFileSync, statSync } from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const call = await prisma.call.findUnique({
    where: { id },
    select: { audioPath: true },
  });

  if (!call || !call.audioPath) {
    return NextResponse.json({ error: "Audio not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", call.audioPath);

  let stat;
  try {
    stat = statSync(filePath);
  } catch {
    return NextResponse.json({ error: "Audio file not found on disk" }, { status: 404 });
  }

  const ext = call.audioPath.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    webm: "audio/webm",
    m4a: "audio/mp4",
  };
  const contentType = mimeTypes[ext ?? ""] ?? "application/octet-stream";
  const fileSize = stat.size;

  // Handle range requests for proper audio seeking/playback
  const range = req.headers.get("range");
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const buffer = readFileSync(filePath);
    const chunk = buffer.subarray(start, end + 1);

    return new NextResponse(chunk, {
      status: 206,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(chunkSize),
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache",
      },
    });
  }

  const buffer = readFileSync(filePath);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(fileSize),
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache",
    },
  });
}
