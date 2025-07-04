import { WebformField } from '@/types/webform';

interface TextAreaProps {
  field: WebformField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function TextArea({ field, value, onChange, error }: TextAreaProps) {
  const isRequired = field['#required'] || false;
  const title = field['#title'] || field['#admin_title'] || '';

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {title}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        required={isRequired}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}