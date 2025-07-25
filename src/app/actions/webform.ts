"use server";

import { WebformService } from "@/services/webformService";
import { FormData as WebformData, FileUploadResult } from "@/types/webform";

export interface SubmissionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function submitWebform(
  webformId: string,
  formData: WebformData
): Promise<SubmissionResult> {
  try {
    const drupalUrl = process.env.DRUPAL_URL;
    if (!drupalUrl) {
      return {
        success: false,
        error: "DRUPAL_URL environment variable is not configured",
      };
    }

    const webformService = new WebformService(drupalUrl);
    const result = await webformService.submitForm(webformId, formData);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error submitting webform:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to submit form";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function fetchWebformStructure(webformId: string) {
  try {
    const drupalUrl = process.env.DRUPAL_URL;
    if (!drupalUrl) {
      return null;
    }

    const webformService = new WebformService(drupalUrl);
    const response = await webformService.fetchFormStructure(webformId);
    return response;
  } catch (error) {
    console.error("Error fetching webform structure:", error);
    
    // Re-throw specific errors that should be handled differently
    if (error instanceof Error && error.message === "This form is closed") {
      throw error;
    }
    
    return null;
  }
}

export async function uploadFiles(formData: FormData): Promise<{
  success: boolean;
  data?: FileUploadResult[];
  error?: string;
}> {
  try {
    const drupalUrl = process.env.DRUPAL_URL;
    if (!drupalUrl) {
      return {
        success: false,
        error: "DRUPAL_URL environment variable is not configured",
      };
    }

    const files: File[] = [];
    for (const value of formData.values()) {
      if (value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return {
        success: false,
        error: "No files found in form data",
      };
    }

    const webformService = new WebformService(drupalUrl);
    const result = await webformService.uploadFiles(files);

    return {
      success: true,
      data: result as FileUploadResult[],
    };
  } catch (error) {
    console.error("Error uploading files:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to upload files";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
