import { NextResponse } from "next/server";
import { getWebhookLogs } from "@/lib/webhookLogs";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const settings = await prisma.settings.findUnique({ where: { userId } });
    if (!settings) return new NextResponse("Settings not found", { status: 404 });

    const logs = getWebhookLogs(settings.streamKey);
    return NextResponse.json(logs);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
