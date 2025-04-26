import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import axios from "axios";
import { Menu, Settings2, X } from "lucide-react";
import AlertBox from "../components/AlertBox";
import DashboardTable from "../components/DashboardTable";
import EditBox from "../components/EditBox";
import DashboardCard from "../components/DashboardCard";
import { useDispatch, useSelector } from "react-redux";
import {
  addFood,
  updateFood,
  deleteFood,
  clearDataFood,
  updateServiceWorkerDetailsInFood,
} from "../features/dashboardData/food.ts";
import { RootState } from "@/store/foodStore.ts";
import LoadingScreen from "@/components/LoadingScreen";
import AlertConfirmBox from "@/components/AlertConfirmBox.tsx";
import { jwtDecode } from "jwt-decode";
import { usePagination } from "@/hooks/usePagination.ts";
import {
  clearAllCounts,
  setDonorStateCounts,
} from "@/features/dashboardData/count.ts";
import { SearchFilterTable } from "@/components/SearchFilterTable.tsx";

function DonorDashboard() {
  const navigate = useNavigate();
  const token = document.cookie.split("token=")[1]?.split(";")[0];
  const userData = token
    ? jwtDecode<UserType>(decodeURIComponent(token))
    : null;

  interface CountsType {
    totalDonations: number;
    pendingDonations: number;
    collectedDonations: number;
  }

  const [counts, setCounts] = useState<CountsType>({
    totalDonations: 0,
    pendingDonations: 0,
    collectedDonations: 0,
  });

  const [foods, setFoods] = useState<FoodType[]>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<ApiError>();
  const [result, setResult] = useState<ApiResult>();
  const [thingValue, setThingValue] = useState<FoodType>();
  const [isEditModeOpen, setisEditModeOpen] = useState(false);
  const [filterType, setFilterType] =
    useState<keyof typeof filterMapOfFoods>("allFoods");

  const [pagination, setPagination] = useState<{
    page: number;
    totalPages: number;
  }>({ page: 1, totalPages: 1 });

  const [isSearchTableOn, setIsSearchTableOn] = useState(false);
  const [searchFilterTableData, setSearchFilterTableData] = useState<{
    name?: string;
    status?: "PENDING" | "ACCEPTED" | "COLLECTED" | "DELIVERED";
    startDate?: string;
  } | null>(null);

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

  useEffect(() => {
    if (!document.cookie.includes("token")) {
      navigate("/login");
    }
  }, [navigate]);

  const {
    visitedPagesDonor,
    getVisitedPagesData,
    addVisitedPagesDonor,
    deleteVisitedPagesDonor,
    clearVisitedPagesDonor,
  } = usePagination();

  const paginationStateData = visitedPagesDonor;

  const foodStateData = useSelector((state: RootState) => state.food.data);
  const foodStateDataRef = useRef(foodStateData);

  const countStateData = useSelector(
    (state: RootState) => state.count.donorCounts
  );

  useEffect(() => {
    foodStateDataRef.current = foodStateData;
  }, [foodStateData]);

  const fetchDonorDashboard = useCallback(
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
      addVisitedPagesDonor(page);
      try {
        const { data } = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_ORIGIN_URL
          }/api/dashboard/donor?page=${page}&limit=${limit}`,
          { withCredentials: true }
        );
        setCounts(data.data.counts);
        setPagination(data.data.pagination);
        setFoods(data.data.foodDonations);
        dispatch(
          addFood({
            data: data.data.foodDonations,
          })
        );

        dispatch(setDonorStateCounts(data.data.counts));
        return;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error logging out:", error);
          setResult(undefined);
          setError(error.response?.data as ApiError);
        }
      }
    },
    [
      addVisitedPagesDonor,
      countStateData,
      dispatch,
      foodStateData,
      paginationStateData,
    ]
  );

  useEffect(() => {
    fetchDonorDashboard(pagination.page, 10);
  }, [fetchDonorDashboard, pagination.page]);

  const filterMapOfFoods = {
    allFoods: () => true,
    pendingFoodDeliveries: (food: FoodType) => food.status === "PENDING",
    acceptedFoodDeliveries: (food: FoodType) => food.status === "ACCEPTED",
    collectedFoodDeliveries: (food: FoodType) => food.status === "COLLECTED",
    deliveredFoods: (food: FoodType) => food.status === "DELIVERED",
  };

  const filteredFoods = foods?.filter(
    filterMapOfFoods[filterType] ?? (() => true)
  );

  const handleUserLogout = async () => {
    setIsLoading({ isLoading: true, text: "Logging out" });
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/auth/user/logout`,
        { withCredentials: true }
      );
      if (result.status === 200) {
        window.dispatchEvent(new Event("cookieRefresh"));
        setError(undefined);
        setResult(result.data);
        dispatch(clearDataFood());
        dispatch(clearAllCounts());
        clearVisitedPagesDonor();
        navigate("/");
      }
      dispatch(clearDataFood());
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error logging out:", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    } finally {
      setIsLoading({ isLoading: false, text: "" });
    }
  };

  const handleToggleEditMode = (value: FoodType) => {
    setisEditModeOpen((prev) => !prev);
    setThingValue(value);
  };

  const handleDeleteUser = async (user: UserType) => {
    setIsLoading({ isLoading: true, text: "Deleting Acount" });
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/auth/user/delete`,
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

  const handleDeleteFood = async (food: FoodType) => {
    setIsLoading({ isLoading: true, text: "Deleting Food" });
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/food/delete`,
        { _id: food._id },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setError(undefined);
        setResult(response.data);
        dispatch(deleteFood({ _id: food._id }));
        setFoods((prev) => prev?.filter((item) => item._id !== food._id) || []);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error food delete:", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    } finally {
      setIsLoading({ isLoading: false, text: "" });
    }
  };

  const handleFoodUpdate = async (data: FoodType) => {
    setIsLoading({ isLoading: true, text: "Updating Food" });
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/food/update`,
        { ...data, acceptedBy: data.acceptedById },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setError(undefined);
        setResult(response.data);
        dispatch(
          updateFood({
            _id: data._id,
            data: data,
          })
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error food update:", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    } finally {
      setIsLoading({ isLoading: false, text: "" });
    }
  };

  const handleToggleFilterOptions = (filter: keyof typeof filterMapOfFoods) => {
    setFilterType(filter);
  };

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
            }/api/data/get-data-by-id-of-food-for-donor`,
            { _id: value.foodId },
            { withCredentials: true }
          );

          setCounts(data.data?.counts);

          const newFood = data.data.foodDonations[0];
          if (!newFood) return;

          dispatch(addFood({ data: [newFood] }));
          dispatch(setDonorStateCounts(data.data.counts));

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
            }/api/data/get-data-by-id-of-food-for-donor`,
            { _id: value.foodId },
            { withCredentials: true }
          );

          const updatedFood = data.data.foodDonations[0];

          dispatch(updateFood({ _id: updatedFood._id, data: updatedFood }));
          dispatch(setDonorStateCounts(data.data.counts));

          setCounts(data.data?.counts);
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
          deleteVisitedPagesDonor(page);
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
      deleteVisitedPagesDonor,
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

  const trackServiceWorkerEventAndUpdateState = useCallback(
    async (value: { serviceWorkerId: string }) => {
      try {
        const { data } = await axios.post(
          `${
            import.meta.env.VITE_BACKEND_ORIGIN_URL
          }/api/get-account-data/service-worker`,
          { _id: value.serviceWorkerId },
          { withCredentials: true }
        );

        const serviceWorker = data.data as ServiceWorkerType;

        const updatedServiceWorkerData = {
          acceptedById: serviceWorker._id,
          acceptedBy: serviceWorker.name,
        };

        dispatch(
          updateServiceWorkerDetailsInFood({
            _id: serviceWorker._id,
            data: updatedServiceWorkerData,
          })
        );

        setFoods((prev) =>
          prev?.map((food) =>
            food.acceptedById === value.serviceWorkerId
              ? {
                  ...food,
                  ...updatedServiceWorkerData,
                }
              : food
          )
        );
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error fetching updated service worker:", error);
          setResult(undefined);
          setError(error.response?.data as ApiError);
        }
      }
    },
    [dispatch]
  );

  useEffect(() => {
    socket?.on("serviceWorkerUpdated", (data) => {
      trackServiceWorkerEventAndUpdateState(data);
    });

    return () => {
      socket?.off("serviceWorkerUpdated");
    };
  }, [socket, trackServiceWorkerEventAndUpdateState]);

  interface SearchFilterDataType {
    foodName?: string;
    status?: "PENDING" | "ACCEPTED" | "COLLECTED" | "DELIVERED";
    startDate?: string;
  }

  const handleSearchFilterTable = async (
    data: SearchFilterDataType | null,
    page: number,
    limit: number
  ) => {
    setIsSearchTableOn(true);
    try {
      const result = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }/api/search-filter-table/get-search-filter-table-for-donor?page=${page}&limit=${limit}`,
        data,
        { withCredentials: true }
      );
      setFoods(result.data.data.foodDonations);
      setPagination(result.data.data.pagination);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error searching food:", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-4 mt-14 sm:mt-14 md:mt-18">
      <LoadingScreen isLoading={isLoading.isLoading} text={isLoading.text} />
      {(error || result) && (
        <AlertBox
          message={error?.message || (result?.message as string)}
          onClose={() => {
            setError(undefined);
            setResult(undefined);
          }}
          messageType={error?.messageType || result?.messageType || "info"}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Donor Dashboard</h1>
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
                onClick={() => {
                  navigate("/settings");
                  setMenuOpen(!menuOpen);
                }}
                className="cursor-pointer block w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Settings
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
                    message: "Are you sure you want to Delete your Account?",
                    messageType: "info",
                    cancelText: "Cancel",
                    confirmText: "Delete",
                    onConfirm: () => {
                      if (userData) {
                        handleDeleteUser(userData);
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
                      handleUserLogout();
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
          text="Total Donations"
          data={counts?.totalDonations || 0}
          showDropdown={false}
          who="users"
        />
        <DashboardCard
          text={"Total Pending Donations"}
          data={counts?.pendingDonations || 0}
          showDropdown={false}
          who={"users"}
        />
        <DashboardCard
          text={"Total Collected Donations"}
          data={counts?.collectedDonations || 0}
          showDropdown={false}
          who={"users"}
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
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg mt-6">
        <div className="items-center mb-6 relative">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center w-full">
            Table Overview
          </h3>
        </div>
        <SearchFilterTable
          fields={[
            { label: "Food name", key: "foodName", type: "text" },
            {
              label: "Status",
              key: "status",
              type: "select",
              options: ["PENDING", "ACCEPTED", "COLLECTED", "DELIVERED"],
            },
            { label: "Made Date of food after", key: "madeDate", type: "date" },
          ]}
          onSearch={(data) => {
            setSearchFilterTableData(data);
            handleSearchFilterTable(data, 1, 10);
          }}
          onClear={() => {
            setIsSearchTableOn(false);
            setFoods(undefined);
            setPagination(getVisitedPagesData(visitedPagesDonor));
            fetchDonorDashboard(1, 10);
          }}
        />
        <DashboardTable
          data={filteredFoods || []}
          pagination={pagination}
          actions={{
            activate: {
              label: "Update",
              handler: (food) => {
                if (food?.status !== "PENDING") {
                  setAlertConfirmMessage({
                    message: "You can only update food if it is not accepted.",
                    messageType: "warning",
                    cancelText: "Cancel",
                    confirmText: "OK",
                    onConfirm: () => {
                      setAlertConfirmMessage(null);
                    },
                  });
                  return;
                }
                handleToggleEditMode(food as FoodType);
              },
              color: "bg-green-500 text-white",
            },
            delete: {
              label: "Delete",
              handler: (food) => {
                if (food?.status !== "PENDING") {
                  setAlertConfirmMessage({
                    message: "Food can not be deleted after got accepted.",
                    messageType: "warning",
                    cancelText: "Cancel",
                    confirmText: "OK",
                    onConfirm: () => {
                      setAlertConfirmMessage(null);
                    },
                  });
                  return;
                }
                setAlertConfirmMessage({
                  message: "Are you sure you want to delete this food?",
                  messageType: "info",
                  cancelText: "Cancel",
                  confirmText: "Delete",
                  onConfirm: () => {
                    handleDeleteFood(food as FoodType);
                    setAlertConfirmMessage(null);
                  },
                });
              },
              color: "bg-red-500 text-white",
            },
          }}
          onPageChange={(newPage) => {
            if (isSearchTableOn) {
              handleSearchFilterTable(searchFilterTableData, newPage, 10);
              return;
            }
            fetchDonorDashboard(newPage, 10);
          }}
          who="DONOR"
        />
      </div>
      {isEditModeOpen && thingValue && (
        <EditBox
          data={thingValue}
          isNullValuesAllowed={false}
          readOnlyFields={[
            "_id",
            "foodImage",
            "foodType",
            "foodDeliverAddress",
            "status",
            "madeDate",
            "expiryDate",
            "latitude",
            "longitude",
          ]}
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
              message: "Proceed to update food?",
              messageType: "info",
              cancelText: "Cancel",
              confirmText: "Update",
              onConfirm: () => {
                handleFoodUpdate(data);
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

export default DonorDashboard;
