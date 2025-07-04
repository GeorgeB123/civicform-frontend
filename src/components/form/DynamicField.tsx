import { WebformField, AddressData, FullNameData } from '@/types/webform';
import TextField from './TextField';
import TextArea from './TextArea';
import Select from './Select';
import DateList from './DateList';
import Checkbox from './Checkbox';
import FileUpload from './FileUpload';
import EmailConfirm from './EmailConfirm';
import AddressField from './AddressField';
import FullNameField from './FullNameField';

interface DynamicFieldProps {
  field: WebformField;
  fieldKey: string;
  value: unknown;
  onChange: (value: unknown) => void;
  errors: Record<string, string>;
}

export default function DynamicField({ field, fieldKey, value, onChange, errors }: DynamicFieldProps) {
  const fieldType = field['#type'];
  const error = errors[fieldKey];

  // Skip fields with no access
  if (field['#access'] === false) {
    return null;
  }

  switch (fieldType) {
    case 'textfield':
      return (
        <TextField
          field={field}
          value={(value as string) || ''}
          onChange={onChange}
          error={error}
        />
      );

    case 'textarea':
      return (
        <TextArea
          field={field}
          value={(value as string) || ''}
          onChange={onChange}
          error={error}
        />
      );

    case 'select':
      return (
        <Select
          field={field}
          value={(value as string) || ''}
          onChange={onChange}
          error={error}
        />
      );

    case 'datelist':
      return (
        <DateList
          field={field}
          value={(value as string) || ''}
          onChange={onChange}
          error={error}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          field={field}
          value={(value as boolean) || false}
          onChange={onChange}
          error={error}
        />
      );

    case 'managed_file':
      return (
        <FileUpload
          field={field}
          value={(value as File[]) || []}
          onChange={onChange}
          error={error}
        />
      );

    case 'webform_email_confirm':
      return (
        <EmailConfirm
          field={field}
          value={(value as { email: string; email_confirm: string }) || { email: '', email_confirm: '' }}
          onChange={onChange}
          error={error}
        />
      );

    case 'webform_address':
      return (
        <AddressField
          field={field}
          value={(value as AddressData) || { address: '', city: '', postal_code: '' }}
          onChange={onChange}
          errors={errors}
        />
      );

    case 'webform_composite_plus:full_name':
      return (
        <FullNameField
          field={field}
          value={(value as FullNameData) || { title: '', first_name: '', last_name: '' }}
          onChange={onChange}
          errors={errors}
        />
      );

    case 'webform_wizard_page':
      // Wizard pages are handled by the main form component
      return null;

    default:
      console.warn(`Unsupported field type: ${fieldType}`);
      return (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Unsupported field type: <code>{fieldType}</code>
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Field key: {fieldKey}
          </p>
        </div>
      );
  }
}