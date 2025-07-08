import { NextRequest, NextResponse } from "next/server";
import { WebformService } from "@/services/webformService";
import { FormData as WebformData } from "@/types/webform";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ webformId: string }> }
) {
  try {
    const { webformId } = await params;

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

    let formData: WebformData;
    try {
      formData = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const webformService = new WebformService(drupalUrl);
    const result = await webformService.submitForm(webformId, formData);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error submitting webform:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to submit form";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
