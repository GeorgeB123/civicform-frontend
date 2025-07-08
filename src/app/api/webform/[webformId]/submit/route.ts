import { NextRequest, NextResponse } from "next/server";
import { WebformService } from "@/services/webformService";
import { FormData as WebformData } from "@/types/webform";

async function verifyTurnstileToken(
  token: string,
  remoteip?: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error(
      "TURNSTILE_SECRET_KEY environment variable is not configured"
    );
    return false;
  }

  // Handle Cloudflare's test keys - always pass in development
  if (secretKey === "1x0000000000000000000000000000000AA") {
    console.log("Using Cloudflare test secret key - automatically passing verification");
    return true;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
          remoteip: remoteip,
        }),
      }
    );

    const result = await response.json();
    
    if (!result.success) {
      console.error("Turnstile verification failed:", result);
    }
    
    return result.success === true;
  } catch (error) {
    console.error("Error verifying Turnstile token:", error);
    return false;
  }
}

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

    // Verify Turnstile token
    const turnstileToken = formData["cf-turnstile-response"] as string;
    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Security verification is required" },
        { status: 400 }
      );
    }

    const clientIP =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For") ||
      request.headers.get("X-Real-IP") ||
      undefined;

    const isValidToken = await verifyTurnstileToken(turnstileToken, clientIP);
    if (!isValidToken) {
      return NextResponse.json(
        { error: "Security verification failed" },
        { status: 400 }
      );
    }

    // Remove Turnstile token from form data before submitting to Drupal
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { "cf-turnstile-response": _, ...cleanFormData } = formData;

    const webformService = new WebformService(drupalUrl);
    const result = await webformService.submitForm(webformId, cleanFormData);

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
