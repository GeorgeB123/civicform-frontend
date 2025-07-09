"use client";

import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  WebformStructure,
  WebformField,
  FormData as WebformData,
  ValidationError,
  StepData,
  WebformApiResponse,
} from "@/types/webform";
import { validateStep } from "@/utils/formValidation";
import { useFormStore } from "@/stores/StoreProvider";
import FormStep from "./FormStep";
import TriageQuestion from "./TriageQuestion";

interface MultiStepFormProps {
  webformStructure: WebformStructure;
  webformData?: WebformApiResponse;
  onSubmit: (data: WebformData) => Promise<void>;
  onStepChange?: (currentStep: number, totalSteps: number) => void;
}

const MultiStepForm = observer(function MultiStepForm({
  webformStructure,
  webformData,
  onSubmit,
  onStepChange,
}: MultiStepFormProps) {
  const formStore = useFormStore();
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [steps, setSteps] = useState<StepData[]>([]);
  const [triageAnswers, setTriageAnswers] = useState<
    Record<string, string | number | boolean>
  >({});
  const [showTriageQuestions, setShowTriageQuestions] = useState(false);

  // Initialize form store and parse webform structure into steps
  useEffect(() => {
    formStore.initializeForm(webformStructure);

    // Check if we need to show triage questions first
    const hasTriage =
      webformData?.triage &&
      Object.keys(webformData.triage.questions).length > 0;
    setShowTriageQuestions(hasTriage || false);

    const parsedSteps = parseWebformStructure(webformStructure);
    setSteps(parsedSteps);
  }, [webformStructure, webformData, formStore]);

  // Notify parent of step changes
  useEffect(() => {
    if (onStepChange && steps.length > 0) {
      onStepChange(formStore.currentStep + 1, steps.length);
    }
  }, [formStore.currentStep, steps.length, onStepChange]);

  const parseWebformStructure = (structure: WebformStructure): StepData[] => {
    const stepList: StepData[] = [];
    const regularFields: (WebformField & { "#webform_key": string })[] = [];

    Object.entries(structure).forEach(([key, field]) => {
      if (field["#type"] === "webform_wizard_page") {
        // Extract fields from wizard page
        const pageFields: (WebformField & { "#webform_key": string })[] = [];
        Object.entries(field).forEach(([subKey, subField]) => {
          if (
            typeof subField === "object" &&
            subField &&
            "#type" in subField &&
            subKey !== "#type"
          ) {
            pageFields.push({
              ...(subField as WebformField),
              "#webform_key": subKey,
            });
          }
        });

        stepList.push({
          id: key,
          title: field["#title"] || field["#admin_title"] || key,
          fields: pageFields,
        });
      } else if (field["#type"] && field["#type"] !== "webform_wizard_page") {
        // Regular field not in a wizard page
        regularFields.push({ ...field, "#webform_key": key });
      }
    });

    // If there are regular fields not in wizard pages, create a step for them
    if (regularFields.length > 0) {
      stepList.push({
        id: "additional_fields",
        title: "Additional Information",
        fields: regularFields,
      });
    }

    return stepList;
  };

  const handleFieldChange = (
    fieldKey: string,
    value: string | number | boolean | object | File[]
  ) => {
    const currentStepKey = steps[formStore.currentStep]?.id;
    if (currentStepKey) {
      formStore.setFieldValue(currentStepKey, fieldKey, value);
    }

    // Clear errors for this field
    setErrors((prev) =>
      prev.filter((error) => !error.field.startsWith(fieldKey))
    );
  };

  const handleTriageAnswer = (questionId: string, value: string) => {
    setTriageAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleTriageComplete = () => {
    setShowTriageQuestions(false);
  };

  const validateCurrentStep = (): boolean => {
    if (steps.length === 0) return false;

    const currentStepData = steps[formStore.currentStep];
    if (!currentStepData) return false;

    // Create a field map for validation
    const fieldMap: Record<string, WebformField> = {};
    currentStepData.fields.forEach((field) => {
      const key = field["#webform_key"];
      if (key) {
        fieldMap[key] = field;
      }
    });

    const formData = formStore.getAllFormData();
    const stepErrors = validateStep(fieldMap, formData, triageAnswers);
    setErrors(stepErrors);

    return stepErrors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      formStore.nextStep();
    }
  };

  const handlePrevious = () => {
    formStore.previousStep();
    setErrors([]); // Clear errors when going back
  };

  const goToStep = (stepIndex: number) => {
    // Only allow navigation to previous steps or current step
    if (stepIndex <= formStore.currentStep) {
      formStore.setCurrentStep(stepIndex);
      setErrors([]); // Clear errors when jumping to a step
    }
  };

  const handleSubmit = async () => {
    // Validate all steps before submission
    let allValid = true;
    const allErrors: ValidationError[] = [];
    const formData = formStore.getAllFormData();

    for (let i = 0; i < steps.length; i++) {
      const stepData = steps[i];
      const fieldMap: Record<string, WebformField> = {};

      stepData.fields.forEach((field) => {
        const key = field["#webform_key"];
        if (key) {
          fieldMap[key] = field;
        }
      });

      const stepErrors = validateStep(fieldMap, formData, triageAnswers);
      if (stepErrors.length > 0) {
        allValid = false;
        allErrors.push(...stepErrors);
      }
    }

    if (!allValid) {
      setErrors(allErrors);
      // Go to first step with errors
      const firstErrorStep = steps.findIndex((step) =>
        step.fields.some((field) =>
          allErrors.some((error) =>
            error.field.startsWith(field["#webform_key"] || "")
          )
        )
      );
      if (firstErrorStep !== -1) {
        formStore.setCurrentStep(firstErrorStep);
      }
      return;
    }

    formStore.setSubmitting(true);
    try {
      await onSubmit(formData);
      formStore.clearForm(); // Clear form data after successful submission
    } catch (error) {
      console.error("Form submission error:", error);
      formStore.setSubmitError(
        error instanceof Error ? error.message : "Submission failed"
      );
    } finally {
      formStore.setSubmitting(false);
    }
  };

  if (steps.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  // Show triage questions first if needed
  if (showTriageQuestions && webformData?.triage) {
    const triageQuestions = Object.entries(webformData.triage.questions);
    const allQuestionsAnswered = triageQuestions.every(
      ([questionId]) =>
        triageAnswers[questionId] !== undefined &&
        triageAnswers[questionId] !== ""
    );

    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-2xl font-bold text-[#00164b] mb-6">
            Before we begin, please answer these questions:
          </h2>

          <div className="space-y-6">
            {triageQuestions.map(([questionId, question]) => (
              <TriageQuestion
                key={questionId}
                question={question}
                value={(triageAnswers[questionId] as string) || ""}
                onChange={(value) => handleTriageAnswer(questionId, value)}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleTriageComplete}
              disabled={!allQuestionsAnswered}
              className={`px-6 py-3 font-medium transition-colors ${
                allQuestionsAnswered
                  ? "bg-[#2C53CD] text-white hover:bg-blue-700 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Continue to Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStepData = steps[formStore.currentStep];
  const isLastStep = formStore.currentStep === steps.length - 1;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex w-80 bg-white shadow flex-col self-start sticky top-20 max-h-screen">
        <div className="p-6 border-b border-gray-200">
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <span>
              Step {formStore.currentStep + 1} of {steps.length}
            </span>
            <span className="ml-2 text-blue-600">
              ({Math.round(((formStore.currentStep + 1) / steps.length) * 100)}%
              complete)
            </span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <nav className="space-y-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                disabled={index > formStore.currentStep}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                  index === formStore.currentStep
                    ? "bg-blue-50 border-2 border-blue-200 text-blue-900"
                    : index < formStore.currentStep
                    ? "bg-green-50 border-2 border-green-200 text-green-900 hover:bg-green-100"
                    : "bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === formStore.currentStep
                        ? "bg-[#2C53CD] text-white"
                        : index < formStore.currentStep
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {index < formStore.currentStep ? "✓" : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium cursor-pointer">
                      {step.title}
                    </div>
                    {index <= formStore.currentStep && (
                      <div className="text-xs text-gray-500 mt-1">
                        {index === formStore.currentStep
                          ? "Current step"
                          : index < formStore.currentStep
                          ? "Completed"
                          : "Not started"}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#2C53CD] h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((formStore.currentStep + 1) / steps.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Mobile Top Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white z-10 shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.1)]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">
              {formStore.currentStep + 1} of {steps.length}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-[#2C53CD] h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((formStore.currentStep + 1) / steps.length) * 100}%`,
              }}
            ></div>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                disabled={index > formStore.currentStep}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  index === formStore.currentStep
                    ? "bg-[#2C53CD] text-white"
                    : index < formStore.currentStep
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center space-x-1">
                  <span className="w-4 h-4 rounded-full bg-current bg-opacity-20 flex items-center justify-center text-[10px]">
                    {index < formStore.currentStep ? "✓" : index + 1}
                  </span>
                  <span className="truncate max-w-20">{step.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:px-8">
        <div className="max-w-4xl mx-auto p-4 lg:p-0">
          {/* Current Step Title */}
          {/* <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h1>
            <p className="text-gray-600">
              Step {formStore.currentStep + 1} of {steps.length}
            </p>
          </div> */}
          {/* Error summary */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-red-800 font-medium mb-2">
                Please fix the following errors:
              </h3>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error.message}</li>
                ))}
              </ul>
            </div>
          )}
          {/* Form content */}
          <div className="bg-white shadow p-6 lg:p-8 mb-6">
            <FormStep
              step={currentStepData}
              data={formStore.getAllFormData()}
              onChange={handleFieldChange}
              errors={errors}
              triageAnswers={triageAnswers}
            />
          </div>
          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={formStore.currentStep === 0}
              className={`px-6 py-3 cursor-pointer font-medium transition-colors ${
                formStore.currentStep === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            {isLastStep ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={formStore.isSubmitting}
                className="px-8 py-3 bg-green-600 text-white cursor-pointer font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {formStore.isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit"
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-[#2C53CD] text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Next
              </button>
            )}
          </div>
          <div className="lg:hidden h-23" /> {/* Spacer for mobile nav */}
        </div>
      </div>
    </div>
  );
});

export default MultiStepForm;
