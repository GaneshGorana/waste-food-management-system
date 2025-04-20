import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Menu, Settings2, X } from "lucide-react";
import AlertBox from "@/components/AlertBox";
import DashboardCard from "@/components/DashboardCard";
import DashboardTable from "@/components/DashboardTable";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/foodStore";
import {
  addFood,
  clearDataFood,
  deleteFood,
  updateDonorDetailsInFood,
  updateFood,
} from "@/features/dashboardData/food";
import LoadingScreen from "@/components/LoadingScreen";
import { useSocket } from "@/hooks/useSocket";
import AlertConfirmBox from "@/components/AlertConfirmBox";
import { jwtDecode } from "jwt-decode";
import { usePagination } from "@/hooks/usePagination";
import {
  clearAllCounts,
  setServiceWorkerStateCounts,
} from "@/features/dashboardData/count";

function ServiceWorkerDashboard() {
  const navigate = useNavigate();
  const token = document.cookie.split("token=")[1]?.split(";")[0];
  const serviceWorkerData = token
    ? jwtDecode<UserType>(decodeURIComponent(token))
    : null;
  useEffect(() => {
    if (!document.cookie.includes("token")) {
      navigate("/service-worker/login");
    }
  }, [navigate]);

  interface CountsType {
    totalPendingFoodDeliveries: number;
    totalAcceptedFoodDeliveries: number;
    totalCollectedFoodDeliveries: number;
    totalDeliveredFoodDeliveries: number;
    totalFoodDonations: number;
  }

  type FilterOptionTypes =
    | "allFoods"
    | "pendingFoodDeliveries"
    | "acceptedFoodDeliveries"
    | "collectedFoodDeliveries"
    | "deliveredFoods"
    | "expiryDate"
    | "VEGETARIAN"
    | "NON_VEGETARIAN"
    | "VEGAN";

  const [counts, setCounts] = useState<CountsType>({
    totalPendingFoodDeliveries: 0,
    totalAcceptedFoodDeliveries: 0,
    totalCollectedFoodDeliveries: 0,
    totalDeliveredFoodDeliveries: 0,
    totalFoodDonations: 0,
  });
  const [foods, setFoods] = useState<FoodType[]>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<ApiError>();
  const [result, setResult] = useState<ApiResult>();
  const [filterType, setFilterType] = useState<FilterOptionTypes>("allFoods");

  const [pagination, setPagination] = useState<{
    page: number;
    totalPages: number;
  }>({ page: 1, totalPages: 1 });

  const dispatch = useDispatch();
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
  } | null>(null);

  const socket = useSocket();

  const foodStateData = useSelector((state: RootState) => state.food.data);
  const foodStateDataRef = useRef(foodStateData);

  const countStateData = useSelector(
    (state: RootState) => state.count.serviceWorkerCounts
  );

  const {
    visitedPagesServiceWorker,
    addVisitedPagesServiceWorker,
    deleteVisitedPagesServiceWorker,
    clearVisitedPagesServiceWorker,
  } = usePagination();

  const paginationStateData = visitedPagesServiceWorker;

  useEffect(() => {
    foodStateDataRef.current = foodStateData;
  }, [foodStateData]);

  const fetchServiceWorkerDashboard = useCallback(
    async (page = 1, limit = 10) => {
      if (paginationStateData.has(page)) {
        const paginatedData = foodStateData.slice(
          (page - 1) * limit,
          page * limit
        );
        setFoods(paginatedData);
        setPagination((prev) => ({
          ...prev,
          page: page,
        }));
        setCounts(countStateData as unknown as CountsType);
        return;
      }
      addVisitedPagesServiceWorker(page);
      try {
        const { data } = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_ORIGIN_URL
          }/api/dashboard/service-worker?page=${page}&limit=${limit}`,
          { withCredentials: true }
        );
        setCounts(data.data.count);
        setPagination(data.data.pagination);
        setFoods(data.data?.foodDonations);
        setError(undefined);
        dispatch(
          addFood({
            data: data.data.foodDonations,
          })
        );
        dispatch(setServiceWorkerStateCounts(data.data.count));
        return;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error fetching food data:", error);
          setResult(undefined);
          setError(error.response?.data || "Error fetching food data");
        }
      }
    },
    [
      addVisitedPagesServiceWorker,
      countStateData,
      dispatch,
      foodStateData,
      paginationStateData,
    ]
  );

  useEffect(() => {
    fetchServiceWorkerDashboard(pagination.page, 10);
  }, [fetchServiceWorkerDashboard, pagination.page]);

  const handleWorkerDelete = async (user: UserType) => {
    setIsLoading({ isLoading: true, text: "Deleting Acount Service Worker" });
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }'/api/auth/service-worker/delete`,
        { _id: user._id },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setError(undefined);
        setResult(response.data);
        dispatch(clearDataFood());
        navigate("/");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error delete user:", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    } finally {
      setIsLoading({ isLoading: false, text: "" });
    }
  };

  const handleAcceptDelivery = async (foodId: FoodType["_id"]) => {
    setIsLoading({ isLoading: true, text: "Accepting delivery..." });
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/food/delivery-accept`,
        { foodId },
        { withCredentials: true }
      );
      if (result.status === 200) {
        setError(undefined);
        setResult(result.data);
        dispatch(updateFood({ _id: foodId, data: result.data.data }));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error accepting delivery:", error);
        setResult(undefined);
        setError(error.response?.data || "Error accepting delivery");
      }
    } finally {
      setIsLoading({ isLoading: false, text: "" });
    }
  };

  const handleCollectDelivery = async (foodId: FoodType["_id"]) => {
    setIsLoading({ isLoading: true, text: "Collecting delivery..." });
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/food/delivery-collect`,
        { foodId },
        { withCredentials: true }
      );
      if (result.status === 200) {
        setError(undefined);
        setResult(result.data);
        dispatch(updateFood({ _id: foodId, data: result.data.data }));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error collecting food:", error);
        setResult(undefined);
        setError(error.response?.data || "Error collecting food");
      }
    } finally {
      setIsLoading({ isLoading: false, text: "" });
    }
  };

  const handleCompleteDelivered = async (foodId: FoodType["_id"]) => {
    setIsLoading({ isLoading: true, text: "Completing delivery..." });
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/food/delivery-complete`,
        { foodId },
        { withCredentials: true }
      );
      if (result.status === 200) {
        setError(undefined);
        setResult(result.data);
        dispatch(updateFood({ _id: foodId, data: result.data.data }));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error marking food as delivered:", error);
        setResult(undefined);
        setError(error.response?.data || "Error marking food as delivered");
      }
      setResult(undefined);
    } finally {
      setIsLoading({ isLoading: false, text: "" });
    }
  };

  const handleWorkerLogout = async () => {
    setIsLoading({ isLoading: true, text: "Logging out..." });
    try {
      const result = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }/api/auth/service-worker/logout`,
        { withCredentials: true }
      );
      if (result.status === 200) {
        window.dispatchEvent(new Event("cookieRefresh"));
        setError(undefined);
        setResult(result.data);
        dispatch(clearDataFood());
        clearVisitedPagesServiceWorker();
        dispatch(clearAllCounts());
        navigate("/");
      }
      dispatch(clearDataFood());
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error logging out:", error);
        setResult(undefined);
        setError(error.response?.data || "Error logging out");
      }
    } finally {
      setIsLoading({ isLoading: false, text: "" });
    }
  };

  const handleToggleFilterOptions = (filter: FilterOptionTypes) => {
    setFilterType(filter);
  };

  const filterMapOfFoods = {
    allFoods: () => true,
    pendingFoodDeliveries: (food: FoodType) => food.status === "PENDING",
    acceptedFoodDeliveries: (food: FoodType) => food.status === "ACCEPTED",
    collectedFoodDeliveries: (food: FoodType) => food.status === "COLLECTED",
    deliveredFoods: (food: FoodType) => food.status === "DELIVERED",
    expiryDate: (food: FoodType) =>
      new Date(food?.expiryDate ?? 0) > new Date(),
    VEGETARIAN: (food: FoodType) => food.foodType === "VEGETARIAN",
    NON_VEGETARIAN: (food: FoodType) => food.foodType === "NON_VEGETARIAN",
    VEGAN: (food: FoodType) => food.foodType === "VEGAN",
  };

  const filteredFoods = foods?.filter(
    filterMapOfFoods[filterType] || (() => true)
  );

  const trackFoodEventAndUpdateState = useCallback(
    async (value: { foodId: string; eventType: string }) => {
      if (value.eventType === "INSERT") {
        const page = pagination.page;
        const limit = 10;

        const avgPages = Math.ceil(foodStateData.length / limit);

        if (foodStateData.length === 0) return;

        if (avgPages < pagination.totalPages) return;

        if (avgPages * limit == foodStateData.length) {
          setPagination((prev) => ({
            ...prev,
            totalPages: prev.totalPages + 1,
          }));
          return;
        }
        try {
          const { data } = await axios.post(
            `${
              import.meta.env.VITE_BACKEND_ORIGIN_URL
            }/api/data/get-data-by-id-of-food-for-service-worker`,
            { _id: value.foodId },
            { withCredentials: true }
          );

          setCounts(data.data?.count);

          const newFood = data.data.foodDonations[0];
          if (!newFood) return;

          dispatch(addFood({ data: [newFood] }));
          dispatch(setServiceWorkerStateCounts(data.data.count));

          for (let i = 0; i < pagination.totalPages; i++) {
            const startIdx = i * limit;
            const endIdx = startIdx + limit;
            const pageData = foodStateData.slice(startIdx, endIdx);

            if (pageData.length < limit) {
              if (page === i + 1) {
                setFoods([...pageData, newFood]);
              }
              return;
            }
          }

          setPagination((prev) => ({
            ...prev,
            totalPages: prev.totalPages + 1,
          }));
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("Error fetching inserted food", error);
            setResult(undefined);
            setError(error.response?.data as ApiError);
          }
        }
      }

      if (value.eventType === "UPDATE") {
        try {
          const { data } = await axios.post(
            `${
              import.meta.env.VITE_BACKEND_ORIGIN_URL
            }/api/data/get-data-by-id-of-food-for-service-worker`,
            { _id: value.foodId },
            { withCredentials: true }
          );

          const updatedFood = data.data.foodDonations[0];

          dispatch(updateFood({ _id: updatedFood._id, data: updatedFood }));
          dispatch(setServiceWorkerStateCounts(data.data.count));

          setCounts(data.data?.count);
          setFoods((prev) =>
            prev?.map((food) =>
              food._id === value.foodId ? updatedFood : food
            )
          );
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("Error fetching updated food:", error);
            setResult(undefined);
            setError(error.response?.data as ApiError);
          }
        }
      }

      if (value.eventType === "DELETE") {
        dispatch(deleteFood({ _id: value.foodId }));
        const page = pagination.page;
        const limit = 10;

        if (foodStateData.length === 0) return;

        const avgPages = Math.ceil(foodStateData.length / limit);
        if (avgPages < pagination.totalPages) return;

        const paginatedData = foodStateData.slice(
          (page - 1) * limit,
          page * limit
        );
        const updatedFoodData = paginatedData.filter(
          (food) => food._id !== value.foodId
        );

        const totalItemsAfterDelete = foodStateData.length - 1;
        const newTotalPages = Math.ceil(totalItemsAfterDelete / limit);

        if (updatedFoodData.length === 0 && page > 1) {
          setPagination((prev) => ({
            ...prev,
            totalPages: newTotalPages,
            page: prev.page - 1,
          }));
          const newData = foodStateData.slice(
            (page - 2) * limit,
            (page - 1) * limit
          );
          setFoods(newData);
          deleteVisitedPagesServiceWorker(page);
        } else {
          setFoods(updatedFoodData);
          setPagination((prev) => ({
            ...prev,
            totalPages: newTotalPages,
          }));
        }
      }
    },
    [
      deleteVisitedPagesServiceWorker,
      dispatch,
      foodStateData,
      pagination.page,
      pagination.totalPages,
    ]
  );

  useEffect(() => {
    socket
      ?.on("foodInserted", (data) => {
        trackFoodEventAndUpdateState(data);
      })
      .on("foodUpdated", (data) => {
        trackFoodEventAndUpdateState(data);
      })
      .on("foodDeleted", (data) => {
        trackFoodEventAndUpdateState(data);
      });

    return () => {
      socket?.off("foodInserted")?.off("foodUpdated")?.off("foodDeleted");
    };
  }, [trackFoodEventAndUpdateState, socket]);

  const trackDonorEventAndUpdateState = useCallback(
    async (value: { donorId: string }) => {
      try {
        const { data } = await axios.post(
          `${
            import.meta.env.VITE_BACKEND_ORIGIN_URL
          }/api/get-account-data/donor`,
          { _id: value.donorId },
          { withCredentials: true }
        );

        const donor = data.data as UserType;

        const updatedDonorData = {
          donorEmail: donor._id,
          donorName: donor.name,
          donorAddress: donor.address,
        };

        dispatch(
          updateDonorDetailsInFood({
            _id: donor._id,
            data: updatedDonorData,
          })
        );

        setFoods((prev) =>
          prev?.map((food) =>
            food.donorId === value.donorId
              ? {
                  ...food,
                  ...updatedDonorData,
                }
              : food
          )
        );
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error fetching updated donor:", error);
          setResult(undefined);
          setError(error.response?.data as ApiError);
        }
      }
    },
    [dispatch]
  );

  useEffect(() => {
    socket?.on("donorUpdated", (data) => {
      trackDonorEventAndUpdateState(data);
    });

    return () => {
      socket?.off("donorUpdated");
    };
  }, [socket, trackDonorEventAndUpdateState]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-4 mt-14 sm:mt-14 md:mt-18">
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Worker Dashboard</h1>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="cursor-pointer p-2 rounded-md bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition duration-200"
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-gray-800 dark:text-white" />
            ) : (
              <Menu className="w-6 h-6 text-gray-800 dark:text-white" />
            )}
          </button>
          {menuOpen && (
            <div className="z-10 absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-300 dark:border-gray-700">
              <button
                onClick={() => navigate("/settings")}
                className="cursor-pointer block w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Settings
              </button>
              <button
                onClick={() => navigate("/nearby-places")}
                className="cursor-pointer block w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Nearby Places
              </button>
              <button
                onClick={() => {
                  navigate("/dashboard/manage-account");
                  setMenuOpen(!menuOpen);
                }}
                className="cursor-pointer block w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Manage Account
              </button>
              <button
                onClick={() => {
                  setAlertConfirmMessage({
                    message: "Are you sure you want to Delete Account?",
                    messageType: "info",
                    cancelText: "Cancel",
                    confirmText: "Delete",
                    onConfirm: () => {
                      if (serviceWorkerData) {
                        handleWorkerDelete(serviceWorkerData);
                      }
                      setAlertConfirmMessage(null);
                    },
                  });
                  setMenuOpen(!menuOpen);
                }}
                className="cursor-pointer block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Delete Account
              </button>
              <button
                onClick={() => {
                  setAlertConfirmMessage({
                    message: "Are you sure you want to logout?",
                    messageType: "info",
                    cancelText: "Cancel",
                    confirmText: "Logout",
                    onConfirm: () => {
                      handleWorkerLogout();
                      setAlertConfirmMessage(null);
                    },
                  });
                  setMenuOpen(!menuOpen);
                }}
                className="cursor-pointer block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          text={"Total available food deliveries"}
          data={counts.totalFoodDonations}
          showDropdown={false}
          who={"service-workers"}
        />
        <DashboardCard
          text={"Total delivered food deliveries"}
          data={counts.totalDeliveredFoodDeliveries}
          showDropdown={false}
          who={"service-workers"}
        />
        <DashboardCard
          text={"Total pending deliveries"}
          data={counts.totalPendingFoodDeliveries}
          showDropdown={false}
          who={"service-workers"}
        />
        <DashboardCard
          text={"Total accepted deliveries"}
          data={counts.totalAcceptedFoodDeliveries}
          showDropdown={false}
          who={"service-workers"}
        />
        <DashboardCard
          text={"Total collected deliveries"}
          data={counts.totalCollectedFoodDeliveries}
          showDropdown={false}
          who={"service-workers"}
        />
        <DashboardCard
          text={"Filter Options For Table"}
          data={0}
          showDropdown={true}
          dropdownItems={[
            {
              label: "All Donations",
              handler: () => {
                handleToggleFilterOptions("allFoods");
              },
            },
            {
              label: "Pending Donations",
              handler: () => {
                handleToggleFilterOptions("pendingFoodDeliveries");
              },
            },
            {
              label: "Accepted Donations",
              handler: () => {
                handleToggleFilterOptions("acceptedFoodDeliveries");
              },
            },
            {
              label: "Collected Donations",
              handler: () => {
                handleToggleFilterOptions("collectedFoodDeliveries");
              },
            },
            {
              label: "Delivered Donations",
              handler: () => {
                handleToggleFilterOptions("deliveredFoods");
              },
            },
          ]}
          who={"service-workers"}
          Icon={Settings2}
        />
      </div>
      <h2 className="text-2xl font-bold mt-6">Table Overview</h2>
      <div className="overflow-x-auto mt-4">
        <DashboardTable
          data={filteredFoods || []}
          pagination={pagination}
          actions={{
            activate: {
              label: (food) =>
                food.status === "PENDING"
                  ? "Accept"
                  : food.status === "ACCEPTED"
                  ? "Collect"
                  : food.status === "COLLECTED"
                  ? "Mark Delivered"
                  : "Completed",
              handler: (values) => {
                const food = values as FoodType;
                if (food.status === "PENDING") handleAcceptDelivery(food._id);
                if (food.status === "ACCEPTED") handleCollectDelivery(food._id);
                if (food.status === "COLLECTED")
                  handleCompleteDelivered(food._id);
                if (food.status === "DELIVERED") return;
              },
              color: "bg-green-500 text-white",
            },
          }}
          onPageChange={(newPage) => fetchServiceWorkerDashboard(newPage)}
          who="SERVICE"
        />
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

export default ServiceWorkerDashboard;
