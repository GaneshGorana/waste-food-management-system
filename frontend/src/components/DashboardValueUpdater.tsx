import { useState } from "react";

type DashboardValueUpdaterPropTypes<T> = {
  title: string;
  fields: Array<{
    text: string;
    asValue: keyof T;
  }>;
  onSubmit: (data: Partial<T>) => void;
  type: string;
  onClose: () => void;
};

const DashboardValueUpdater = <T extends Record<string, unknown>>({
  title,
  fields = [],
  onSubmit,
  onClose,
  type,
}: DashboardValueUpdaterPropTypes<T>) => {
  const [inputValues, setInputValues] = useState<Partial<T>>(
    fields.reduce(
      (acc, field) => ({ ...acc, [field.asValue]: "" }),
      {}
    ) as Partial<T>
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof T
  ) => {
    setInputValues({ ...inputValues, [fieldName]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ ...inputValues, type });
    onClose();
    setInputValues(
      fields.reduce(
        (acc, field) => ({ ...acc, [field.asValue]: "" }),
        {}
      ) as Partial<T>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white text-center">
          {title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.text}
                </label>
                <input
                  type="text"
                  value={inputValues[field.asValue] as string}
                  onChange={(e) => handleChange(e, field.asValue)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition"
            >
              Close
            </button>
            <button
              type="submit"
              className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
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
