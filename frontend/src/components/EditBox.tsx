import { useState } from "react";

type EditBoxPropTypes<T> = {
  data: T;
  actions?: Record<
    string,
    {
      label: string;
      color?: string;
      handler?: (data?: Partial<T>) => void;
    }
  >;
  readOnlyFields?: string[];
  isNullValuesAllowed?: boolean;
  onUpdate: (data: T) => void;
  onClose: () => void;
};

const EditBox = <T extends Record<string, unknown>>({
  data,
  actions = {},
  readOnlyFields = [],
  isNullValuesAllowed = true,
  onUpdate,
  onClose,
}: EditBoxPropTypes<T>) => {
  const [formData, setFormData] = useState(data);
  const handleChange = <K extends keyof T>(key: K, value: T[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto relative">
        <button
          className="cursor-pointer absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Edit Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(formData).map((key) => {
            const value = formData[key as keyof T];

            if (
              !isNullValuesAllowed &&
              (value === null || value === undefined)
            ) {
              return null;
            }

            if (readOnlyFields.includes(key)) {
              return null;
            }

            const isEditable = !readOnlyFields.includes(key);

            return (
              <div key={key} className="flex flex-col">
                <label className="text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </label>

                {isEditable ? (
                  <input
                    type="text"
                    value={
                      typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)
                    }
                    onChange={(e) =>
                      handleChange(key as keyof T, e.target.value as T[keyof T])
                    }
                    className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring focus:ring-blue-400"
                  />
                ) : (
                  <p className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md">
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </p>
                )}
              </div>
            );
          })}

          <div className="flex justify-end gap-3">
            {Object.keys(actions).map((actionKey, idx) => (
              <button
                type={actionKey === "update" ? "submit" : "button"}
                key={idx}
                className={`cursor-pointer p-2 px-6 py-3 rounded-xl text-white shadow-lg transition-all duration-200 
                ${actions[actionKey]?.color || "bg-blue-500"} 
                hover:brightness-110 hover:shadow-xl 
                active:scale-95`}
                onClick={(e) => {
                  if (actionKey !== "update") {
                    e.preventDefault();
                    if (actions[actionKey]?.handler) {
                      actions[actionKey].handler(
                        Object.fromEntries(
                          Object.entries(formData).filter(
                            ([, value]) => typeof value !== "boolean"
                          )
                        ) as Partial<T>
                      );
                    }
                  }
                }}
              >
                {actions[actionKey]?.label}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBox;
