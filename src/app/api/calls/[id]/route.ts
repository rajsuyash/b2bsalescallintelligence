import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
    include: {
      transcript: true,
      summary: true,
      user: { select: { id: true, name: true, email: true } },
      customer: true,
    },
  });

  if (!call) {
    return NextResponse.json({ error: "Call not found" }, { status: 404 });
  }

  return NextResponse.json(call);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { summaryText, overrideLabel, overrideReason } = body;

  const call = await prisma.call.findUnique({
    where: { id },
    include: { summary: true },
  });

  if (!call) {
    return NextResponse.json({ error: "Call not found" }, { status: 404 });
  }

  const summaryData: Record<string, unknown> = {};
  if (summaryText !== undefined) summaryData.summaryText = summaryText;
  if (overrideLabel !== undefined) summaryData.overrideLabel = overrideLabel;
  if (overrideReason !== undefined) summaryData.overrideReason = overrideReason;

  let summary;
  if (call.summary) {
    summary = await prisma.summary.update({
      where: { callId: id },
      data: summaryData,
    });
  } else {
    if (!summaryText) {
      return NextResponse.json(
        { error: "summaryText is required when creating a new summary" },
        { status: 400 }
      );
    }
    summary = await prisma.summary.create({
      data: {
        callId: id,
        summaryText,
        overrideLabel: overrideLabel ?? null,
        overrideReason: overrideReason ?? null,
      },
    });
  }

  if (overrideLabel !== undefined) {
    await prisma.call.update({
      where: { id },
      data: { outcomeLabel: overrideLabel },
    });
  }

  return NextResponse.json(summary);
}
