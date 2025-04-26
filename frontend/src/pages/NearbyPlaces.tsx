import AlertBox from "@/components/AlertBox";
import AlertConfirmBox from "@/components/AlertConfirmBox";
import DashboardValueUpdater from "@/components/DashboardValueUpdater";
import EditBox from "@/components/EditBox";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

function NearbyPlaces() {
  const token = document.cookie.split("token=")[1]?.split(";")[0];
  const userData = token
    ? jwtDecode<UserType>(decodeURIComponent(token))
    : null;
  const [places, setPlaces] = useState<NearByPlacesType[]>([
    {
      _id: "",
      placeName: "",
      placeState: "",
      placeCity: "",
      placeAddress: "",
      placePincode: 0,
      food: "",
      worker: "",
      isFoodDelivered: false,
      latitude: 0,
      longitude: 0,
    },
  ]);

  const [alertConfirmMessage, setAlertConfirmMessage] = useState<{
    message: string;
    messageType: "success" | "info" | "warning" | "error";
    cancelText?: string;
    confirmText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const [availableFood, setAvailableFood] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<ApiError>();
  const [result, setResult] = useState<ApiResult>();

  const [menuOpen, setMenuOpen] = useState(false);

  const [thingValueUpdate, setThingValueUpdate] = useState<{
    title: string;
    fields?: { text: string; asValue: string }[];
    type?: string;
  } | null>(null);
  const [thingValue, setThingValue] = useState<NearByPlacesType>();

  const [isEditModeOpen, setisEditModeOpen] = useState(false);
  const [isValueUpdateModeOpen, setIsValueUpdateModeOpen] = useState(false);

  const fetchPlaces = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/nearby-places`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        setError(undefined);
        setPlaces(response.data?.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching nearby places:", error);
        setResult(undefined);
        setError(
          (error.response?.data as ApiError) || "Error fetching nearby places"
        );
      }
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleDonateAction = async (placeId: string) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }/api/food/available-deliveries`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        setAvailableFood(response.data?.data);
        setSelectedPlaceId(placeId);
        setShowModal(true);
        setError(undefined);
        setResult(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching available deliveries:", error);
        setResult(undefined);
        setError(error.response?.data || "Error fetching available deliveries");
      }
    }
  };

  const handleFoodSelect = async (foodId: string) => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }/api/food/delivery-accept-from-nearby-place`,
        {
          placeId: selectedPlaceId,
          foodId: foodId,
        },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setError(undefined);
        setResult(response.data);
        fetchPlaces();
      }
      setShowModal(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error selecting food:", error);
        setResult(undefined);
        setError(error.response?.data || "Error selecting food");
      }
    }
  };

  const handleToggleEditMode = (value: NearByPlacesType) => {
    setisEditModeOpen((prev) => !prev);
    setThingValue(value);
  };

  const handleAddPlace = async (data: NearByPlacesType) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/nearby-places/add`,
        data,
        { withCredentials: true }
      );
      setResult(response.data);
      fetchPlaces();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error adding place", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    }
  };

  const handleUpdatePlace = async (data: NearByPlacesType) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/nearby-places/update`,
        data,
        { withCredentials: true }
      );
      setResult(response.data);
      fetchPlaces();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error updaing place", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    }
  };

  const handleDeletePlace = async (data: NearByPlacesType) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/nearby-places/delete`,
        { _id: data._id },
        { withCredentials: true }
      );
      setResult(response.data);
      fetchPlaces();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error deleting place", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    }
  };

  const formatValue = (value: string | number | null | undefined) => {
    if (value === 0 || value === null || value === undefined) return "-";
    return value;
  };

  return (
    <div className="mt-16 p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
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
      <div className="flex justify-between items-center mb-6 relative flex-wrap md:flex-nowrap min-w-0">
        <h1 className="text-3xl font-bold">Nearby Places</h1>

        <div
          className={`relative ${
            userData?.role !== "ADMIN" ? "hidden" : "block"
          }`}
        >
          <button
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow flex items-center"
            onClick={() => setMenuOpen(!menuOpen)}
            disabled={userData?.role !== "ADMIN"}
          >
            {menuOpen ? <FaTimes size={20} /> : <Settings size={20} />}
          </button>

          <ul
            className={`absolute right-0 mt-2 z-10 w-48 bg-white dark:bg-slate-800 rounded-md shadow-md border border-gray-300 dark:border-gray-600 transition-all duration-200 ease-in-out ${
              menuOpen ? "block" : "hidden"
            }`}
          >
            <li>
              <button
                className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={() => {
                  setMenuOpen(false);
                  setIsValueUpdateModeOpen(true);
                  setThingValueUpdate({
                    title: "Add Place",
                    fields: [
                      { text: "Enter place name", asValue: "placeName" },
                      { text: "Enter place state", asValue: "placeState" },
                      { text: "Enter place city", asValue: "placeCity" },
                      { text: "Enter place address", asValue: "placeAddress" },
                      { text: "Enter place pincode", asValue: "placePincode" },
                      { text: "Enter place latitude", asValue: "latitude" },
                      { text: "Enter place longitude", asValue: "longitude" },
                    ],
                    type: "addPlace",
                  });
                }}
              >
                Add Place
              </button>
            </li>
            <li>
              <button
                className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={() => {
                  setMenuOpen(false);
                  setIsValueUpdateModeOpen(true);
                  setThingValueUpdate({
                    title: "Delete Place",
                    fields: [{ text: "Enter place _id", asValue: "_id" }],
                    type: "deletePlace",
                  });
                }}
              >
                Delete Place
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white">
              <th className="border border-gray-400 dark:border-gray-600 p-3">
                Place Id
              </th>
              <th className="border border-gray-400 dark:border-gray-600 p-3">
                Place Name
              </th>
              <th className="border border-gray-400 dark:border-gray-600 p-3">
                State
              </th>
              <th className="border border-gray-400 dark:border-gray-600 p-3">
                City
              </th>
              <th className="border border-gray-400 dark:border-gray-600 p-3">
                Address
              </th>
              <th className="border border-gray-400 dark:border-gray-600 p-3">
                Latitude
              </th>
              <th className="border border-gray-400 dark:border-gray-600 p-3">
                Longitude
              </th>
              <th className="border border-gray-400 dark:border-gray-600 p-3">
                Pincode
              </th>
              <th className="border border-gray-400 dark:border-gray-600 p-3">
                Donated Food
              </th>
              <th className="border border-gray-400 dark:border-gray-600 p-3">
                Delivering Worker
              </th>
              <th className="border border-gray-400 dark:border-gray-600 p-3">
                Delivery Status
              </th>
              <th className="border border-gray-400 dark:border-gray-600 p-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {places.length > 0 ? (
              places.map((place) => (
                <tr
                  key={place._id}
                  className="border text-center bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-500"
                >
                  <td className="border p-3">{formatValue(place._id)}</td>
                  <td className="border p-3">{formatValue(place.placeName)}</td>
                  <td className="border p-3">
                    {formatValue(place.placeState)}
                  </td>
                  <td className="border p-3">{formatValue(place.placeCity)}</td>
                  <td className="border p-3">
                    {formatValue(place.placeAddress)}
                  </td>
                  <td className="border p-3">{formatValue(place.latitude)}</td>
                  <td className="border p-3">{formatValue(place.longitude)}</td>
                  <td className="border p-3">
                    {formatValue(place.placePincode)}
                  </td>
                  <td className="border p-3">
                    {place.food ?? "Not donated yet"}
                  </td>
                  <td className="border p-3">
                    {place.worker ?? "No worker assigned"}
                  </td>
                  <td className="border p-3">
                    {place.food == null
                      ? "Not food available"
                      : place.isFoodDelivered
                      ? "Food Delivered"
                      : "Food Not Delivered"}
                  </td>
                  <td className="border p-3">
                    <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                      <button
                        className="w-full sm:w-auto cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 transition-all duration-300"
                        onClick={() => {
                          handleDonateAction(place._id);
                        }}
                      >
                        Donate on this Address
                      </button>
                      <button
                        className="w-full sm:w-auto cursor-pointer bg-green-500 text-white px-4 py-2 rounded-md shadow hover:bg-green-600 transition-all duration-300"
                        onClick={() => {
                          handleToggleEditMode(place);
                        }}
                      >
                        Update Place
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No Nearby Places Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-0 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl md:max-w-3xl lg:max-w-4xl">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Select Food to Donate
            </h2>
            <div className="max-h-100 overflow-x-auto mt-4">
              <table className="w-full border-collapse border border-gray-400 dark:border-gray-600 shadow-md">
                <thead>
                  <tr className="border text-center hover:bg-gray-100 dark:hover:bg-gray-500 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white">
                    <th className="border border-gray-400 dark:border-gray-600 p-3">
                      Food Name
                    </th>
                    <th className="border border-gray-400 dark:border-gray-600 p-3">
                      Quantity (in Kg)
                    </th>

                    <th className="border border-gray-400 dark:border-gray-600 p-3">
                      Status
                    </th>

                    <th className="border border-gray-400 dark:border-gray-600 p-3">
                      State
                    </th>

                    <th className="border border-gray-400 dark:border-gray-600 p-3">
                      City
                    </th>

                    <th className="border border-gray-400 dark:border-gray-600 p-3">
                      Address (from collected)
                    </th>

                    <th className="border border-gray-400 dark:border-gray-600 p-3">
                      Latitude
                    </th>

                    <th className="border border-gray-400 dark:border-gray-600 p-3">
                      Longitude
                    </th>

                    <th className="border border-gray-400 dark:border-gray-600 p-3">
                      Address (to be delivered)
                    </th>

                    <th className="border border-gray-400 dark:border-gray-600 p-3">
                      Expiry
                    </th>

                    <th className="border border-gray-400 dark:border-gray-600 p-3">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {availableFood.length > 0 ? (
                    availableFood.map((food: FoodType) => (
                      <tr
                        key={food?._id}
                        className="border border-gray-700 dark:border-gray-600 text-center bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-500"
                      >
                        <td className="border border-gray-700 dark:border-gray-600 p-3">
                          {food?.foodName}
                        </td>
                        <td className="border border-gray-700 dark:border-gray-600 p-3">
                          {food?.quantity}
                        </td>
                        <td
                          className={`border border-gray-700 dark:border-gray-600 p-3 ${
                            food.status === "PENDING"
                              ? "text-yellow-500"
                              : food.status === "ACCEPTED"
                              ? "text-teal-500"
                              : "text-green-500"
                          }`}
                        >
                          {food?.status}
                        </td>
                        <td className="border border-gray-700 dark:border-gray-600 p-3">
                          {food?.foodState}
                        </td>
                        <td className="border border-gray-700 dark:border-gray-600 p-3">
                          {food?.foodCity}
                        </td>
                        <td className="border border-gray-700 dark:border-gray-600 p-3">
                          {food?.foodAddress}
                        </td>
                        <td className="border border-gray-700 dark:border-gray-600 p-3">
                          {food?.latitude}
                        </td>
                        <td className="border border-gray-700 dark:border-gray-600 p-3">
                          {food?.longitude}
                        </td>
                        <td className="border border-gray-700 dark:border-gray-600 p-3">
                          {food?.foodDeliverAddress || "Not assigned yet"}
                        </td>
                        <td className="border border-gray-700 dark:border-gray-600 p-3">
                          {food?.expiryDate
                            ? new Date(food.expiryDate).toLocaleDateString()
                            : "No expiry date"}
                        </td>
                        <td className="border border-gray-700 dark:border-gray-600 p-3">
                          <button
                            className="cursor-pointer bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                            onClick={() =>
                              food._id && handleFoodSelect(food._id)
                            }
                          >
                            Accept this food
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center p-4">
                        No Deliveries Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                onClick={() => {
                  setShowModal(false);
                  setError(undefined);
                  setResult(undefined);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {isEditModeOpen && thingValue && (
        <EditBox
          data={thingValue}
          readOnlyFields={["food", "worker", "_id", "isFoodDelivered"]}
          isNullValuesAllowed={true}
          actions={{
            update: { label: "Update", color: "bg-green-500" },
            cancel: {
              label: "Cancel",
              color: "bg-gray-500",
              handler: () => {
                setisEditModeOpen(false);
                setThingValue(undefined);
              },
            },
          }}
          onUpdate={(data) => {
            setAlertConfirmMessage({
              message: "Proceed to update place?",
              messageType: "info",
              cancelText: "Cancel",
              confirmText: "Update",
              onConfirm: () => {
                handleUpdatePlace(data);
                setAlertConfirmMessage(null);
              },
            });
          }}
          onClose={() => {
            setisEditModeOpen(false);
            setThingValue(undefined);
          }}
        />
      )}
      {isValueUpdateModeOpen && (
        <DashboardValueUpdater
          title={thingValueUpdate?.title || ""}
          fields={thingValueUpdate?.fields || []}
          type={thingValueUpdate?.type || ""}
          onSubmit={(data) => {
            if (data.type === "addPlace") {
              setAlertConfirmMessage({
                message: "Add Place?",
                messageType: "info",
                cancelText: "Cancel",
                confirmText: "Add",
                onConfirm: () => {
                  handleAddPlace(data as NearByPlacesType);
                  setAlertConfirmMessage(null);
                },
              });
            }
            if (data.type === "deletePlace") {
              setAlertConfirmMessage({
                message: "Delete Place?",
                messageType: "info",
                cancelText: "Cancel",
                confirmText: "Delete",
                onConfirm: () => {
                  handleDeletePlace(data as NearByPlacesType);
                  setAlertConfirmMessage(null);
                },
              });
            }
          }}
          onClose={() => {
            setIsValueUpdateModeOpen(false);
            setThingValueUpdate(null);
          }}
        />
      )}
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

export default NearbyPlaces;
