import {
  WebformField,
  FormData as WebformData,
  ValidationError,
} from "@/types/webform";
import { shouldShowField } from "./triageLogic";

export function validateField(
  field: WebformField,
  value: unknown,
  fieldKey: string,
  formData: WebformData = {},
  triageAnswers: Record<string, string | number | boolean> = {}
): ValidationError[] {
  const errors: ValidationError[] = [];
  const isRequired = field["#required"] || false;
  const title = field["#title"] || field["#admin_title"] || fieldKey;

  // Skip validation for fields with no access
  if (field["#access"] === false) {
    return errors;
  }

  // Skip validation for fields that should be hidden based on triage logic
  if (!shouldShowField(field, formData, triageAnswers)) {
    return errors;
  }

  // Required field validation
  if (isRequired && !hasValue(value, field["#type"])) {
    errors.push({
      field: fieldKey,
      message: `${title} is required`,
    });
    return errors;
  }

  // Type-specific validation
  switch (field["#type"]) {
    case "webform_email_confirm":
      if (value && typeof value === "object") {
        const emailValue = value as { email?: string; email_confirm?: string };
        if (emailValue.email && !isValidEmail(emailValue.email)) {
          errors.push({
            field: fieldKey,
            message: "Please enter a valid email address",
          });
        }
        if (
          emailValue.email &&
          emailValue.email_confirm &&
          emailValue.email !== emailValue.email_confirm
        ) {
          errors.push({
            field: fieldKey,
            message: "Email addresses do not match",
          });
        }
      }
      break;

    case "webform_address":
      if (value && typeof value === "object") {
        const addressValue = value as {
          address?: string;
          city?: string;
          postal_code?: string;
        };
        const compositeElements = field["#webform_composite_elements"] || {};

        // Validate address components
        if (compositeElements.address?.["#required"] && !addressValue.address) {
          errors.push({
            field: `${fieldKey}.address`,
            message: "Address is required",
          });
        }

        if (compositeElements.city?.["#required"] && !addressValue.city) {
          errors.push({
            field: `${fieldKey}.city`,
            message: "City is required",
          });
        }

        if (
          compositeElements.postal_code?.["#required"] &&
          !addressValue.postal_code
        ) {
          errors.push({
            field: `${fieldKey}.postal_code`,
            message: "Postal code is required",
          });
        }
      }
      break;

    case "webform_composite_plus:full_name":
      if (value && typeof value === "object") {
        const nameValue = value as {
          title?: string;
          first_name?: string;
          last_name?: string;
        };
        const compositeElements = field["#webform_composite_elements"] || {};

        if (compositeElements.title?.["#required"] && !nameValue.title) {
          errors.push({
            field: `${fieldKey}.title`,
            message: "Title is required",
          });
        }

        if (
          compositeElements.first_name?.["#required"] &&
          !nameValue.first_name
        ) {
          errors.push({
            field: `${fieldKey}.first_name`,
            message: "First name is required",
          });
        }

        if (
          compositeElements.last_name?.["#required"] &&
          !nameValue.last_name
        ) {
          errors.push({
            field: `${fieldKey}.last_name`,
            message: "Last name is required",
          });
        }
      }
      break;

    case "managed_file":
      if (
        isRequired &&
        (!value || (Array.isArray(value) && value.length === 0))
      ) {
        errors.push({
          field: fieldKey,
          message: `${title} is required`,
        });
      }
      break;

    default:
      // Handle any composite field generically
      if (field["#webform_composite"] && field["#webform_composite_elements"]) {
        if (value && typeof value === "object") {
          const compositeValue = value as Record<string, string | undefined>;
          const compositeElements = field["#webform_composite_elements"] || {};

          Object.entries(compositeElements).forEach(([elementKey, element]) => {
            if (element?.["#required"] && !compositeValue[elementKey]) {
              const elementTitle = element["#title"] || element["#admin_title"] || elementKey;
              errors.push({
                field: `${fieldKey}.${elementKey}`,
                message: `${elementTitle} is required`,
              });
            }
          });
        }
      }
      break;
  }

  return errors;
}

export function validateStep(
  fields: Record<string, WebformField>,
  data: WebformData,
  triageAnswers: Record<string, string | number | boolean> = {}
): ValidationError[] {
  const errors: ValidationError[] = [];

  Object.entries(fields).forEach(([fieldKey, field]) => {
    // Skip wizard page fields - they don't contain actual data
    if (field["#type"] === "webform_wizard_page") {
      return;
    }

    const fieldErrors = validateField(field, data[fieldKey], fieldKey, data, triageAnswers);
    errors.push(...fieldErrors);
  });

  return errors;
}

export function hasValue(value: unknown, fieldType: string): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  switch (fieldType) {
    case "textfield":
    case "textarea":
    case "select":
    case "datelist":
      return typeof value === "string" && value.trim().length > 0;

    case "checkbox":
      return Boolean(value);

    case "managed_file":
      return Array.isArray(value) && value.length > 0;

    case "webform_email_confirm":
      return Boolean(
        value &&
          typeof value === "object" &&
          (value as { email?: string }).email &&
          (value as { email?: string }).email!.trim().length > 0
      );

    case "webform_address":
      return Boolean(
        value &&
          typeof value === "object" &&
          ((value as { address?: string; city?: string; postal_code?: string })
            .address ||
            (value as { address?: string; city?: string; postal_code?: string })
              .city ||
            (value as { address?: string; city?: string; postal_code?: string })
              .postal_code)
      );

    case "webform_composite_plus:full_name":
      return Boolean(
        value &&
          typeof value === "object" &&
          ((value as { first_name?: string; last_name?: string }).first_name ||
            (value as { first_name?: string; last_name?: string }).last_name)
      );

    default:
      // Handle composite fields generically
      if (fieldType.includes("webform_composite") || fieldType.includes("composite")) {
        return Boolean(
          value &&
            typeof value === "object" &&
            Object.values(value as Record<string, unknown>).some(v => 
              v !== null && v !== undefined && v !== ""
            )
        );
      }
      
      return Boolean(value);
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function groupErrorsByField(
  errors: ValidationError[]
): Record<string, string> {
  const grouped: Record<string, string> = {};

  errors.forEach((error) => {
    if (!grouped[error.field]) {
      grouped[error.field] = error.message;
    }
  });

  return grouped;
}
