export interface WebformField {
  "#type": string;
  "#title"?: string;
  "#title_display"?: string;
  "#required"?: boolean;
  "#options"?: Record<string, string>;
  "#multiple"?: boolean;
  "#access"?: boolean;
  "#open"?: boolean;
  "#admin_title"?: string;
  "#webform"?: string;
  "#webform_id"?: string;
  "#webform_key"?: string;
  "#webform_parent_key"?: string;
  "#webform_depth"?: number;
  "#webform_composite"?: boolean;
  "#webform_composite_elements"?: Record<string, WebformField>;
  "#webform_parents"?: string[];
  "#webform_plugin_id"?: string;
  "#confirm__title"?: string;
  "#flexbox"?: string;
  "#title__options"?: string;
  "#address__required"?: boolean;
  "#city__required"?: boolean;
  "#state_province__access"?: boolean;
  "#postal_code__title"?: string;
  "#postal_code__required"?: boolean;
  "#country__access"?: boolean;
  "#webform_composite_id"?: string;
  "#webform_composite_key"?: string;
  "#webform_composite_parent_key"?: string;
  [key: string]: WebformField | string | boolean | number | object | undefined;
}

export interface WebformStructure {
  [key: string]: WebformField;
}

export interface FormData {
  [key: string]: string | number | boolean | object | File[] | undefined;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface StepData {
  id: string;
  title: string;
  fields: (WebformField & { "#webform_key": string })[];
  isValid?: boolean;
}

export interface FormStepProps {
  step: StepData;
  data: FormData;
  onChange: (
    field: string,
    value: string | number | boolean | object | File[]
  ) => void;
  errors: ValidationError[];
}

export interface AddressData {
  address: string;
  address_2?: string;
  city: string;
  state_province?: string;
  postal_code: string;
  country?: string;
}

export interface FullNameData {
  title: string;
  first_name: string;
  last_name: string;
}

export interface EmailConfirmData {
  email: string;
  email_confirm: string;
}

export interface WebformApiResponse {
  webform: {
    id: string;
    title: string;
    description?: string;
    status?: string;
    settings?: Record<string, unknown>;
  };
  elements: WebformStructure;
  metadata?: {
    version: string;
    timestamp: number;
  };
}

export interface SubmissionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface FileUploadResult {
  fid?: string;
  id?: string;
  filename?: string;
  filesize?: number;
  filemime?: string;
}

export interface ClientWebformServiceInterface {
  fetchFormStructure(webformId: string): Promise<WebformStructure>;
  submitForm(webformId: string, formData: FormData): Promise<unknown>;
  uploadFiles(files: File[]): Promise<unknown[]>;
}

export interface WebformServiceInterface {
  fetchFormStructure(webformId: string): Promise<WebformApiResponse>;
  submitForm(webformId: string, formData: FormData): Promise<unknown>;
  uploadFiles(files: File[]): Promise<unknown[]>;
}
