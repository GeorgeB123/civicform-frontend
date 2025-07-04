import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          ReportIt Frontend
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Multi-step form system for Drupal webforms
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Form Demo
            </h2>
            <p className="text-gray-600 mb-4">
              Try out the multi-step form with example data
            </p>
            <Link 
              href="/form"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View Demo
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Dynamic Form
            </h2>
            <p className="text-gray-600 mb-4">
              Load a form by webform ID from your Drupal backend
            </p>
            <Link 
              href="/form/stolen_property"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Load Form
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <strong>Multi-step Navigation:</strong> Progress indicators and step validation
            </div>
            <div>
              <strong>Dynamic Fields:</strong> Supports all Drupal webform field types
            </div>
            <div>
              <strong>Real-time Validation:</strong> Client-side validation with error handling
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
