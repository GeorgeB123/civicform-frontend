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
    
    // Mock mode: If no DRUPAL_URL is configured, run in mock mode
    const isMockMode = !drupalUrl;

    let formData: WebformData;
    try {
      formData = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Debug: Log the raw form data received from client
    console.log("=== WEBFORM SUBMISSION DEBUG ===");
    console.log("Webform ID:", webformId);
    console.log("Raw form data received:", JSON.stringify(formData, null, 2));

    if (isMockMode) {
      // Mock mode: Transform and log the data without actually submitting
      console.log("=== RUNNING IN MOCK MODE (No DRUPAL_URL configured) ===");
      
      const webformService = new WebformService("http://mock-drupal.local");
      const transformedData = webformService.transformFormData(formData);
      
      console.log("=== MOCK SUBMISSION PAYLOAD ===");
      console.log("Would submit to:", `http://mock-drupal.local/webform_rest/${webformId}/submit`);
      console.log("Transformed payload:", JSON.stringify(transformedData, null, 2));
      console.log("=== END MOCK SUBMISSION ===");

      return NextResponse.json({
        success: true,
        mock: true,
        message: "Mock submission completed - check server logs for payload details",
        data: {
          webformId,
          transformedData,
          endpoint: `http://mock-drupal.local/webform_rest/${webformId}/submit`
        },
      });
    }

    const webformService = new WebformService(drupalUrl!);
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
