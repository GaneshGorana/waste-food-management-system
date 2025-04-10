import { useState } from "react";

type EditBoxPropTypes = {
  data: FoodType;
  actions?: Record<
    string,
    {
      label: string;
      color?: string;
      handler?: (
        data?: Record<
          string,
          string | number | boolean | object | null | undefined
        >
      ) => void;
    }
  >;
  onUpdate: (data: FoodType) => void;
  onClose: () => void;
};

const EditBox = ({
  data,
  actions = {},
  onUpdate,
  onClose,
}: EditBoxPropTypes) => {
  const [formData, setFormData] = useState(data);

  const readOnlyFields = [
    "foodDeliverAddress",
    "acceptedBy",
    "role",
    "accountStatus",
    "acceptedById",
  ];

  const handleChange = (
    key: string,
    value: string | number | boolean | object | null | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onUpdate) {
      onUpdate(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto relative">
        {/* Close Button */}
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
            if (key === "_id") return null;

            const value = formData[key as keyof typeof formData];
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
                      value !== null && value !== undefined ? String(value) : ""
                    }
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring focus:ring-blue-400"
                  />
                ) : (
                  <p className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md">
                    {value !== null && value !== undefined
                      ? typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)
                      : "Not Assigned"}
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
                        )
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
