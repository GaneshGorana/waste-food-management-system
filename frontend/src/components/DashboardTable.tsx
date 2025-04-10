import { memo } from "react";
import {
  CircleChevronLeft,
  CircleChevronRight,
  PanelLeftClose,
  PanelRightClose,
} from "lucide-react";

type DashboardTablePropTypes<T> = {
  data: T[];
  pagination: {
    page: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  actions: Record<
    string,
    {
      label: string | ((row: T) => string); // Label can be a string or a function returning a string
      color?: string | ((row: T) => string); // Color can be a string or a function returning a string
      handler: (row: T, extraArg?: Record<string, unknown>) => void; // Handler function for the action
      extraArg?: Record<string, unknown>; // Optional additional arguments for the handler
    }
  >;
};

interface colorType {
  [key: string]: string;
}

const DashboardTable = memo(
  <T extends Record<string, unknown>>({
    data = [],
    pagination,
    onPageChange,
    actions = {},
  }: DashboardTablePropTypes<T>) => {
    if (!Array.isArray(data) || data.length === 0) {
      return <p className="text-center text-gray-500">No Data Available</p>;
    }
    // Extract keys dynamically
    const columns = Object.keys(data[0]).map((key) => ({
      key,
      label: key.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to readable text
    }));

    // Format function
    const formatValue = (
      key: string,
      value: string | number | null | undefined
    ) => {
      if (!value) return "-";

      const statusColors: colorType = {
        PENDING: "text-orange-500",
        ACCEPTED: "text-green-500",
        COLLECTED: "text-teal-500",
        DELIVERED: "text-cyan-500",
        ACTIVE: "text-green-500",
        INACTIVE: "text-red-500",
        REJECTED: "text-red-500",
      };

      if (statusColors[value]) {
        return (
          <span className={`font-semibold ${statusColors[value]}`}>
            {value}
          </span>
        );
      }

      if (key.includes("Date")) return new Date(value).toLocaleDateString();
      if (key === "foodImage")
        return (
          <img
            src={typeof value === "number" ? value.toString() : value}
            alt="Food"
            className="w-12 h-12 rounded-md object-cover mx-auto"
          />
        );
      if (key === "profilePic")
        return (
          <img
            src={typeof value === "number" ? value.toString() : value}
            alt="Profile Picture"
            className="w-12 h-12 rounded-md object-cover mx-auto"
          />
        );

      if (typeof value === "boolean") return value ? "True" : "False";
      if (typeof value === "object") return JSON.stringify(value);
      return value;
    };

    return (
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse border border-gray-400 dark:border-gray-600 shadow-md">
          <thead>
            <tr className="bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="border border-gray-400 dark:border-gray-600 p-3 capitalize"
                >
                  {col.label}
                </th>
              ))}
              {Object.keys(actions).length > 0 && (
                <th className="border border-gray-400 dark:border-gray-600 p-3">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border text-center bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-500"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="border p-3">
                    {formatValue(
                      col.key,
                      row[col.key as keyof FoodType] as
                        | string
                        | number
                        | null
                        | undefined
                    )}
                  </td>
                ))}
                {Object.keys(actions).length > 0 && (
                  <td className="border p-3">
                    <div className="flex flex-wrap justify-center gap-3">
                      {Object.keys(actions).map((actionKey, idx) => {
                        const action = actions[actionKey];

                        return (
                          <button
                            type="button"
                            key={idx}
                            className={`cursor-pointer p-2 min-w-[120px] sm:min-w-[150px] px-6 py-3 rounded-xl text-white shadow-lg 
                          ${
                            typeof action?.color === "function"
                              ? action?.color(row)
                              : action?.color || "bg-blue-500"
                          } hover:brightness-110 hover:shadow-xl active:scale-95`}
                            onClick={() =>
                              action?.handler(row, action?.extraArg || {})
                            }
                          >
                            {typeof action?.label === "function"
                              ? action?.label(row)
                              : action?.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}

        <div className="flex justify-center items-center mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md gap-2">
          {/* First Page Button */}
          <button
            className={`cursor-pointer px-3 py-2 rounded-lg font-semibold transition-all ${
              pagination.page > 1
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
            disabled={pagination.page === 1}
            onClick={() => onPageChange(1)}
          >
            <PanelLeftClose />
          </button>

          {/* Previous Page Button */}
          <button
            className={`cursor-pointer px-3 py-2 rounded-lg font-semibold transition-all ${
              pagination.page > 1
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
            disabled={pagination.page === 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <CircleChevronLeft />
          </button>

          {/* Page Counter */}
          <span className="text-lg font-semibold px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          {/* Next Page Button */}
          <button
            className={`cursor-pointer px-3 py-2 rounded-lg font-semibold transition-all ${
              pagination.page < pagination.totalPages
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
            disabled={pagination.page === pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            <CircleChevronRight />
          </button>

          {/* Last Page Button */}
          <button
            className={`cursor-pointer px-3 py-2 rounded-lg font-semibold transition-all ${
              pagination.page < pagination.totalPages
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
            disabled={pagination.page === pagination.totalPages}
            onClick={() => onPageChange(pagination.totalPages)}
          >
            <PanelRightClose />
          </button>
        </div>
      </div>
    );
  }
);

export default DashboardTable;
