import { FormData as WebformData, WebformApiResponse } from '@/types/webform';

export class WebformService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetchFormStructure(webformId: string): Promise<WebformApiResponse> {
    try {
      console.log('Fetching form structure for:', webformId);
      const response = await fetch(`${this.baseUrl}/api/webform/${webformId}/structure`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch form structure: ${response.status} ${response.statusText}`);
      }

      const structure = await response.json();
      return structure;
    } catch (error) {
      console.error('Error fetching form structure:', error);
      throw error;
    }
  }

  async submitForm(webformId: string, formData: WebformData): Promise<unknown> {
    try {
      // Transform form data to match Drupal's expected format
      const submissionData = this.transformFormData(formData);

      const response = await fetch(`${this.baseUrl}/webform_rest/${webformId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Form submission failed: ${response.status} ${response.statusText}`, {
          cause: errorData,
        });
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  }

  private transformFormData(formData: WebformData): Record<string, unknown> {
    const transformed: Record<string, unknown> = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return; // Skip empty values
      }

      // Handle composite fields (address, name, email confirm)
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof File)) {
        // For composite fields, flatten the structure
        if (this.isAddressField(value)) {
          transformed[key] = this.transformAddressData(value);
        } else if (this.isFullNameField(value)) {
          transformed[key] = this.transformFullNameData(value);
        } else if (this.isEmailConfirmField(value)) {
          // For email confirm, only send the email value
          transformed[key] = value.email;
        } else {
          transformed[key] = value;
        }
      } else if (Array.isArray(value)) {
        // Handle file uploads and multiple values
        if (value.length > 0) {
          if (value[0] instanceof File) {
            // Handle file uploads - this would need to be uploaded separately
            // and then reference the file IDs in the submission
            transformed[key] = value.map(file => ({
              filename: file.name,
              filesize: file.size,
              filemime: file.type,
            }));
          } else {
            transformed[key] = value;
          }
        }
      } else {
        transformed[key] = value;
      }
    });

    return transformed;
  }

  private isAddressField(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === 'object' && (
      (value as Record<string, unknown>).hasOwnProperty('address') ||
      (value as Record<string, unknown>).hasOwnProperty('city') ||
      (value as Record<string, unknown>).hasOwnProperty('postal_code')
    ));
  }

  private isFullNameField(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === 'object' && (
      (value as Record<string, unknown>).hasOwnProperty('first_name') ||
      (value as Record<string, unknown>).hasOwnProperty('last_name') ||
      (value as Record<string, unknown>).hasOwnProperty('title')
    ));
  }

  private isEmailConfirmField(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === 'object' && 
      (value as Record<string, unknown>).hasOwnProperty('email') && 
      (value as Record<string, unknown>).hasOwnProperty('email_confirm'));
  }

  private transformAddressData(address: Record<string, unknown>): Record<string, unknown> {
    const transformed: Record<string, unknown> = {};
    
    if (address.address) transformed.address = address.address;
    if (address.address_2) transformed.address_2 = address.address_2;
    if (address.city) transformed.city = address.city;
    if (address.state_province) transformed.state_province = address.state_province;
    if (address.postal_code) transformed.postal_code = address.postal_code;
    if (address.country) transformed.country = address.country;

    return transformed;
  }

  private transformFullNameData(name: Record<string, unknown>): Record<string, unknown> {
    const transformed: Record<string, unknown> = {};
    
    if (name.title) transformed.title = name.title;
    if (name.first_name) transformed.first_name = name.first_name;
    if (name.last_name) transformed.last_name = name.last_name;

    return transformed;
  }

  async uploadFiles(files: File[]): Promise<unknown[]> {
    // This method would handle file uploads to Drupal
    // You might need to implement this based on your Drupal file upload endpoint
    const uploadResults = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('files[file]', file);

        const response = await fetch(`${this.baseUrl}/file/upload`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          uploadResults.push(result);
        } else {
          throw new Error(`File upload failed for ${file.name}`);
        }
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        throw error;
      }
    }

    return uploadResults;
  }
}