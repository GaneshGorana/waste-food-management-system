import AlertBox from "@/components/AlertBox";
import axios from "axios";
import { useEffect, useState } from "react";

function NearbyPlaces() {
  const [places, setPlaces] = useState([]);
  const [availableFood, setAvailableFood] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  const fetchPlaces = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/nearby-places`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        setError("");
        setPlaces(response.data?.data);
      }
    } catch (error) {
      console.error("Error fetching nearby places:", error);
      setResult("");
      setError(error?.response?.data || "Error fetching nearby places");
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleDonateAction = async (placeId) => {
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
        setError("");
        setResult(response.data);
      }
    } catch (error) {
      console.error("Error fetching available deliveries:", error);
      setResult("");
      setError(error?.response?.data || "Error fetching available deliveries");
    }
  };

  const handleFoodSelect = async (foodId) => {
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
        setError("");
        setResult(response.data);
        fetchPlaces();
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error donating food:", error);
      setResult("");
      setError(error?.response?.data || "Error donating food");
    }
  };

  return (
    <div className="mt-16 p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {(error || result) && (
        <AlertBox
          message={error?.message || result?.message}
          onClose={() => {
            setError("");
            setResult("");
          }}
          messageType={error?.messageType || result?.messageType}
        />
      )}
      <h1 className="text-3xl font-bold text-center mb-6">Nearby Places</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white">
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
                Pincode
              </th>
              <th className="border border-gray-400 dark:border-gray-600 p-3">
                Donated Food
              </th>
              <th className="border border-gray-400 dark:border-gray-600 p-3">
                Delivering Worker
              </th>
              <th className="border border-gray-400 dark:border-gray-600 p-3">
                Delivering Organization
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
                  <td className="border p-3">{place.placeName}</td>
                  <td className="border p-3">{place.placeState}</td>
                  <td className="border p-3">{place.placeCity}</td>
                  <td className="border p-3">{place.placeAddress}</td>
                  <td className="border p-3">{place.placePincode}</td>
                  <td className="border p-3">
                    {place.food ?? "Not donated yet"}
                  </td>
                  <td className="border p-3">
                    {place.worker ?? "No worker assigned"}
                  </td>
                  <td className="border p-3">
                    {place.organization ?? "No organization assigned"}
                  </td>
                  <td className="border p-3">
                    {place.food == null
                      ? "Not food available"
                      : place.isFoodDelivered
                      ? "Food Delivered"
                      : "Food Not Delivered"}
                  </td>
                  <td className="border p-3">
                    <button
                      className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600"
                      onClick={() => {
                        handleDonateAction(place._id);
                      }}
                    >
                      Donate on this Address
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4">
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
            <div className="max-h-80 overflow-x-auto mt-4">
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
                    availableFood.map((food) => (
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
                          {food?.foodDeliverAddress || "Not assigned yet"}
                        </td>
                        <td className="border border-gray-700 dark:border-gray-600 p-3">
                          {new Date(food?.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="border border-gray-700 dark:border-gray-600 p-3">
                          <button
                            className="cursor-pointer bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                            onClick={() => handleFoodSelect(food._id)}
                          >
                            Accept this food
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center p-4">
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
                  setError("");
                  setResult("");
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NearbyPlaces;
