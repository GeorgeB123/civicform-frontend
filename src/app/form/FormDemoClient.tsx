"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MultiStepForm from "@/components/form/MultiStepForm";
import { WebformStructure, FormData as WebformData } from "@/types/webform";

// Example data for testing - replace with your actual form structure
const exampleFormStructure: WebformStructure = {
  contact_details: {
    "#type": "webform_wizard_page",
    "#title": "Contact details",
    "#open": true,
    address: {
      "#type": "webform_address",
      "#title": "Address",
      "#title_display": "",
      "#address__required": true,
      "#city__required": true,
      "#state_province__access": false,
      "#postal_code__title": "Post Code",
      "#postal_code__required": true,
      "#country__access": false,
      "#webform": "stolen_property",
      "#webform_id": "stolen_property--address",
      "#webform_key": "address",
      "#webform_parent_key": "contact_details",
      "#webform_parent_flexbox": false,
      "#webform_depth": 1,
      "#webform_children": [],
      "#webform_multiple": false,
      "#webform_composite": true,
      "#webform_parents": ["contact_details", "address"],
      "#admin_title": "Address",
      "#webform_plugin_id": "webform_address",
      "#webform_composite_elements": {
        address: {
          "#type": "textfield",
          "#title": "Address",
          "#required": true,
          "#admin_title": "Address",
          "#webform_composite_id": "stolen_property--address--address",
          "#webform_composite_key": "address__address",
          "#webform_composite_parent_key": "address",
        },
        address_2: {
          "#type": "textfield",
          "#title": "Address 2",
          "#admin_title": "Address 2",
          "#webform_composite_id": "stolen_property--address--address_2",
          "#webform_composite_key": "address__address_2",
          "#webform_composite_parent_key": "address",
        },
        city: {
          "#type": "textfield",
          "#title": "City/Town",
          "#required": true,
          "#admin_title": "City/Town",
          "#webform_composite_id": "stolen_property--address--city",
          "#webform_composite_key": "address__city",
          "#webform_composite_parent_key": "address",
        },
        postal_code: {
          "#type": "textfield",
          "#title": "Post Code",
          "#required": true,
          "#admin_title": "Post Code",
          "#webform_composite_id": "stolen_property--address--postal_code",
          "#webform_composite_key": "address__postal_code",
          "#webform_composite_parent_key": "address",
        },
      },
    },
    full_name: {
      "#type": "webform_composite_plus:full_name",
      "#title": "Full Name",
      "#title_display": "",
      "#title__options": "titles",
      "#flexbox": "1",
      "#required": true,
      "#webform": "stolen_property",
      "#webform_id": "stolen_property--full_name",
      "#webform_key": "full_name",
      "#webform_parent_key": "contact_details",
      "#webform_parent_flexbox": false,
      "#webform_depth": 1,
      "#webform_children": [],
      "#webform_multiple": false,
      "#webform_composite": true,
      "#webform_parents": ["contact_details", "full_name"],
      "#admin_title": "Full Name",
      "#webform_plugin_id": "webform_composite_plus:full_name",
      "#webform_composite_elements": {
        title: {
          "#type": "select",
          "#options": {
            mr: "Mr",
            mrs: "Mrs",
            ms: "Ms",
            dr: "Dr",
          },
          "#required": true,
          "#title": "Title",
          "#webform_composite_id": "stolen_property--full_name--title",
          "#webform_composite_key": "full_name__title",
          "#webform_composite_parent_key": "full_name",
        },
        first_name: {
          "#type": "textfield",
          "#required": true,
          "#title": "First Name",
          "#webform_composite_id": "stolen_property--full_name--first_name",
          "#webform_composite_key": "full_name__first_name",
          "#webform_composite_parent_key": "full_name",
        },
        last_name: {
          "#type": "textfield",
          "#required": true,
          "#title": "Last Name",
          "#webform_composite_id": "stolen_property--full_name--last_name",
          "#webform_composite_key": "full_name__last_name",
          "#webform_composite_parent_key": "full_name",
        },
      },
    },
    email: {
      "#type": "webform_email_confirm",
      "#title": "Email",
      "#required": true,
      "#confirm__title": "Email confirm",
      "#webform": "stolen_property",
      "#webform_id": "stolen_property--email",
      "#webform_key": "email",
      "#webform_parent_key": "contact_details",
      "#webform_parent_flexbox": false,
      "#webform_depth": 1,
      "#webform_children": [],
      "#webform_multiple": false,
      "#webform_composite": false,
      "#webform_parents": ["contact_details", "email"],
      "#admin_title": "Email",
      "#webform_plugin_id": "webform_email_confirm",
    },
  },
  when_did_it_happen: {
    "#type": "webform_wizard_page",
    "#title": "When did it happen",
    date: {
      "#type": "datelist",
      "#title": "Date",
      "#required": true,
      "#webform": "stolen_property",
      "#webform_id": "stolen_property--date",
      "#webform_key": "date",
      "#webform_parent_key": "when_did_it_happen",
      "#webform_parent_flexbox": false,
      "#webform_depth": 1,
      "#webform_children": [],
      "#webform_multiple": false,
      "#webform_composite": false,
      "#webform_parents": ["when_did_it_happen", "date"],
      "#admin_title": "Date",
      "#webform_plugin_id": "datelist",
    },
  },
  what_was_stolen: {
    "#type": "webform_wizard_page",
    "#title": "What was stolen",
    what_was_taken: {
      "#type": "textarea",
      "#title": "What was taken",
      "#required": true,
      "#webform": "stolen_property",
      "#webform_id": "stolen_property--what_was_taken",
      "#webform_key": "what_was_taken",
      "#webform_parent_key": "what_was_stolen",
      "#webform_parent_flexbox": false,
      "#webform_depth": 1,
      "#webform_children": [],
      "#webform_multiple": false,
      "#webform_composite": false,
      "#webform_parents": ["what_was_stolen", "what_was_taken"],
      "#admin_title": "What was taken",
      "#webform_plugin_id": "textarea",
    },
  },
};

interface FormDemoClientProps {
  turnstileSiteKey: string;
}

export default function FormDemoClient({ turnstileSiteKey }: FormDemoClientProps) {
  const router = useRouter();
  const [submissionResult, setSubmissionResult] = useState<WebformData | null>(
    null
  );

  const handleFormSubmit = async (formData: WebformData) => {
    console.log("Form submitted with data:", formData);

    // Simulate API submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setSubmissionResult(formData);
  };

  if (submissionResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Form Submitted Successfully!
              </h1>
              <p className="text-gray-600">Thank you for your submission.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">
                Submitted Data:
              </h3>
              <pre className="text-sm text-gray-600 overflow-auto">
                {JSON.stringify(submissionResult, null, 2)}
              </pre>
            </div>

            <div className="text-center">
              <button
                onClick={() => setSubmissionResult(null)}
                className="px-6 py-2 bg-[#2C53CD] text-white rounded-md hover:bg-blue-700 transition-colors mr-4"
              >
                Submit Another Form
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Multi-Step Form Demo
          </h1>
          <p className="text-gray-600">
            This is a demonstration of the multi-step form component with your
            Drupal webform structure.
          </p>
        </div>

        <MultiStepForm
          webformStructure={exampleFormStructure}
          onSubmit={handleFormSubmit}
          turnstileSiteKey={turnstileSiteKey}
          onStepChange={(current, total) => {
            console.log(`Step ${current} of ${total}`);
          }}
        />
      </div>
    </div>
  );
}