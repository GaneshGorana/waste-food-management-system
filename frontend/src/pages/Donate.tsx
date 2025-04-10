import AlertBox from "@/components/AlertBox";
import AlertConfirmBox from "@/components/AlertConfirmBox";
import LoadingScreen from "@/components/LoadingScreen";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function Donate() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<{
    isLoading: boolean;
    text: string;
  }>({ isLoading: false, text: "" });

  const [alertConfirmMessage, setAlertConfirmMessage] = useState<{
    message: string;
    messageType: "success" | "info" | "warning" | "error";
    cancelText?: string;
    confirmText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    actionType?: "UNAUTHORIZED_ACCESS";
    who?: "ADMIN" | "SERVICE" | "DONOR";
  } | null>(null);

  useEffect(() => {
    if (!document.cookie.includes("token")) {
      setAlertConfirmMessage({
        message: "Please login to access this page",
        messageType: "warning",
        actionType: "UNAUTHORIZED_ACCESS",
        confirmText: "Login",
        cancelText: "Cancel",
        onConfirm: () => navigate("/login"),
      });
    }
  }, [navigate]);

  const [food, setFood] = useState<FoodType>({
    foodName: "",
    foodImage: "",
    quantity: 0,
    foodState: "",
    foodCity: "",
    foodAddress: "",
    status: "PENDING",
    foodType: "VEGETARIAN",
    foodDeliverAddress: "",
  });
  const [error, setError] = useState<ApiError>();
  const [result, setResult] = useState<ApiResult>();
  const imageRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading({ isLoading: true, text: "Adding food" });
    try {
      const data = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/food/add`,
        { ...(food || {}), foodType: food?.foodType?.toUpperCase() || "" },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setFood({
        foodName: "",
        foodImage: "",
        quantity: 0,
        foodState: "",
        foodCity: "",
        foodAddress: "",
        status: "PENDING",
        madeDate: "",
        expiryDate: "",
        foodType: "VEGETARIAN",
        foodDeliverAddress: "",
      });
      if (imageRef.current) {
        imageRef.current.value = "";
      }
      if (data.status === 201) {
        setIsLoading({ isLoading: false, text: "" });
        setError(undefined);
        setResult(data.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("Error adding food : ", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    }
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
      <LoadingScreen isLoading={isLoading.isLoading} text={isLoading.text} />
      {(error || result) && (
        <AlertBox
          message={error?.message || result?.message || ""}
          onClose={() => {
            setError(undefined);
            setResult(undefined);
          }}
          messageType={error?.messageType || result?.messageType || "info"}
        />
      )}
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 md:p-12">
        <h2 className="text-3xl font-semibold text-center text-gray-800 dark:text-white mb-10">
          Donate Food
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setAlertConfirmMessage({
              message: "Proceed to donate food?",
              messageType: "info",
              cancelText: "Cancel",
              confirmText: "Donate",
              onConfirm: () => {
                handleSubmit(e);
                setAlertConfirmMessage(null);
              },
              onCancel: () => {
                setAlertConfirmMessage(null);
              },
            });
          }}
          encType="multipart/form-data"
          className="space-y-8"
        >
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="flex-1">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                htmlFor="name"
              >
                Food Name
              </label>
              <input
                type="text"
                id="name"
                value={food?.foodName}
                onChange={(e) => setFood({ ...food, foodName: e.target.value })}
                placeholder="Enter the name of the food"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div className="flex-1 mt-4 md:mt-0">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                htmlFor="quantity"
              >
                Quantity (in kg)
              </label>
              <input
                type="number"
                id="quantity"
                value={food.quantity === 0 ? "" : food.quantity}
                onChange={(e) => {
                  const val = e.target.value;
                  setFood({ ...food, quantity: val === "" ? 0 : Number(val) });
                }}
                placeholder="Enter the quantity of the food"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="flex-1">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                htmlFor="state"
              >
                State
              </label>
              <input
                type="text"
                id="state"
                value={food?.foodState}
                onChange={(e) =>
                  setFood({ ...food, foodState: e.target.value })
                }
                placeholder="Enter the food state"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div className="flex-1 mt-4 md:mt-0">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                htmlFor="city"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                value={food?.foodCity}
                onChange={(e) => setFood({ ...food, foodCity: e.target.value })}
                placeholder="Enter the food city"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="flex-1">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                htmlFor="location"
              >
                Address
              </label>
              <input
                type="text"
                id="location"
                value={food?.foodAddress}
                onChange={(e) =>
                  setFood({ ...food, foodAddress: e.target.value })
                }
                placeholder="Enter the food address"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div className="flex-1 mt-4 md:mt-0">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                htmlFor="foodType"
              >
                Food Type
              </label>
              <select
                id="foodType"
                value={food?.foodType}
                onChange={(e) =>
                  setFood({
                    ...food,
                    foodType: e.target.value as
                      | "VEGETARIAN"
                      | "NON_VEGETARIAN"
                      | "VEGAN",
                  })
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white cursor-pointer"
              >
                <option value="VEGETARIAN">Vegetarian</option>
                <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                <option value="VEGAN">Vegan</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="flex-1 mt-4 md:mt-0">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                htmlFor="madeDate"
              >
                Made date
              </label>
              <input
                type="date"
                id="madeDate"
                value={
                  food?.madeDate instanceof Date
                    ? food.madeDate.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFood({ ...food, madeDate: new Date(e.target.value) })
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                htmlFor="expiryDate"
              >
                Expiry Date
              </label>
              <input
                type="date"
                id="expiryDate"
                value={
                  food?.expiryDate instanceof Date
                    ? food.expiryDate.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFood({ ...food, expiryDate: new Date(e.target.value) })
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white cursor-pointer"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col gap-2">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                htmlFor="foodImage"
              >
                Upload Image of Food
              </label>
              <input
                type="file"
                id="foodImage"
                accept="image/*"
                onChange={(e) =>
                  setFood({ ...food, foodImage: e?.target?.files?.[0] || "" })
                }
                ref={imageRef}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white cursor-pointer"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 cursor-pointer"
              >
                Donate Now
              </button>
            </div>
          </div>
        </form>
      </div>
      {alertConfirmMessage && (
        <AlertConfirmBox
          message={alertConfirmMessage.message}
          messageType={alertConfirmMessage.messageType}
          cancelText={alertConfirmMessage.cancelText}
          confirmText={alertConfirmMessage.confirmText}
          onConfirm={alertConfirmMessage.onConfirm}
          onCancel={
            alertConfirmMessage.onCancel || (() => setAlertConfirmMessage(null))
          }
          onClose={() => setAlertConfirmMessage(null)}
        />
      )}
    </div>
  );
}

export default Donate;
