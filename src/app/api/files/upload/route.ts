import { NextRequest, NextResponse } from "next/server";
import { WebformService } from "@/services/webformService";

export async function POST(request: NextRequest) {
  try {
    const drupalUrl = process.env.DRUPAL_URL;
    if (!drupalUrl) {
      return NextResponse.json(
        { error: "DRUPAL_URL environment variable is not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const files: File[] = [];

    // Extract files from form data
    for (const [, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const webformService = new WebformService(drupalUrl);
    const uploadResults = await webformService.uploadFiles(files);

    return NextResponse.json({
      success: true,
      files: uploadResults,
    });
  } catch (error) {
    console.error("Error uploading files:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to upload files";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
