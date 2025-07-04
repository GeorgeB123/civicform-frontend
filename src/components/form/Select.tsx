import { WebformField } from '@/types/webform';

interface SelectProps {
  field: WebformField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function Select({ field, value, onChange, error }: SelectProps) {
  const isRequired = field['#required'] || false;
  const title = field['#title'] || field['#admin_title'] || '';
  const options = field['#options'] || {};

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {title}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        required={isRequired}
      >
        <option value="">Select an option</option>
        {Object.entries(options).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}