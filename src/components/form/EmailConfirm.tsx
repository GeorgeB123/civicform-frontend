import { WebformField } from '@/types/webform';

interface EmailConfirmProps {
  field: WebformField;
  value: { email: string; email_confirm: string };
  onChange: (value: { email: string; email_confirm: string }) => void;
  error?: string;
}

export default function EmailConfirm({ field, value, onChange, error }: EmailConfirmProps) {
  const isRequired = field['#required'] || false;
  const title = field['#title'] || field['#admin_title'] || '';
  const confirmTitle = field['#confirm__title'] || 'Confirm Email';

  const handleEmailChange = (email: string) => {
    onChange({ ...value, email });
  };

  const handleConfirmChange = (email_confirm: string) => {
    onChange({ ...value, email_confirm });
  };

  const emailsMatch = value.email === value.email_confirm;
  const showConfirmError = value.email_confirm && !emailsMatch;

  return (
    <div className="mb-4">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {title}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="email"
          value={value.email || ''}
          onChange={(e) => handleEmailChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          required={isRequired}
          placeholder="Enter your email"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {confirmTitle}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="email"
          value={value.email_confirm || ''}
          onChange={(e) => handleConfirmChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            showConfirmError ? 'border-red-500' : 'border-gray-300'
          }`}
          required={isRequired}
          placeholder="Confirm your email"
        />
        {showConfirmError && (
          <p className="mt-1 text-sm text-red-600">Emails do not match</p>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}