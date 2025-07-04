import { FormStepProps } from '@/types/webform';
import DynamicField from './DynamicField';
import { groupErrorsByField } from '@/utils/formValidation';

export default function FormStep({ step, data, onChange, errors }: FormStepProps) {
  const errorMap = groupErrorsByField(errors);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
      </div>

      <div className="space-y-4">
        {step.fields.map(field => {
          const fieldKey = field['#webform_key'];
          if (!fieldKey) return null;

          return (
            <DynamicField
              key={fieldKey}
              field={field}
              fieldKey={fieldKey}
              value={data[fieldKey]}
              onChange={(value) => onChange(fieldKey, value as string | number | boolean | object | File[])}
              errors={errorMap}
            />
          );
        })}
      </div>
    </div>
  );
}