import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("saweria-callback-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const bodyText = await req.text();
    const payload = JSON.parse(bodyText);

    // According to Saweria docs, the message to hash is:
    // {version}{id}{amount_raw}{donator_name}{donator_email}
    const { version, id, amount_raw, donator_name, donator_email } = payload;
    
    // Convert undefined/null to empty string just in case, though they should be present
    const message = `${version || ''}${id || ''}${amount_raw || ''}${donator_name || ''}${donator_email || ''}`;

    const { searchParams } = new URL(req.url);
    const streamKey = searchParams.get("key");

    if (!streamKey) {
      return NextResponse.json({ error: "Missing key in URL" }, { status: 400 });
    }

    // Optional: You can check if the streamKey exists in the DB here
    // const settings = await prisma.settings.findUnique({ where: { streamKey } });
    // if (!settings) return NextResponse.json({ error: "Invalid key" }, { status: 403 });

    // Generate HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", streamKey)
      .update(message)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("Invalid signature from Saweria.", { expectedSignature, signature });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Valid signature! Here we would normally save the transaction to the database
    // and push an event to the client (via Pusher/Socket.io/SSE) to update the queue.
    console.log("Saweria Webhook Validated:", payload);
    
    // For now, since we are using dummy data, we just acknowledge receipt
    return NextResponse.json({ success: true, message: "Webhook received and validated" });

  } catch (error) {
    console.error("Error processing Saweria webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
