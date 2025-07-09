import { FormData, WebformField } from '@/types/webform';

export interface TriageCondition {
  type: 'show_when' | 'hide_when';
  conditions: Record<string, string | number | boolean>;
}

export function parseTriageConditions(conditionString: string): TriageCondition | null {
  if (!conditionString) return null;

  try {
    // Parse YAML-like condition string
    // Example: "show_when:\n  what_did_you_have_stolen: \"car\""
    const lines = conditionString.trim().split('\n');
    const firstLine = lines[0].trim();
    
    if (!firstLine.includes(':')) return null;
    
    const [type] = firstLine.split(':');
    const conditionType = type.trim() as 'show_when' | 'hide_when';
    
    const conditions: Record<string, string | number | boolean> = {};
    
    // Parse condition lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || !line.includes(':')) continue;
      
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) {
        // Remove quotes and parse value
        let parsedValue: string | number | boolean = value.replace(/['"]/g, '');
        
        // Try to parse as number or boolean
        if (parsedValue === 'true') parsedValue = true;
        else if (parsedValue === 'false') parsedValue = false;
        else if (!isNaN(Number(parsedValue))) parsedValue = Number(parsedValue);
        
        conditions[key] = parsedValue;
      }
    }
    
    return {
      type: conditionType,
      conditions,
    };
  } catch (error) {
    console.warn('Failed to parse triage conditions:', conditionString, error);
    return null;
  }
}

export function evaluateTriageCondition(
  condition: TriageCondition,
  formData: FormData,
  triageAnswers: Record<string, string | number | boolean>
): boolean {
  const { type, conditions } = condition;
  
  // Combine form data and triage answers for evaluation
  const allData = { ...formData, ...triageAnswers };
  
  // Check if all conditions are met
  const conditionsMet = Object.entries(conditions).every(([key, expectedValue]) => {
    const actualValue = allData[key];
    return actualValue === expectedValue;
  });
  
  // Return based on condition type
  return type === 'show_when' ? conditionsMet : !conditionsMet;
}

export function shouldShowField(
  field: WebformField,
  formData: FormData,
  triageAnswers: Record<string, string | number | boolean>
): boolean {
  const fieldKey = field['#webform_key'];
  const fieldType = field['#type'];
  
  // Note: Removed logic that hides 'what_was_taken' field when triage is answered
  // The field should remain visible to allow users to provide additional details
  
  // Handle triage-enabled fields
  if (field['#triage_enabled'] && field['#triage_conditions']) {
    const conditionString = field['#triage_conditions'];
    if (typeof conditionString !== 'string') return false;
    
    const condition = parseTriageConditions(conditionString);
    if (!condition) return false;
    
    return evaluateTriageCondition(condition, formData, triageAnswers);
  }
  
  // Show all other fields by default
  return true;
}