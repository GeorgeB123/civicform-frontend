"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MultiStepForm from "@/components/form/MultiStepForm";
import Header from "@/components/Header";
import { submitWebform } from "@/app/actions/webform";
import { WebformStructure, FormData as WebformData } from "@/types/webform";

interface WebformPageClientProps {
  webformId: string;
  webformStructure: WebformStructure;
  webformTitle: string;
}

export default function WebformPageClient({
  webformId,
  webformStructure,
  webformTitle,
}: WebformPageClientProps) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState<unknown>(null);
  console.log(webformStructure);
  const serializeFormData = (data: WebformData): WebformData => {
    // Deep clone and serialize the data to remove MobX symbols
    return JSON.parse(JSON.stringify(data));
  };

  const handleFormSubmit = async (formData: WebformData) => {
    try {
      // Serialize the form data to remove MobX symbols
      const serializedData = serializeFormData(formData);
      const result = await submitWebform(webformId, serializedData);

      if (result.success) {
        console.log("Form submitted successfully:", result.data);
        setSubmissionData(result.data);
        setSubmitted(true);
      } else {
        throw new Error(result.error || "Form submission failed");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      throw err; // Re-throw to let the form component handle the error
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-2xl mx-4">
          <div className="bg-white border border-green-200 rounded-lg p-8 shadow-sm">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-green-800 font-bold text-2xl mb-4">
              Form Submitted Successfully!
            </h2>
            <p className="text-green-600 mb-6">
              Thank you for your submission. We have received your information
              and will process it accordingly.
            </p>

            {process.env.NODE_ENV === "development" && submissionData ? (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-gray-900 mb-2">
                  Submission Details (Development Only):
                </h3>
                <pre className="text-sm text-gray-600 overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(submissionData, null, 2)}
                </pre>
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSubmissionData(null);
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Submit Another Form
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={webformTitle} backLink="/" backLinkText="Home" />
      <div className="py-8">
        <div className="container mx-auto px-4">
          <MultiStepForm
            webformStructure={webformStructure}
            onSubmit={handleFormSubmit}
            onStepChange={(current, total) => {
              // sendGTMEvent here to track usage
              console.log(`Step ${current} of ${total}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
