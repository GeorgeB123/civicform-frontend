import {
  FormData as WebformData,
  WebformStructure,
  ClientWebformServiceInterface,
  FileUploadResult,
} from "@/types/webform";

export class ClientWebformService implements ClientWebformServiceInterface {
  async fetchFormStructure(webformId: string): Promise<WebformStructure> {
    try {
      const response = await fetch(`/api/webform/${webformId}/structure`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to fetch form structure: ${response.status} ${response.statusText}`
        );
      }

      const structure = await response.json();
      return structure;
    } catch (error) {
      console.error("Error fetching form structure:", error);
      throw error;
    }
  }

  async submitForm(webformId: string, formData: WebformData): Promise<unknown> {
    try {
      // Handle file uploads first if there are any files
      const processedData = { ...formData };

      // Process file uploads
      for (const [key, value] of Object.entries(formData)) {
        if (
          Array.isArray(value) &&
          value.length > 0 &&
          value[0] instanceof File
        ) {
          try {
            const uploadResults = await this.uploadFiles(value);
            // Replace file objects with file IDs/references
            processedData[key] = uploadResults.map(
              (result: FileUploadResult) => result.fid || result.id
            );
          } catch (uploadError) {
            console.error(`File upload failed for field ${key}:`, uploadError);
            throw new Error(`Failed to upload files for ${key}`);
          }
        }
      }

      // Debug: Log client-side submission data
      console.log("=== CLIENT WEBFORM SUBMISSION DEBUG ===");
      console.log("Webform ID:", webformId);
      console.log("Original form data:", JSON.stringify(formData, null, 2));
      console.log("Processed form data (after file uploads):", JSON.stringify(processedData, null, 2));

      const response = await fetch(`/api/webform/${webformId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Form submission failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error submitting form:", error);
      throw error;
    }
  }

  async uploadFiles(files: File[]): Promise<FileUploadResult[]> {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `File upload failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      return result.files || [];
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    }
  }
}
