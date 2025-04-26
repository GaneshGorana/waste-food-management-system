import { memo, useState } from "react";
import {
  CircleChevronLeft,
  CircleChevronRight,
  PanelLeftClose,
  PanelRightClose,
} from "lucide-react";
import AlertConfirmBox from "./AlertConfirmBox";
import "../assets/css/imageShowAnimation.css";

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
      label: string | ((row: T) => string);
      color?: string | ((row: T) => string);
      handler: (row: T, extraArg?: Record<string, unknown>) => void;
      extraArg?: Record<string, unknown>;
    }
  >;
  who?: "DONOR" | "SERVICE" | "ORGANIZATION" | "ADMIN" | "ANY";
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
    who = "ANY",
  }: DashboardTablePropTypes<T>) => {
    const [alertConfirmMessage, setAlertConfirmMessage] = useState<{
      message: string;
      messageType: "success" | "info" | "warning" | "error";
      cancelText?: string;
      confirmText?: string;
      onConfirm: () => void;
      onCancel?: () => void;
    } | null>(null);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!Array.isArray(data) || data.length === 0) {
      return <p className="text-center text-gray-500">No Data Found</p>;
    }

    const columns = Object.keys(data[0])
      .filter(
        (key) => key !== "latitude" && key !== "longitude" && key !== "donorId"
      )
      .map((key) => ({
        key,
        label: key.replace(/([A-Z])/g, " $1").trim(),
      }));

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
      if (key === "latitude" || key === "longitude") return;
      if (key === "foodImage" || key === "profilePic") {
        const src = typeof value === "number" ? value.toString() : value;
        return (
          <img
            src={src}
            alt={key}
            className="w-12 h-12 rounded-md object-cover mx-auto cursor-pointer"
            onClick={() => setSelectedImage(src)}
          />
        );
      }
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
              {(who === "SERVICE" || who === "ADMIN") &&
                data[0]?.foodName !== undefined && (
                  <>
                    <th className="border border-gray-400 dark:border-gray-600 p-3">
                      Pickup Location
                    </th>
                    <th className="border border-gray-400 dark:border-gray-600 p-3">
                      Delivery Location
                    </th>
                  </>
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
                {(who === "SERVICE" || who === "ADMIN") &&
                  data[0]?.foodName !== undefined && (
                    <>
                      {/* Pickup Location */}
                      <td className="border p-3">
                        <button
                          className="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                          onClick={() => {
                            const coord = `${row.latitude},${row.longitude}`;
                            if (who === "SERVICE") {
                              navigator.clipboard.writeText(coord);
                              setAlertConfirmMessage({
                                message:
                                  "Coordinates copied to clipboard, go to google maps and paste it.",
                                messageType: "success",
                                cancelText: "Close",
                                confirmText: "Ok",
                                onCancel: () => setAlertConfirmMessage(null),
                                onConfirm: () => setAlertConfirmMessage(null),
                              });
                            } else if (who === "ADMIN") {
                              if (
                                !row.latitude ||
                                !row.longitude ||
                                row.acceptedById == null ||
                                row.status === "COLLECTED" ||
                                row.status === "DELIVERED"
                              ) {
                                setAlertConfirmMessage({
                                  message:
                                    row.acceptedById == null
                                      ? "Food is not accepted yet"
                                      : row.status === "COLLECTED"
                                      ? "Food is collected."
                                      : row.status === "DELIVERED"
                                      ? "Food is delivered"
                                      : "No pickup coordinates available.",
                                  messageType: "error",
                                  cancelText: "Close",
                                  confirmText: "Ok",
                                  onCancel: () => setAlertConfirmMessage(null),
                                  onConfirm: () => setAlertConfirmMessage(null),
                                });
                                return;
                              }
                              window.open(
                                `/track-food?mode=pickup&foodLat=${row.latitude}&foodLng=${row.longitude}&workerId=${row.acceptedById}`,
                                "_blank"
                              );
                            }
                          }}
                        >
                          {who === "SERVICE" ? "Copy Coords" : "Track Pickup"}
                        </button>
                      </td>

                      <td className="border p-3">
                        <button
                          className="cursor-pointer bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                          onClick={() => {
                            const coord = row.foodDeliverAddress;
                            if (who === "SERVICE") {
                              navigator.clipboard.writeText(coord as string);
                              setAlertConfirmMessage({
                                message:
                                  "Delivery Address copied to clipboard, go to google maps and paste it.",
                                messageType: "success",
                                cancelText: "Close",
                                confirmText: "Ok",
                                onCancel: () => setAlertConfirmMessage(null),
                                onConfirm: () => setAlertConfirmMessage(null),
                              });
                            } else if (who === "ADMIN") {
                              if (
                                !coord ||
                                !row.latitude ||
                                !row.longitude ||
                                row.acceptedById == null ||
                                row.status === "COLLECTED" ||
                                row.status === "DELIVERED"
                              ) {
                                setAlertConfirmMessage({
                                  message:
                                    row.acceptedById == null
                                      ? "Food is not accepted yet"
                                      : row.status === "ACCEPTED"
                                      ? "Food is accepted, try after when it is collected."
                                      : row.status === "DELIVERED"
                                      ? "Food is delivered"
                                      : "No delivery address available.",
                                  messageType: "error",
                                  cancelText: "Close",
                                  confirmText: "Ok",
                                  onCancel: () => setAlertConfirmMessage(null),
                                  onConfirm: () => setAlertConfirmMessage(null),
                                });
                                return;
                              }
                              window.open(
                                `/track-food?mode=delivery&deliveryAddress=${encodeURIComponent(
                                  row?.foodDeliverAddress as string
                                )}&workerId=${row.acceptedById}`,
                                "_blank"
                              );
                            }
                          }}
                        >
                          {who === "SERVICE"
                            ? "Copy Address"
                            : "Track Delivery"}
                        </button>
                      </td>
                    </>
                  )}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-center items-center mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md gap-2">
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

          <span className="text-lg font-semibold px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>

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
        {alertConfirmMessage && (
          <AlertConfirmBox
            message={alertConfirmMessage.message}
            messageType={alertConfirmMessage.messageType}
            cancelText={alertConfirmMessage.cancelText}
            confirmText={alertConfirmMessage.confirmText}
            onConfirm={alertConfirmMessage.onConfirm}
            onCancel={
              alertConfirmMessage.onCancel ||
              (() => setAlertConfirmMessage(null))
            }
            onClose={() => setAlertConfirmMessage(null)}
          />
        )}
        {selectedImage && (
          <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ease-in-out opacity-100"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Preview"
                className="max-h-[90vh] w-auto rounded-lg shadow-xl"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="cursor-pointer absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-transform duration-300 ease-in-out transform hover:scale-110"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default DashboardTable;
