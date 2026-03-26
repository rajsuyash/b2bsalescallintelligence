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
  const userId = searchParams.get("userId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const where: Record<string, unknown> = {};

  if (userId) {
    where.userId = userId;
  }
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
    };
  }

  const [totalCalls, orders, complaints, normalVisits] = await Promise.all([
    prisma.call.count({ where }),
    prisma.call.count({ where: { ...where, outcomeLabel: "Order" } }),
    prisma.call.count({ where: { ...where, outcomeLabel: "Complaint" } }),
    prisma.call.count({ where: { ...where, outcomeLabel: "Normal Visit" } }),
  ]);

  return NextResponse.json({
    totalCalls,
    orders,
    complaints,
    normalVisits,
  });
}
