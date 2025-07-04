import { WebformField, FullNameData } from '@/types/webform';
import TextField from './TextField';
import Select from './Select';

interface FullNameFieldProps {
  field: WebformField;
  value: FullNameData;
  onChange: (value: FullNameData) => void;
  errors: Record<string, string>;
}

export default function FullNameField({ field, value, onChange, errors }: FullNameFieldProps) {
  const title = field['#title'] || field['#admin_title'] || '';
  const compositeElements = field['#webform_composite_elements'] || {};

  const handleFieldChange = (fieldName: keyof FullNameData, fieldValue: string) => {
    onChange({
      ...value,
      [fieldName]: fieldValue,
    });
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Title */}
        {compositeElements.title && (
          <div className="w-full md:w-1/3">
            <Select
              field={compositeElements.title}
              value={value.title || ''}
              onChange={(val) => handleFieldChange('title', val)}
              error={errors.title}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          {compositeElements.first_name && (
            <TextField
              field={compositeElements.first_name}
              value={value.first_name || ''}
              onChange={(val) => handleFieldChange('first_name', val)}
              error={errors.first_name}
            />
          )}

          {/* Last Name */}
          {compositeElements.last_name && (
            <TextField
              field={compositeElements.last_name}
              value={value.last_name || ''}
              onChange={(val) => handleFieldChange('last_name', val)}
              error={errors.last_name}
            />
          )}
        </div>
      </div>
    </div>
  );
}