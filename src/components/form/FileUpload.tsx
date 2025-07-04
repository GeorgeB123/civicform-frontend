import { WebformField } from '@/types/webform';
import { useState } from 'react';

interface FileUploadProps {
  field: WebformField;
  value: File[];
  onChange: (value: File[]) => void;
  error?: string;
}

export default function FileUpload({ field, value, onChange, error }: FileUploadProps) {
  const isRequired = field['#required'] || false;
  const title = field['#title'] || field['#admin_title'] || '';
  const isMultiple = field['#multiple'] || false;
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (isMultiple) {
      onChange([...value, ...files]);
    } else {
      onChange(files.slice(0, 1));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (isMultiple) {
      onChange([...value, ...files]);
    } else {
      onChange(files.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {title}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
        } ${error ? 'border-red-500' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          onChange={handleFileChange}
          multiple={isMultiple}
          className="hidden"
          id={`file-upload-${field['#webform_key']}`}
          required={isRequired && value.length === 0}
        />
        <label
          htmlFor={`file-upload-${field['#webform_key']}`}
          className="cursor-pointer text-blue-600 hover:text-blue-800"
        >
          Click to upload or drag and drop files here
        </label>
        {isMultiple && <p className="text-sm text-gray-500 mt-2">You can upload multiple files</p>}
      </div>

      {value.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected files:</h4>
          <ul className="space-y-1">
            {value.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm text-gray-700">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}