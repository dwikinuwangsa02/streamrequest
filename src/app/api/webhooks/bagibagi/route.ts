import { NextResponse } from "next/server";
import crypto from "crypto";
import { addWebhookLog } from "@/lib/webhookLogs";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-bagibagi-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const bodyText = await req.text();
    const payload = JSON.parse(bodyText);

    const { searchParams } = new URL(req.url);
    const streamKey = searchParams.get("key");

    if (!streamKey) {
      return NextResponse.json({ error: "Missing key in URL" }, { status: 400 });
    }

    // Bagibagi uses HMAC-SHA256 of the raw body payload
    const expectedSignature = crypto
      .createHmac("sha256", streamKey)
      .update(bodyText)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("Invalid signature from Bagibagi.", { expectedSignature, signature });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Payload extraction
    const { transaction_id, name, amount, message, mediaShareUrl, created_at } = payload;

    console.log("Bagibagi Webhook Validated:", {
      transaction_id,
      name,
      amount,
      message,
      mediaShareUrl
    });

    addWebhookLog({
      provider: "bagibagi",
      payload,
      streamKey
    });

    // Valid signature! Normally we would save to the database here.
    return NextResponse.json({ success: true, message: "Webhook received and validated" });

  } catch (error) {
    console.error("Error processing Bagibagi webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
