import { makeAutoObservable } from 'mobx';
import { WebformStructure, WebformField } from '@/types/webform';

export interface FormFieldValue {
  value: string | number | boolean | object | File[] | null;
  isValid: boolean;
  errors: string[];
}

export interface FormStepData {
  [fieldKey: string]: FormFieldValue;
}

export interface FormData {
  [stepKey: string]: FormStepData;
}

class FormStore {
  formData: FormData = {};
  currentStep: number = 0;
  formStructure: WebformStructure | null = null;
  isSubmitting: boolean = false;
  submitError: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  initializeForm(structure: WebformStructure) {
    this.formStructure = structure;
    
    // Initialize form data structure based on webform elements
    const initialData: FormData = {};
    
    Object.entries(structure).forEach(([stepKey, stepElement]) => {
      if (stepElement && typeof stepElement === 'object' && stepElement['#type'] === 'webform_wizard_page') {
        initialData[stepKey] = {};
        
        // Initialize all fields in this step
        this.initializeStepFields(stepElement, initialData[stepKey]);
      }
    });

    // Merge with existing data to preserve user input
    Object.keys(initialData).forEach(stepKey => {
      if (!this.formData[stepKey]) {
        this.formData[stepKey] = initialData[stepKey];
      } else {
        // Add any new fields that weren't in the stored data
        Object.keys(initialData[stepKey]).forEach(fieldKey => {
          if (!this.formData[stepKey][fieldKey]) {
            this.formData[stepKey][fieldKey] = initialData[stepKey][fieldKey];
          }
        });
      }
    });


  }

  private initializeStepFields(element: WebformField, stepData: FormStepData) {
    Object.entries(element).forEach(([key, field]) => {
      if (typeof field === 'object' && field !== null && field && '#type' in field) {
        const webformField = field as WebformField;
        const fieldKey = webformField['#webform_key'] || key;
        
        // Initialize field with default value
        stepData[fieldKey] = {
          value: this.getDefaultValue(webformField),
          isValid: !webformField['#required'],
          errors: []
        };

        // Handle composite fields (like address, full name)
        if (webformField['#webform_composite'] && webformField['#webform_composite_elements']) {
          const compositeValue: Record<string, string | number | boolean | object | File[] | null> = {};
          Object.entries(webformField['#webform_composite_elements']).forEach(([subKey, subField]) => {
            if (subField) {
              compositeValue[subKey] = this.getDefaultValue(subField);
            }
          });
          stepData[fieldKey].value = compositeValue;
        }
      }
    });
  }

  private getDefaultValue(field: WebformField): string | number | boolean | object | File[] | null {
    const fieldType = field['#type'];
    
    switch (fieldType) {
      case 'checkbox':
      case 'checkboxes':
        return false;
      case 'select':
      case 'radios':
        return field['#default_value'] || '';
      case 'date':
        return '';
      case 'email':
      case 'textfield':
      case 'textarea':
        return field['#default_value'] || '';
      case 'managed_file':
        return null;
      case 'webform_address':
      case 'webform_name':
        return {};
      default:
        return field['#default_value'] || '';
    }
  }

  setFieldValue(stepKey: string, fieldKey: string, value: string | number | boolean | object | File[]) {
    if (!this.formData[stepKey]) {
      this.formData[stepKey] = {};
    }
    
    if (!this.formData[stepKey][fieldKey]) {
      this.formData[stepKey][fieldKey] = {
        value: '',
        isValid: true,
        errors: []
      };
    }

    this.formData[stepKey][fieldKey].value = value;
    this.validateField(stepKey, fieldKey);

  }

  setFieldError(stepKey: string, fieldKey: string, errors: string[]) {
    if (!this.formData[stepKey]?.[fieldKey]) return;
    
    this.formData[stepKey][fieldKey].errors = errors;
    this.formData[stepKey][fieldKey].isValid = errors.length === 0;

  }

  getFieldValue(stepKey: string, fieldKey: string): string | number | boolean | object | File[] | null {
    return this.formData[stepKey]?.[fieldKey]?.value || '';
  }

  getFieldErrors(stepKey: string, fieldKey: string): string[] {
    return this.formData[stepKey]?.[fieldKey]?.errors || [];
  }

  isFieldValid(stepKey: string, fieldKey: string): boolean {
    return this.formData[stepKey]?.[fieldKey]?.isValid ?? true;
  }

  private validateField(stepKey: string, fieldKey: string) {
    if (!this.formStructure || !this.formData[stepKey]?.[fieldKey]) return;

    const field = this.findFieldInStructure(fieldKey);
    if (!field) return;

    const fieldData = this.formData[stepKey][fieldKey];
    const errors: string[] = [];

    // Required field validation
    if (field['#required'] && this.isValueEmpty(fieldData.value)) {
      errors.push(`${field['#title'] || fieldKey} is required`);
    }

    // Email validation
    if (field['#type'] === 'email' && fieldData.value && typeof fieldData.value === 'string' && !this.isValidEmail(fieldData.value)) {
      errors.push('Please enter a valid email address');
    }

    fieldData.errors = errors;
    fieldData.isValid = errors.length === 0;
  }

  private findFieldInStructure(fieldKey: string): WebformField | null {
    if (!this.formStructure) return null;

    for (const stepElement of Object.values(this.formStructure)) {
      if (stepElement && typeof stepElement === 'object') {
        for (const [key, field] of Object.entries(stepElement)) {
          if (typeof field === 'object' && field !== null && field && '#type' in field) {
            const webformField = field as WebformField;
            if (webformField['#webform_key'] === fieldKey || key === fieldKey) {
              return webformField;
            }
          }
        }
      }
    }
    return null;
  }

  private isValueEmpty(value: string | number | boolean | object | File[] | null): boolean {
    if (value === null || value === undefined || value === '') return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length === 0;
    return false;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isStepValid(stepKey: string): boolean {
    const stepData = this.formData[stepKey];
    if (!stepData) return true;

    return Object.values(stepData).every(field => field.isValid);
  }

  setCurrentStep(step: number) {
    this.currentStep = step;

  }

  nextStep() {
    if (this.formStructure) {
      const totalSteps = Object.keys(this.formStructure).length;
      if (this.currentStep < totalSteps - 1) {
        this.currentStep++;
    
      }
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
  
    }
  }

  getAllFormData(): Record<string, string | number | boolean | object | File[] | undefined> {
    const flatData: Record<string, string | number | boolean | object | File[] | undefined> = {};
    
    Object.entries(this.formData).forEach(([, stepData]) => {
      Object.entries(stepData).forEach(([fieldKey, fieldData]) => {
        flatData[fieldKey] = fieldData.value || undefined;
      });
    });

    return flatData;
  }

  setSubmitting(isSubmitting: boolean) {
    this.isSubmitting = isSubmitting;
  }

  setSubmitError(error: string | null) {
    this.submitError = error;
  }

  clearForm() {
    this.formData = {};
    this.currentStep = 0;
    this.formStructure = null;
    this.isSubmitting = false;
    this.submitError = null;

  }


}

export default FormStore;