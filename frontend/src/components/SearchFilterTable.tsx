import { useState } from "react";

type FilterField<T> = {
  label: string;
  key: keyof T;
  type: "text" | "select" | "date" | "email";
  options?: string[];
};

type SearchFilterTableProps<T> = {
  fields: FilterField<T>[];
  onSearch: (searchData: Partial<T>) => void;
  onClear: () => void;
};

export const SearchFilterTable = <T extends Record<string, unknown>>({
  fields,
  onSearch,
  onClear,
}: SearchFilterTableProps<T>) => {
  const [values, setValues] = useState<Partial<T>>({});

  const handleChange = (key: keyof T, value: unknown) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => onSearch(values);
  const handleClear = () => {
    setValues({});
    onClear();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields.map((field) => (
          <div key={String(field.key)}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label}
            </label>

            {field.type === "text" && (
              <input
                type="text"
                value={(values[field.key] as string) || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            )}

            {field.type === "email" && (
              <input
                type="email"
                value={(values[field.key] as string) || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            )}

            {field.type === "select" && (
              <select
                value={(values[field.key] as string) || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="cursor-pointer w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="" disabled>
                  -- Select --
                </option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {field.type === "date" && (
              <input
                type="date"
                value={(values[field.key] as string) || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="cursor-pointer w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={handleClear}
          className="cursor-pointer px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded"
        >
          Clear Search
        </button>
        <button
          onClick={handleSearch}
          className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Search
        </button>
      </div>
    </div>
  );
};
