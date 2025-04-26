import AlertBox from "@/components/AlertBox";
import AlertConfirmBox from "@/components/AlertConfirmBox";
import LoadingScreen from "@/components/LoadingScreen";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import LocationPicker from "@/utility/LocationPicker";

function Donate() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<{
    isLoading: boolean;
    text: string;
  }>({ isLoading: false, text: "" });

  const [coors, setCoors] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: null,
    lng: null,
  });

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

  const [currentSection, setCurrentSection] = useState(0);

  const isValidDate = (date: Date | null | undefined) =>
    date instanceof Date && !isNaN(date.valueOf());

  const isFoodDetailsValid = () =>
    food.foodName.trim() !== "" &&
    food?.quantity &&
    food.quantity > 0 &&
    food.foodState.trim() !== "" &&
    food.foodCity.trim() !== "" &&
    food.foodAddress.trim() !== "" &&
    isValidDate(food.madeDate as Date) &&
    isValidDate(food.expiryDate as Date);

  const isImageValid = () =>
    typeof food.foodImage !== "string" && food.foodImage instanceof File;

  const isLocationValid = () => coors.lat !== null && coors.lng !== null;

  const isCurrentSectionValid = () => {
    switch (currentSection) {
      case 0:
        return isFoodDetailsValid();
      case 1:
        return isImageValid();
      case 2:
        return isLocationValid();
      default:
        return false;
    }
  };

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
      return;
    }

    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoors({ lat: latitude, lng: longitude });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setAlertConfirmMessage({
              message:
                "Location is required to donate food. Please allow location access.",
              messageType: "error",
              confirmText: "Try Again",
              cancelText: "Cancel",
              onConfirm: () => {
                setAlertConfirmMessage(null);
                getLocation();
              },
              onCancel: () => {
                setAlertConfirmMessage({
                  message:
                    "You cannot donate food without allowing location access.",
                  messageType: "warning",
                  confirmText: "Retry",
                  cancelText: "Cancel",
                  onConfirm: () => {
                    setAlertConfirmMessage(null);
                  },
                });
              },
            });
          }
        }
      );
    };

    getLocation();
  }, [navigate]);

  const [error, setError] = useState<ApiError>();
  const [result, setResult] = useState<ApiResult>();
  const imageRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const handleSubmit = async () => {
    if (!isFoodDetailsValid() || !isImageValid() || !isLocationValid()) return;

    if (!coors.lat || !coors.lng) {
      setError({
        message: "Location is required to donate food",
        messageType: "error",
      });
      setIsLoading({ isLoading: false, text: "" });
      return;
    }

    setIsLoading({ isLoading: true, text: "Adding food" });

    try {
      const formData = new FormData();
      formData.append("foodName", food.foodName);
      formData.append("quantity", food.quantity?.toString() || "0");
      formData.append("foodState", food.foodState);
      formData.append("foodCity", food.foodCity);
      formData.append("foodAddress", food.foodAddress);
      formData.append("foodType", food.foodType.toUpperCase());
      formData.append("status", food.status);
      formData.append("foodDeliverAddress", food.foodDeliverAddress || "");
      if (food.madeDate instanceof Date)
        formData.append("madeDate", food.madeDate.toISOString());
      if (food.expiryDate instanceof Date)
        formData.append("expiryDate", food.expiryDate.toISOString());
      if (food.foodImage && typeof food.foodImage !== "string") {
        formData.append("foodImage", food.foodImage);
      }
      formData.append(
        "latitude",
        coors.lat !== null ? coors.lat.toString() : "0"
      );
      formData.append(
        "longitude",
        coors.lng !== null ? coors.lng.toString() : "0"
      );

      const data = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/food/add`,
        formData,
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
        latitude: undefined,
        longitude: undefined,
      });

      setCoors({ lat: null, lng: null });
      setCurrentSection(0);

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
          onSubmit={(e) => e.preventDefault()}
          encType="multipart/form-data"
          className="space-y-8"
        >
          {currentSection === 0 && (
            <>
              <h3 className="text-xl font-semibold mb-4">1. Food Details</h3>
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
                    onChange={(e) =>
                      setFood({ ...food, foodName: e.target.value })
                    }
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
                      setFood({
                        ...food,
                        quantity: val === "" ? 0 : Number(val),
                      });
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
                    onChange={(e) =>
                      setFood({ ...food, foodCity: e.target.value })
                    }
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
            </>
          )}

          {currentSection === 1 && (
            <>
              <h3 className="text-xl font-semibold mb-4">2. Upload Image</h3>
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
                      setFood({
                        ...food,
                        foodImage: e?.target?.files?.[0] || "",
                      })
                    }
                    ref={imageRef}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white cursor-pointer"
                  />
                </div>
              </div>
            </>
          )}

          {currentSection === 2 && (
            <>
              <h3 className="text-xl font-semibold mb-4">
                3. Set Food Location
              </h3>

              <div className="w-full h-64 rounded-lg overflow-hidden">
                <MapContainer
                  center={{
                    lat: coors.lat ?? 0,
                    lng: coors.lng ?? 0,
                  }}
                  zoom={13}
                  scrollWheelZoom={true}
                  ref={(mapInstance) => {
                    if (mapInstance) {
                      mapRef.current = mapInstance;
                    }
                  }}
                  className="h-full w-full z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker
                    coors={coors as { lat: number; lng: number }}
                    setCoors={setCoors}
                  />
                </MapContainer>
              </div>

              <div className="mt-4 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition((position) => {
                      const { latitude, longitude } = position.coords;
                      const newCoors = { lat: latitude, lng: longitude };
                      setCoors(newCoors);
                      mapRef.current?.setView(newCoors, 13);
                    });
                  }}
                  className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Use Current Location
                </button>
              </div>

              {!isLocationValid() && (
                <p className="text-red-600 mt-2 text-center">
                  Location is required
                </p>
              )}
            </>
          )}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setCurrentSection((prev) => Math.max(0, prev - 1))}
              disabled={currentSection === 0}
              className="cursor-pointer px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
            >
              Back
            </button>

            {currentSection < 2 ? (
              <button
                type="button"
                onClick={() => setCurrentSection((prev) => prev + 1)}
                disabled={!isCurrentSectionValid()}
                className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={
                  !isFoodDetailsValid() || !isImageValid() || !isLocationValid()
                }
                onClick={() => {
                  setAlertConfirmMessage({
                    message:
                      "Proceed to donate food? You can't change some fields after adding the foood.",
                    messageType: "info",
                    cancelText: "Cancel",
                    confirmText: "Donate",
                    onConfirm: () => {
                      handleSubmit();
                      setAlertConfirmMessage(null);
                    },
                    onCancel: () => {
                      setAlertConfirmMessage(null);
                    },
                  });
                }}
                className="cursor-pointer bg-blue-600 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
              >
                Donate Now
              </button>
            )}
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
