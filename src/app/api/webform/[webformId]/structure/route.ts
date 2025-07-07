import { NextRequest, NextResponse } from "next/server";
import { WebformService } from "@/services/webformService";

export async function GET(
  request: NextRequest,
  { params }: { params: { webformId: string } }
) {
  try {
    const webformId = params.webformId;

    if (!webformId) {
      return NextResponse.json(
        { error: "Webform ID is required" },
        { status: 400 }
      );
    }

    const drupalUrl = process.env.DRUPAL_URL;
    if (!drupalUrl) {
      return NextResponse.json(
        { error: "DRUPAL_URL environment variable is not configured" },
        { status: 500 }
      );
    }

    const webformService = new WebformService(drupalUrl);
    const structure = await webformService.fetchFormStructure(webformId);

    return NextResponse.json(structure);
  } catch (error) {
    console.error("Error fetching webform structure:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch form structure";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
