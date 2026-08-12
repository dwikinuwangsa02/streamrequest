import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { dicebearUrl } = await req.json();

    if (!dicebearUrl || typeof dicebearUrl !== "string") {
      return new NextResponse("Invalid avatar URL", { status: 400 });
    }

    // Update the user's public metadata with the new dicebearUrl
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        dicebearUrl: dicebearUrl,
      },
    });

    return NextResponse.json({ success: true, url: dicebearUrl });
  } catch (error) {
    console.error("[PROFILE_AVATAR_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
