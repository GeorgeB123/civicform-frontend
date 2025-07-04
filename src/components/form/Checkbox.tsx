import { WebformField } from '@/types/webform';

interface CheckboxProps {
  field: WebformField;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
}

export default function Checkbox({ field, value, onChange, error }: CheckboxProps) {
  const isRequired = field['#required'] || false;
  const title = field['#title'] || field['#admin_title'] || '';

  return (
    <div className="mb-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => onChange(e.target.checked)}
          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
            error ? 'border-red-500' : ''
          }`}
          required={isRequired}
        />
        <label className="ml-2 block text-sm text-gray-700">
          {title}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}