import { WebformField, AddressData } from '@/types/webform';
import TextField from './TextField';
import Select from './Select';

interface AddressFieldProps {
  field: WebformField;
  value: AddressData;
  onChange: (value: AddressData) => void;
  errors: Record<string, string>;
}

export default function AddressField({ field, value, onChange, errors }: AddressFieldProps) {
  const title = field['#title'] || field['#admin_title'] || '';
  const compositeElements = field['#webform_composite_elements'] || {};

  const handleFieldChange = (fieldName: keyof AddressData, fieldValue: string) => {
    onChange({
      ...value,
      [fieldName]: fieldValue,
    });
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Address Line 1 */}
        {compositeElements.address && (
          <TextField
            field={compositeElements.address}
            value={value.address || ''}
            onChange={(val) => handleFieldChange('address', val)}
            error={errors.address}
          />
        )}

        {/* Address Line 2 */}
        {compositeElements.address_2 && (
          <TextField
            field={compositeElements.address_2}
            value={value.address_2 || ''}
            onChange={(val) => handleFieldChange('address_2', val)}
            error={errors.address_2}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City */}
          {compositeElements.city && (
            <TextField
              field={compositeElements.city}
              value={value.city || ''}
              onChange={(val) => handleFieldChange('city', val)}
              error={errors.city}
            />
          )}

          {/* Postal Code */}
          {compositeElements.postal_code && (
            <TextField
              field={compositeElements.postal_code}
              value={value.postal_code || ''}
              onChange={(val) => handleFieldChange('postal_code', val)}
              error={errors.postal_code}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* State/Province */}
          {compositeElements.state_province && compositeElements.state_province['#access'] !== false && (
            <Select
              field={compositeElements.state_province}
              value={value.state_province || ''}
              onChange={(val) => handleFieldChange('state_province', val)}
              error={errors.state_province}
            />
          )}

          {/* Country */}
          {compositeElements.country && compositeElements.country['#access'] !== false && (
            <Select
              field={compositeElements.country}
              value={value.country || ''}
              onChange={(val) => handleFieldChange('country', val)}
              error={errors.country}
            />
          )}
        </div>
      </div>
    </div>
  );
}