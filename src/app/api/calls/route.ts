import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;

  const outcome = searchParams.get("outcome");
  const userId = searchParams.get("userId");
  const customerId = searchParams.get("customerId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);

  const where: Record<string, unknown> = {};

  if (outcome) {
    where.outcomeLabel = outcome;
  }
  if (userId) {
    where.userId = userId;
  }
  if (customerId) {
    where.customerId = customerId;
  }
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo) } : {}),
    };
  }
  if (search) {
    where.OR = [
      { customer: { name: { contains: search } } },
      { customer: { company: { contains: search } } },
      { user: { name: { contains: search } } },
    ];
  }

  const [calls, total] = await Promise.all([
    prisma.call.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        customer: { select: { id: true, name: true, company: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.call.count({ where }),
  ]);

  return NextResponse.json({
    calls,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { userId, customerId, audioPath, duration, status } = body;

  if (!userId || !customerId) {
    return NextResponse.json(
      { error: "userId and customerId are required" },
      { status: 400 }
    );
  }

  const call = await prisma.call.create({
    data: {
      userId,
      customerId,
      audioPath: audioPath ?? null,
      duration: duration ?? null,
      status: status ?? "recording",
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      customer: { select: { id: true, name: true, company: true } },
    },
  });

  return NextResponse.json(call, { status: 201 });
}
