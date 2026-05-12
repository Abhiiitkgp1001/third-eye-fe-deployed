import { NextRequest, NextResponse } from "next/server";
import { createCaller } from "@/lib/trpc/server";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { listId, companyIds, question } = body;

    if (!listId || !companyIds || !Array.isArray(companyIds) || companyIds.length === 0 || !question) {
      return NextResponse.json(
        { error: "Missing required fields: listId, companyIds, question" },
        { status: 400 }
      );
    }

    // Call backend via frontend tRPC server-side caller
    const trpc = await createCaller();
    const result = await trpc.companyLists.chatAboutActivities({
      listId,
      companyIds,
      question,
    });

    return NextResponse.json({ answer: result.answer });

  } catch (error) {
    console.error("Error in company-activities chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
