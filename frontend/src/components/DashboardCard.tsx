import { useState, useRef } from "react";

type DashboardCardPropTypes = {
  text: string;
  data: number;
  dropdownItems?: Array<{
    label: string;
    handler: (callback?: () => void) => void;
  }>;
  showDropdown?: boolean;
  who: "users" | "service-workers" | "donations" | "foods";
  resetDropdown?: () => void;
  Icon?: React.ElementType;
};

const DashboardCard = ({
  text,
  data,
  dropdownItems = [],
  showDropdown = false,
  who,
  resetDropdown,
  Icon,
}: DashboardCardPropTypes) => {
  const selectOptionRef = useRef<HTMLSelectElement | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");

  const handleActionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedAction(selectedValue);

    const action = dropdownItems.find((item) => item.label === selectedValue);
    if (action) {
      action.handler(() => {
        setSelectedAction("");
        if (typeof resetDropdown === "function") {
          resetDropdown();
        }
      });
    }
  };

  return (
    <div className="relative border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 w-full max-w-sm">
      {showDropdown && dropdownItems.length > 0 && (
        <div className="absolute top-3 right-3">
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 shadow-lg rounded-md z-10">
              {dropdownItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDropdownOpen(false);
                    item.handler();
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div
        className={`flex items-center  gap-2 mb-6 ${
          Icon ? "justify-between" : "justify-center"
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
          {text}
        </h3>
        {Icon && (
          <button
            onClick={() => selectOptionRef?.current?.focus()}
            className="cursor-pointer p-2 rounded-md bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition duration-200"
          >
            <Icon
              className="w-5 h-5 text-gray-800 dark:text-white"
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {!showDropdown && (
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg py-3">
          <span
            className={`text-lg font-bold ${
              who === "users"
                ? "text-blue-500"
                : who === "service-workers"
                ? "text-cyan-500"
                : "text-teal-500"
            }`}
          >
            {data}
          </span>
        </div>
      )}

      {showDropdown && dropdownItems.length > 0 && (
        <div className="mt-4">
          <select
            ref={selectOptionRef}
            value={selectedAction}
            onChange={handleActionChange}
            className="cursor-pointer w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="" disabled>
              Select an option
            </option>
            {dropdownItems.map((item, index) => (
              <option key={index} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
export default DashboardCard;
