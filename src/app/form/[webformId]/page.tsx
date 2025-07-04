'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MultiStepForm from '@/components/form/MultiStepForm';
import { WebformService } from '@/services/webformService';
import { WebformStructure, FormData as WebformData } from '@/types/webform';

export default function WebformPage() {
  const params = useParams();
  const router = useRouter();
  const webformId = params.webformId as string;
  
  const [webformStructure, setWebformStructure] = useState<WebformStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Initialize the webform service
  const webformService = new WebformService(process.env.NEXT_PUBLIC_DRUPAL_URL || '');

  useEffect(() => {
    if (webformId) {
      loadFormStructure();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webformId]);

  const loadFormStructure = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const structure = await webformService.fetchFormStructure(webformId);
      setWebformStructure(structure);
    } catch (err) {
      console.error('Error loading form structure:', err);
      setError(err instanceof Error ? err.message : 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData: WebformData) => {
    try {
      // Handle file uploads first if there are any files
      const processedData = { ...formData };
      
      // Process file uploads
      for (const [key, value] of Object.entries(formData)) {
        if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
          try {
            const uploadResults = await webformService.uploadFiles(value);
            // Replace file objects with file IDs/references
            processedData[key] = uploadResults.map(result => (result as { fid?: string; id?: string }).fid || (result as { fid?: string; id?: string }).id);
          } catch (uploadError) {
            console.error(`File upload failed for field ${key}:`, uploadError);
            throw new Error(`Failed to upload files for ${key}`);
          }
        }
      }

      // Submit the form
      const result = await webformService.submitForm(webformId, processedData);
      
      console.log('Form submitted successfully:', result);
      setSubmitted(true);
    } catch (err) {
      console.error('Form submission error:', err);
      throw err; // Re-throw to let the form component handle the error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold text-lg mb-2">Error Loading Form</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadFormStructure}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-green-800 font-semibold text-lg mb-2">Form Submitted Successfully!</h2>
            <p className="text-green-600 mb-4">Thank you for your submission. We have received your information.</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!webformStructure) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No form structure found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <MultiStepForm
          webformStructure={webformStructure}
          onSubmit={handleFormSubmit}
          onStepChange={(current, total) => {
            // You can use this to update URL or track analytics
            console.log(`Step ${current} of ${total}`);
          }}
        />
      </div>
    </div>
  );
}