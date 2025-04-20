import { useState } from "react";

type DashboardValueUpdaterPropTypes = {
  title: string;
  fields: Array<{
    text: string;
    asValue: string;
  }>;
  onSubmit: (data: Record<string, string>) => void;
  type: string;
  onClose: () => void;
};

const DashboardValueUpdater = ({
  title,
  fields = [],
  onSubmit,
  onClose,
  type,
}: DashboardValueUpdaterPropTypes) => {
  const [inputValues, setInputValues] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.asValue]: "" }), {})
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    setInputValues({ ...inputValues, [fieldName]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ ...inputValues, type });
    onClose();
    setInputValues(
      fields.reduce((acc, field) => ({ ...acc, [field.asValue]: "" }), {})
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {title}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {field.text}
              </label>
              <input
                type="text"
                value={inputValues[field.asValue]}
                onChange={(e) => handleChange(e, field.asValue)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          ))}

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md"
            >
              Close
            </button>
            <button
              type="submit"
              className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Done
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default DashboardValueUpdater;
