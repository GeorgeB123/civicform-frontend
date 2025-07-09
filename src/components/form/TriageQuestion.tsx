import { TriageQuestion as TriageQuestionType } from '@/types/webform';
import Select from './Select';
import { WebformField } from '@/types/webform';

interface TriageQuestionProps {
  question: TriageQuestionType;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function TriageQuestion({
  question,
  value,
  onChange,
  error,
}: TriageQuestionProps) {
  // Convert triage question to WebformField format for consistency
  const webformField: WebformField = {
    '#type': question.type,
    '#title': question.title,
    '#description': question.description,
    '#required': question.required === 1,
    '#options': question.options,
    '#admin_title': question.title,
  };

  return (
    <div className="mb-6">
      {question.description && (
        <p className="text-sm text-gray-600 mb-2">{question.description}</p>
      )}
      
      <Select
        field={webformField}
        value={value}
        onChange={onChange}
        error={error}
      />
    </div>
  );
}