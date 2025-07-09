import { WebformField, CompositeData } from '@/types/webform';
import TextField from './TextField';
import TextArea from './TextArea';
import Select from './Select';
import DateList from './DateList';
import Checkbox from './Checkbox';

interface GenericCompositeFieldProps {
  field: WebformField;
  value: CompositeData;
  onChange: (value: CompositeData) => void;
  errors: Record<string, string>;
}

export default function GenericCompositeField({
  field,
  value,
  onChange,
  errors,
}: GenericCompositeFieldProps) {
  const title = field['#title'] || field['#admin_title'] || '';
  const compositeElements = field['#webform_composite_elements'] || {};

  const handleFieldChange = (fieldName: string, fieldValue: string | number | boolean) => {
    onChange({
      ...value,
      [fieldName]: fieldValue,
    });
  };

  const renderCompositeElement = (elementKey: string, element: WebformField) => {
    const elementType = element['#type'];
    const elementValue = value[elementKey] || '';
    const elementError = errors[`${field['#webform_key']}.${elementKey}`] || errors[elementKey];

    // Skip fields with no access
    if (element['#access'] === false) {
      return null;
    }

    switch (elementType) {
      case 'textfield':
        return (
          <TextField
            key={elementKey}
            field={element}
            value={elementValue as string}
            onChange={(val) => handleFieldChange(elementKey, val)}
            error={elementError}
          />
        );

      case 'textarea':
        return (
          <TextArea
            key={elementKey}
            field={element}
            value={elementValue as string}
            onChange={(val) => handleFieldChange(elementKey, val)}
            error={elementError}
          />
        );

      case 'select':
        return (
          <Select
            key={elementKey}
            field={element}
            value={elementValue as string}
            onChange={(val) => handleFieldChange(elementKey, val)}
            error={elementError}
          />
        );

      case 'datelist':
        return (
          <DateList
            key={elementKey}
            field={element}
            value={elementValue as string}
            onChange={(val) => handleFieldChange(elementKey, val)}
            error={elementError}
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            key={elementKey}
            field={element}
            value={elementValue as boolean}
            onChange={(val) => handleFieldChange(elementKey, val)}
            error={elementError}
          />
        );

      default:
        console.warn(`Unsupported composite element type: ${elementType}`);
        return (
          <div key={elementKey} className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Unsupported composite element type: <code>{elementType}</code>
            </p>
            <p className="text-xs text-yellow-600 mt-1">Element key: {elementKey}</p>
          </div>
        );
    }
  };

  // Determine layout based on number of elements and their types
  const elementEntries = Object.entries(compositeElements);
  const shouldUseGrid = elementEntries.length > 1;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      
      <div className={shouldUseGrid ? "grid grid-cols-1 gap-4" : "space-y-4"}>
        {elementEntries.map(([elementKey, element]) => {
          if (!element) return null;
          
          // For certain field combinations, use a responsive grid
          if (shouldUseGrid && elementEntries.length <= 3) {
            return (
              <div key={elementKey} className="w-full">
                {renderCompositeElement(elementKey, element)}
              </div>
            );
          }
          
          return renderCompositeElement(elementKey, element);
        })}
      </div>
    </div>
  );
}