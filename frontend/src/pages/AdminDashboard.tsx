import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket.js";
import axios from "axios";
import { Settings, Settings2, X } from "lucide-react";
import EditBox from "../components/EditBox.tsx";
import AlertBox from "@/components/AlertBox.tsx";
import DashboardTable from "@/components/DashboardTable.tsx";
import DashboardCard from "@/components/DashboardCard.tsx";
import DashboardValueUpdater from "@/components/DashboardValueUpdater.tsx";
import AlertConfirmBox from "@/components/AlertConfirmBox.tsx";
import { useSelector, useDispatch } from "react-redux";
import LoadingScreen from "@/components/LoadingScreen";
import { RootState } from "@/store/foodStore.ts";
import {
  addDonor,
  clearDataDonor,
  deleteDonor,
  updateDonor,
} from "@/features/dashboardData/donor.ts";
import {
  addFood,
  clearDataFood,
  deleteFood,
  updateFood,
} from "@/features/dashboardData/food.ts";
import {
  addServiceWorker,
  clearDataServiceWorker,
  deleteServiceWorker,
  updateServiceWorker,
} from "@/features/dashboardData/serviceWorker.ts";
import { jwtDecode } from "jwt-decode";
import { usePagination } from "@/hooks/usePagination.ts";
import {
  setDonorStateCounts,
  setFoodStateCounts,
  setServiceWorkerStateCounts,
} from "@/features/dashboardData/count.ts";
import { SearchFilterTable } from "@/components/SearchFilterTable.tsx";

function AdminDashboard() {
  const navigate = useNavigate();
  const token = document.cookie.split("token=")[1]?.split(";")[0];

  useEffect(() => {
    if (!document.cookie.includes("token")) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const userData = token
    ? jwtDecode<UserType>(decodeURIComponent(token))
    : null;

  type DonorCountType = {
    totalUsers: number;
  };

  type ServiceWorkerCountType = {
    totalActiveWorkers: number;
    totalPendingApprovals: number;
    totalServiceWorkers: number;
  };

  type FoodCountType = {
    totalPendingFoodDeliveries: number;
    totalAcceptedFoodDeliveries: number;
    totalCollectedFoodDeliveries: number;
    totalDeliveredFoodDeliveries: number;
    totalFoodDonations: number;
  };

  const [donorCounts, setDonorCounts] = useState<DonorCountType>({
    totalUsers: 0,
  });
  const [serviceWorkerCounts, setServiceWorkerCounts] =
    useState<ServiceWorkerCountType>({
      totalActiveWorkers: 0,
      totalPendingApprovals: 0,
      totalServiceWorkers: 0,
    });
  const [foodCounts, setFoodCounts] = useState<FoodCountType>({
    totalAcceptedFoodDeliveries: 0,
    totalCollectedFoodDeliveries: 0,
    totalDeliveredFoodDeliveries: 0,
    totalPendingFoodDeliveries: 0,
    totalFoodDonations: 0,
  });

  const [users, setUsers] = useState<UserType[]>();
  const [foods, setFoods] = useState<FoodType[] | undefined>([]);
  const [serviceWorkers, setServiceWorkers] = useState<ServiceWorkerType[]>();
  const [menuOpen, setMenuOpen] = useState(false);

  type ThingValueType = FoodType | UserType | ServiceWorkerType;
  const [thingValue, setThingValue] = useState<ThingValueType | null>(null);

  const [thingValueUpdate, setThingValueUpdate] = useState<{
    title: string;
    fields?: { text: string; asValue: string }[];
    type?: string;
  } | null>(null);

  const [isEditModeOpen, setisEditModeOpen] = useState(false);
  const [isValueUpdateModeOpen, setIsValueUpdateModeOpen] = useState(false);
  const [dropdownReset, setDropdownReset] = useState<() => void>(
    () => () => {}
  );

  const filterMapOfServiceWorkers = {
    all: () => true,
    pendingApprovals: (worker: ServiceWorkerType) =>
      worker.accountStatus === "INACTIVE",
    activeWorkers: (worker: ServiceWorkerType) =>
      worker.accountStatus === "ACTIVE",
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

  type FilterTypeForFilterDocs =
    | keyof typeof filterMapOfFoods
    | keyof typeof filterMapOfServiceWorkers;

  const [filterType, setFilterType] =
    useState<FilterTypeForFilterDocs>("allFoods");

  const [error, setError] = useState<ApiError>();
  const [result, setResult] = useState<ApiResult>();
  const [activeCategory, setActiveCategory] = useState<
    "donor" | "serviceWorker" | "food"
  >("donor");

  type PaginationType = {
    page: number;
    totalPages: number;
  };

  const [paginationDonor, setPaginationDonor] = useState<PaginationType>({
    page: 1,
    totalPages: 1,
  });
  const [paginationFood, setPaginationFood] = useState<PaginationType>({
    page: 1,
    totalPages: 1,
  });
  const [paginationServiceWorker, setPaginationServiceWorker] =
    useState<PaginationType>({ page: 1, totalPages: 1 });

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
    socket?.on("demo", (data) => {
      console.log(data);
    });
  }, [socket]);

  const {
    getVisitedPagesData,
    visitedPagesDonor,
    addVisitedPagesDonor,
    deleteVisitedPagesDonor,
    clearVisitedPagesDonor,
    visitedPagesServiceWorker,
    addVisitedPagesServiceWorker,
    deleteVisitedPagesServiceWorker,
    clearVisitedPagesServiceWorker,
    visitedPagesFood,
    addVisitedPagesFood,
    deleteVisitedPagesFood,
    clearVisitedPagesFood,
  } = usePagination();

  const foodStateData = useSelector((state: RootState) => state.food.data);
  const donorStateData = useSelector((state: RootState) => state.donor.data);
  const serviceWorkerStateData = useSelector(
    (state: RootState) => state.serviceWorker.data
  );

  const foodStateDataRef = useRef(foodStateData);
  const donorStateDataRef = useRef(donorStateData);
  const serviceWorkerStateDataRef = useRef(serviceWorkerStateData);

  const foodCountStateData = useSelector(
    (state: RootState) => state.count.foodCounts
  );
  const donorCountStateData = useSelector(
    (state: RootState) => state.count.donorCounts
  );
  const serviceWorkerCountStateData = useSelector(
    (state: RootState) => state.count.serviceWorkerCounts
  );

  const [isSearchTableForDonorOn, setIsSearchTableForDonorOn] = useState(false);
  const [isSearchTableForServiceWorkerOn, setIsSearchTableForServiceWorkerOn] =
    useState(false);
  const [isSearchTableForFoodOn, setIsSearchTableForFoodOn] = useState(false);

  const [searchFilterTableDataForDonor, setSearchFilterTableDataForDonor] =
    useState<{
      donorName?: string;
      email?: string;
      createdAt?: string;
    } | null>(null);

  const [
    searchFilterTableDataForServiceWorker,
    setSearchFilterTableDataForServiceWorker,
  ] = useState<{
    workerName?: string;
    email?: string;
    createdAt?: string;
  } | null>(null);

  const [searchFilterTableDataForFood, setSearchFilterTableDataForFood] =
    useState<{
      foodName?: string;
      donordName?: string;
      donorEmail?: string;
      workerName?: string;
      workerEmail?: string;
      status?: "PENDING" | "ACCEPTED" | "COLLECTED" | "DELIVERED";
      madeDate?: string;
    } | null>(null);

  useEffect(() => {
    foodStateDataRef.current = foodStateData;
  }, [foodStateData]);

  useEffect(() => {
    donorStateDataRef.current = donorStateData;
  }, [donorStateData]);

  useEffect(() => {
    serviceWorkerStateDataRef.current = serviceWorkerStateData;
  }, [serviceWorkerStateData]);

  const fetchAdminDashboard = useCallback(
    async (page = 1, limit = 10) => {
      const isDonor = activeCategory === "donor";
      const isServiceWorker = activeCategory === "serviceWorker";
      const isFood = activeCategory === "food";

      if (isFood && visitedPagesFood.has(page)) {
        const paginatedData = foodStateData.slice(
          (page - 1) * limit,
          page * limit
        );
        setFoods(paginatedData);
        setFoodCounts(foodCountStateData as unknown as FoodCountType);
        setPaginationFood((prev) => ({ ...prev, page }));
        setIsLoading({ isLoading: false, text: "" });
        return;
      }

      if (isDonor && visitedPagesDonor.has(page)) {
        const paginatedData = donorStateData.slice(
          (page - 1) * limit,
          page * limit
        );
        setUsers(paginatedData);
        setDonorCounts(donorCountStateData as unknown as DonorCountType);
        setPaginationDonor((prev) => ({ ...prev, page }));
        setIsLoading({ isLoading: false, text: "" });
        return;
      }

      if (isServiceWorker && visitedPagesServiceWorker.has(page)) {
        const paginatedData = serviceWorkerStateData.slice(
          (page - 1) * limit,
          page * limit
        );
        setServiceWorkers(paginatedData);
        setServiceWorkerCounts(
          serviceWorkerCountStateData as unknown as ServiceWorkerCountType
        );
        setPaginationServiceWorker((prev) => ({ ...prev, page }));
        setIsLoading({ isLoading: false, text: "" });
        return;
      }
      // Add visited
      if (isFood) addVisitedPagesFood(page);
      if (isDonor) addVisitedPagesDonor(page);
      if (isServiceWorker) addVisitedPagesServiceWorker(page);

      try {
        if (isDonor) {
          setIsLoading({ isLoading: true, text: "Loading..." });
          const { data } = await axios.get(
            `${
              import.meta.env.VITE_BACKEND_ORIGIN_URL
            }/api/dashboard/admin-user?page=${page}&limit=${limit}`,
            { withCredentials: true }
          );
          setIsLoading({ isLoading: false, text: "" });
          setDonorCounts(data.data?.count);

          dispatch(setDonorStateCounts(data.data?.count));
          dispatch(addDonor({ data: data.data?.users }));

          setPaginationDonor(data.data?.pagination);
          setUsers(data.data?.users);
        }

        if (isServiceWorker) {
          setIsLoading({ isLoading: true, text: "Loading..." });
          const { data } = await axios.get(
            `${
              import.meta.env.VITE_BACKEND_ORIGIN_URL
            }/api/dashboard/admin-service-worker?page=${page}&limit=${limit}`,
            { withCredentials: true }
          );
          setIsLoading({ isLoading: false, text: "" });
          setServiceWorkerCounts(data.data?.count);

          dispatch(setServiceWorkerStateCounts(data.data?.count));
          dispatch(
            addServiceWorker({
              data: data.data?.serviceWorkers,
            })
          );

          setPaginationServiceWorker(data.data?.pagination);
          setServiceWorkers(data.data?.serviceWorkers);
        }

        if (isFood) {
          setIsLoading({ isLoading: true, text: "Loading..." });
          const { data } = await axios.get(
            `${
              import.meta.env.VITE_BACKEND_ORIGIN_URL
            }/api/dashboard/admin-food?page=${page}&limit=${limit}`,
            { withCredentials: true }
          );
          setIsLoading({ isLoading: false, text: "" });
          setFoodCounts(data.data?.count);

          dispatch(setFoodStateCounts(data.data?.count));
          dispatch(
            addFood({
              data: data.data?.foodDonations,
            })
          );

          setPaginationFood(data.data?.pagination);
          setFoods(data.data?.foodDonations);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error fetching admin dashboard", error);
          setResult(undefined);
          setError(error.response?.data as ApiError);
        }
      }
    },
    [
      activeCategory,
      addVisitedPagesDonor,
      addVisitedPagesFood,
      addVisitedPagesServiceWorker,
      dispatch,
      donorCountStateData,
      donorStateData,
      foodCountStateData,
      foodStateData,
      serviceWorkerCountStateData,
      serviceWorkerStateData,
      visitedPagesDonor,
      visitedPagesFood,
      visitedPagesServiceWorker,
    ]
  );

  useEffect(() => {
    const page =
      activeCategory === "donor"
        ? paginationDonor.page
        : activeCategory === "food"
        ? paginationFood.page
        : paginationServiceWorker.page;

    if (activeCategory === "food") {
      fetchAdminDashboard(page, 10);
    }

    if (activeCategory === "donor") {
      fetchAdminDashboard(page, 10);
    }

    if (activeCategory === "serviceWorker") {
      fetchAdminDashboard(page, 10);
    }
  }, [
    activeCategory,
    fetchAdminDashboard,
    paginationDonor.page,
    paginationFood.page,
    paginationServiceWorker.page,
  ]);

  const handleServiceWorkerUpdate = async (data: ServiceWorkerType) => {
    setIsLoading({ isLoading: true, text: "Updating..." });
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }/api/auth/service-worker/update`,
        data,
        { withCredentials: true }
      );
      if (response.status === 200) {
        setError(undefined);
        setResult(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error updating service worker:", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    } finally {
      setIsLoading({ isLoading: false, text: "" });
    }
  };

  const handleFoodUpdate = async (data: FoodType) => {
    setIsLoading({ isLoading: true, text: "Updating..." });
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/food/update`,
        { ...data, acceptedBy: data.acceptedById },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setError(undefined);
        setResult(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error updating food:", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    } finally {
      setIsLoading({ isLoading: false, text: "" });
    }
  };

  const handleUserUpdate = async (data: UserType) => {
    setIsLoading({ isLoading: true, text: "Updating..." });
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/auth/user/update`,
        data,
        { withCredentials: true }
      );
      if (response.status === 200) {
        setError(undefined);
        setResult(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error updating user:", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    } finally {
      setIsLoading({ isLoading: false, text: "" });
    }
  };

  const handleDeleteDonor = async (user: UserType) => {
    setIsLoading({ isLoading: true, text: "Deleting Acount Donor" });
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/auth/user/delete`,
        { _id: user._id },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setError(undefined);
        setResult(response.data);
        dispatch(deleteDonor({ _id: user._id }));
        setUsers((prev) =>
          prev?.filter((userData) => userData._id !== user._id)
        );
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

  const handleDeleteServiceWorker = async (serviceWorker: UserType) => {
    setIsLoading({ isLoading: true, text: "Deleting Acount Service Worker" });
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }'/api/auth/service-worker/delete`,
        { _id: serviceWorker._id },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setError(undefined);
        setResult(response.data);
        dispatch(deleteServiceWorker({ _id: serviceWorker._id }));
        setServiceWorkers(
          (prev) =>
            prev?.filter((worker) => worker._id !== serviceWorker._id) || []
        );
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

  const handleToggleEditMode = (value: ThingValueType) => {
    setisEditModeOpen((prev) => !prev);
    setThingValue(value);
  };

  const handleToggleValueUpdateMode = (resetDropdown = () => {}) => {
    setIsValueUpdateModeOpen((prev) => !prev);
    setDropdownReset(() => resetDropdown);
  };

  const handleToggleFilterOptions = (filter: FilterTypeForFilterDocs) => {
    setFilterType(filter);
  };

  const filteredServiceWorkers = serviceWorkers?.filter(
    filterMapOfServiceWorkers[
      filterType as keyof typeof filterMapOfServiceWorkers
    ] ?? (() => true)
  );

  const filteredFoods = foods?.filter(
    filterMapOfFoods[filterType as keyof typeof filterMapOfFoods] ??
      (() => true)
  );

  const handleApproveWorker = async (_id: ServiceWorkerType["_id"]) => {
    setIsLoading({ isLoading: true, text: "Approving..." });
    try {
      console.log("Approving worker:", _id);
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }/api/auth/service-worker/approve`,
        { _id },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setError(undefined);
        setResult(response?.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error approving worker:", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    } finally {
      setIsLoading({ isLoading: false, text: "" });
    }
  };

  const handleRejectWorker = async (_id: ServiceWorkerType["_id"]) => {
    setIsLoading({ isLoading: true, text: "Rejecting..." });
    try {
      console.log("Rejecting worker:", _id);
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }/api/auth/service-worker/reject`,
        { _id },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setError(undefined);
        setResult(response?.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error rejecting worker:", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    } finally {
      setIsLoading({ isLoading: false, text: "" });
    }
  };

  const handleFoodAddToServiceWorker = async (data: {
    foodId: string;
    serviceWorkerId: string;
    foodDeliverAddress: string;
  }) => {
    setIsLoading({ isLoading: true, text: "Adding food..." });
    try {
      console.log("Adding food to worker:", data);
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }/api/food/service-worker/add`,
        data,
        { withCredentials: true }
      );
      if (response.status === 200) {
        setError(undefined);
        setResult(response?.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error adding food to worker:", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    } finally {
      setIsLoading({ isLoading: false, text: "" });
    }
  };

  const handleAdminLogout = async () => {
    setIsLoading({ isLoading: true, text: "Logging out..." });
    try {
      const result = await axios.get(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/auth/admin/logout`,
        { withCredentials: true }
      );
      if (result.status === 200) {
        window.dispatchEvent(new Event("cookieRefresh"));
        setError(undefined);
        setResult(result.data);
        dispatch(clearDataFood());
        dispatch(clearDataDonor());
        dispatch(clearDataServiceWorker());
        clearVisitedPagesFood();
        clearVisitedPagesDonor();
        clearVisitedPagesServiceWorker();
        navigate("/");
      }
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

  const handleDeleteAdmin = async (user: UserType) => {
    setIsLoading({ isLoading: true, text: "Deleting..." });
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/auth/admin/delete`,
        { _id: user._id },
        { withCredentials: true }
      );
      if (response.status === 200) {
        window.dispatchEvent(new Event("cookieRefresh"));
        setError(undefined);
        setResult(response.data);
        dispatch(clearDataFood());
        dispatch(clearDataDonor());
        dispatch(clearDataServiceWorker());
        navigate("/");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error deleting user:", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    } finally {
      setIsLoading({ isLoading: false, text: "" });
    }
  };

  ///////////////// donor area /////////////////////

  const trackDonorEventAndUpdateState = useCallback(
    async (value: { donorId: string; eventType: string }) => {
      if (value.eventType === "INSERT") {
        const page = paginationDonor.page;
        const limit = 10;

        const avgPages = Math.ceil(donorStateData.length / limit);

        if (donorStateData.length === 0) return;

        if (avgPages < paginationDonor.totalPages) return;

        if (avgPages * limit == donorStateData.length) {
          setPaginationDonor((prev) => ({
            ...prev,
            totalPages: prev.totalPages + 1,
          }));
          return;
        }
        try {
          const { data } = await axios.post(
            `${
              import.meta.env.VITE_BACKEND_ORIGIN_URL
            }/api/data/get-data-by-id-of-donor-for-admin`,
            { _id: value.donorId },
            { withCredentials: true }
          );

          setDonorCounts(data.data?.count);

          const newUser = data.data.users[0];
          if (!newUser) return;
          dispatch(addDonor({ data: [newUser] }));

          for (let i = 0; i < paginationDonor.totalPages; i++) {
            const startIdx = i * limit;
            const endIdx = startIdx + limit;
            const pageData = donorStateData.slice(startIdx, endIdx);

            if (pageData.length < limit) {
              if (page === i + 1) {
                setUsers([...pageData, newUser]);
              }
              return;
            }
          }

          setPaginationDonor((prev) => ({
            ...prev,
            totalPages: prev.totalPages + 1,
          }));
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("Error fetching inserted donor", error);
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
            }/api/data/get-data-by-id-of-donor-for-admin`,
            { _id: value.donorId },
            { withCredentials: true }
          );

          const updatedUser = data.data.users[0];

          dispatch(updateDonor({ _id: updatedUser._id, data: updatedUser }));

          setUsers((prev) =>
            prev?.map((user) =>
              user._id === value.donorId ? updatedUser : user
            )
          );
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("Error fetching updated donor:", error);
            setResult(undefined);
            setError(error.response?.data as ApiError);
          }
        }
      }

      if (value.eventType === "DELETE") {
        dispatch(deleteDonor({ _id: value.donorId }));

        const { data } = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_ORIGIN_URL
          }/api/count/get-count-by-id-of-donor-for-admin`,
          { withCredentials: true }
        );

        setDonorCounts(data.data?.count);

        const page = paginationDonor.page;
        const limit = 10;

        if (donorStateData.length === 0) return;

        const avgPages = Math.ceil(donorStateData.length / limit);
        if (avgPages < paginationDonor.totalPages) return;

        const paginatedData = donorStateData.slice(
          (page - 1) * limit,
          page * limit
        );
        const updatedUser = paginatedData.filter(
          (user) => user._id !== value.donorId
        );

        const totalItemsAfterDelete = donorStateData.length - 1;
        const newTotalPages = Math.ceil(totalItemsAfterDelete / limit);

        if (updatedUser.length === 0 && page > 1) {
          setPaginationDonor((prev) => ({
            ...prev,
            totalPages: newTotalPages,
            page: prev.page - 1,
          }));
          const newData = donorStateData.slice(
            (page - 2) * limit,
            (page - 1) * limit
          );
          setUsers(newData);
          deleteVisitedPagesDonor(page);
        } else {
          setUsers(updatedUser);
          setPaginationDonor((prev) => ({
            ...prev,
            totalPages: newTotalPages,
          }));
        }
      }
    },
    [
      deleteVisitedPagesDonor,
      dispatch,
      donorStateData,
      paginationDonor.page,
      paginationDonor.totalPages,
    ]
  );

  useEffect(() => {
    socket
      ?.on("donorInserted", (data) => {
        trackDonorEventAndUpdateState(data);
      })
      .on("donorUpdated", (data) => {
        trackDonorEventAndUpdateState(data);
      })
      .on("donorDeleted", (data) => {
        trackDonorEventAndUpdateState(data);
      });

    return () => {
      socket?.off("donorInserted")?.off("donorUpdated")?.off("donorDeleted");
    };
  }, [trackDonorEventAndUpdateState, socket]);

  ////////////////// food area /////////////////////
  const trackFoodEventAndUpdateState = useCallback(
    async (value: { foodId: string; eventType: string }) => {
      if (value.eventType === "INSERT") {
        const page = paginationFood.page;
        const limit = 10;

        const avgPages = Math.ceil(foodStateData.length / limit);

        if (foodStateData.length === 0) return;

        if (avgPages < paginationFood.totalPages) return;

        if (avgPages * limit == foodStateData.length) {
          setPaginationFood((prev) => ({
            ...prev,
            totalPages: prev.totalPages + 1,
          }));
          return;
        }
        try {
          const { data } = await axios.post(
            `${
              import.meta.env.VITE_BACKEND_ORIGIN_URL
            }/api/data/get-data-by-id-of-food-for-admin`,
            { _id: value.foodId },
            { withCredentials: true }
          );

          setFoodCounts(data.data?.count);

          const newFood = data.data.foodDonations[0];
          if (!newFood) return;
          dispatch(addFood({ data: [newFood] }));

          for (let i = 0; i < paginationFood.totalPages; i++) {
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

          setPaginationFood((prev) => ({
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
            }/api/data/get-data-by-id-of-food-for-admin`,
            { _id: value.foodId },
            { withCredentials: true }
          );

          const updatedFood = data.data.foodDonations[0];
          dispatch(updateFood({ _id: updatedFood._id, data: updatedFood }));

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

        const { data } = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_ORIGIN_URL
          }/api/count/get-count-by-id-of-food-for-admin`,
          { withCredentials: true }
        );

        setFoodCounts(data.data?.count);

        const page = paginationFood.page;
        const limit = 10;

        if (foodStateData.length === 0) return;

        const avgPages = Math.ceil(foodStateData.length / limit);
        if (avgPages < paginationFood.totalPages) return;

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
          setPaginationFood((prev) => ({
            ...prev,
            totalPages: newTotalPages,
            page: prev.page - 1,
          }));
          const newData = foodStateData.slice(
            (page - 2) * limit,
            (page - 1) * limit
          );
          setFoods(newData);
          deleteVisitedPagesFood(page);
        } else {
          setFoods(updatedFoodData);
          setPaginationFood((prev) => ({
            ...prev,
            totalPages: newTotalPages,
          }));
        }
      }
    },
    [
      deleteVisitedPagesFood,
      dispatch,
      foodStateData,
      paginationFood.page,
      paginationFood.totalPages,
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

  ///////////////// service worker area /////////////////

  const trackServiceWorkerEventAndUpdateState = useCallback(
    async (value: { serviceWorkerId: string; eventType: string }) => {
      if (value.eventType === "INSERT") {
        const page = paginationServiceWorker.page;
        const limit = 10;

        const avgPages = Math.ceil(serviceWorkerStateData.length / limit);

        if (serviceWorkerStateData.length === 0) return;

        if (avgPages < paginationServiceWorker.totalPages) return;

        if (avgPages * limit == serviceWorkerStateData.length) {
          setPaginationServiceWorker((prev) => ({
            ...prev,
            totalPages: prev.totalPages + 1,
          }));
          return;
        }
        try {
          const { data } = await axios.post(
            `${
              import.meta.env.VITE_BACKEND_ORIGIN_URL
            }/api/data/get-data-by-id-of-service-worker-for-admin`,
            { _id: value.serviceWorkerId },
            { withCredentials: true }
          );

          setServiceWorkerCounts(data.data?.count);

          const newServiceWorker = data.data.serviceWorkers[0];
          if (!newServiceWorker) return;
          dispatch(addServiceWorker({ data: [newServiceWorker] }));

          for (let i = 0; i < paginationServiceWorker.totalPages; i++) {
            const startIdx = i * limit;
            const endIdx = startIdx + limit;
            const pageData = serviceWorkerStateData.slice(startIdx, endIdx);

            if (pageData.length < limit) {
              if (page === i + 1) {
                setServiceWorkers([...pageData, newServiceWorker]);
              }
              return;
            }
          }

          setPaginationServiceWorker((prev) => ({
            ...prev,
            totalPages: prev.totalPages + 1,
          }));
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("Error fetching inserted service worker", error);
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
            }/api/data/get-data-by-id-of-service-worker-for-admin`,
            { _id: value.serviceWorkerId },
            { withCredentials: true }
          );

          const updatedServiceWorker = data.data.serviceWorkers[0];

          dispatch(
            updateServiceWorker({
              _id: updatedServiceWorker._id,
              data: updatedServiceWorker,
            })
          );

          setServiceWorkers((prev) =>
            prev?.map((serviceWorker) =>
              serviceWorker._id === value.serviceWorkerId
                ? updatedServiceWorker
                : serviceWorker
            )
          );
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("Error fetching updated service worker:", error);
            setResult(undefined);
            setError(error.response?.data as ApiError);
          }
        }
      }

      if (value.eventType === "DELETE") {
        dispatch(deleteServiceWorker({ _id: value.serviceWorkerId }));

        const { data } = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_ORIGIN_URL
          }/api/count/get-count-by-id-of-service-worker-for-admin`,
          { withCredentials: true }
        );

        setServiceWorkerCounts(data.data?.count);

        const page = paginationServiceWorker.page;
        const limit = 10;

        if (serviceWorkerStateData.length === 0) return;

        const avgPages = Math.ceil(serviceWorkerStateData.length / limit);
        if (avgPages < paginationServiceWorker.totalPages) return;

        const paginatedData = serviceWorkerStateData.slice(
          (page - 1) * limit,
          page * limit
        );
        const updatedServiceWorker = paginatedData.filter(
          (user) => user._id !== value.serviceWorkerId
        );

        const totalItemsAfterDelete = serviceWorkerStateData.length - 1;
        const newTotalPages = Math.ceil(totalItemsAfterDelete / limit);

        if (updatedServiceWorker.length === 0 && page > 1) {
          setPaginationServiceWorker((prev) => ({
            ...prev,
            totalPages: newTotalPages,
            page: prev.page - 1,
          }));
          const newData = serviceWorkerStateData.slice(
            (page - 2) * limit,
            (page - 1) * limit
          );
          setServiceWorkers(newData);
          deleteVisitedPagesServiceWorker(page);
        } else {
          setServiceWorkers(updatedServiceWorker);
          setPaginationServiceWorker((prev) => ({
            ...prev,
            totalPages: newTotalPages,
          }));
        }
      }
    },
    [
      deleteVisitedPagesServiceWorker,
      dispatch,
      paginationServiceWorker.page,
      paginationServiceWorker.totalPages,
      serviceWorkerStateData,
    ]
  );

  useEffect(() => {
    socket
      ?.on("serviceWorkerInserted", (data) => {
        trackServiceWorkerEventAndUpdateState(data);
      })
      .on("serviceWorkerUpdated", (data) => {
        trackServiceWorkerEventAndUpdateState(data);
      })
      .on("serviceWorkerDeleted", (data) => {
        trackServiceWorkerEventAndUpdateState(data);
      });

    return () => {
      socket
        ?.off("serviceWorkerInserted")
        ?.off("serviceWorkerUpdated")
        ?.off("serviceWorkerDeleted");
    };
  }, [trackServiceWorkerEventAndUpdateState, socket]);

  ///////////////// search filter table /////////////////

  const handleSearchFilterTableForDonor = async (
    data: { donorName?: string; email?: string; createdAt?: string } | null,
    page: number,
    limit: number
  ) => {
    setIsSearchTableForDonorOn(true);
    try {
      const result = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }/api/search-filter-table/get-search-filter-table-for-donor-by-admin?page=${page}&limit=${limit}`,
        data,
        { withCredentials: true }
      );
      setUsers(result.data.data.users);
      setPaginationDonor(result.data.data.pagination);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error searching food:", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    }
  };

  const handleSearchFilterTableForServiceWorker = async (
    data: { workerName?: string; email?: string; createdAt?: string } | null,
    page: number,
    limit: number
  ) => {
    setIsSearchTableForServiceWorkerOn(true);
    try {
      const result = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }/api/search-filter-table/get-search-filter-table-for-service-worker-by-admin?page=${page}&limit=${limit}`,
        data,
        { withCredentials: true }
      );
      setServiceWorkers(result.data.data.serviceWorkers);
      setPaginationDonor(result.data.data.pagination);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error searching food:", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    }
  };

  const handleSearchFilterTableForFood = async (
    data: {
      foodName?: string;
      donordName?: string;
      donorEmail?: string;
      workerName?: string;
      workerEmail?: string;
      status?: "PENDING" | "ACCEPTED" | "COLLECTED" | "DELIVERED";
      madeDate?: string;
    } | null,
    page: number,
    limit: number
  ) => {
    setIsSearchTableForFoodOn(true);
    try {
      const result = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_ORIGIN_URL
        }/api/search-filter-table/get-search-filter-table-for-food-by-admin?page=${page}&limit=${limit}`,
        data,
        { withCredentials: true }
      );
      setFoods(result.data.data.foodDonations);
      setPaginationDonor(result.data.data.pagination);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error searching food:", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6 mt-14 sm:mt-14 md:mt-18">
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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="cursor-pointer p-2 rounded-md bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition duration-200"
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-gray-800 dark:text-white" />
            ) : (
              <Settings className="w-6 h-6 text-gray-800 dark:text-white" />
            )}
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-300 dark:border-gray-700 z-50">
              <button
                onClick={() => navigate("/settings")}
                className="cursor-pointer block w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Settings
              </button>
              <button
                onClick={() => navigate("/dashboard/manage-account")}
                className="cursor-pointer block w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Manage Account
              </button>
              <button
                onClick={() => navigate("/nearby-places")}
                className="cursor-pointer block w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Nearby Places
              </button>
              <button
                onClick={() => {
                  setAlertConfirmMessage({
                    message: "Are you sure you want to delete your account?",
                    messageType: "warning",
                    cancelText: "Cancel",
                    confirmText: "Delete",
                    onConfirm: () => {
                      if (userData) {
                        handleDeleteAdmin(userData);
                      }
                      setAlertConfirmMessage(null);
                    },
                    onCancel: () => setAlertConfirmMessage(null),
                  });
                }}
                className="cursor-pointer block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Delete Account
              </button>
              <button
                onClick={() => {
                  setAlertConfirmMessage({
                    message: "Logout confirm?",
                    messageType: "warning",
                    cancelText: "Cancel",
                    confirmText: "Logout",
                    onConfirm: () => {
                      handleAdminLogout();
                      setAlertConfirmMessage(null);
                    },
                    onCancel: () => setAlertConfirmMessage(null),
                  });
                }}
                className="cursor-pointer block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div
          className={`cursor-pointer bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-400 dark:border-gray-700 hover:shadow-xl transition-transform hover:scale-105 ${
            activeCategory === "donor" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => setActiveCategory("donor")}
        >
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-gray-700 dark:text-gray-300 font-bold"></p>
        </div>
        <div
          className={`cursor-pointer bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-400 dark:border-gray-700 hover:shadow-xl transition-transform hover:scale-105 ${
            activeCategory === "serviceWorker" ? "ring-2 ring-cyan-400" : ""
          }`}
          onClick={() => setActiveCategory("serviceWorker")}
        >
          <h2 className="text-xl font-semibold">Service-Workers Management</h2>
          <p className="text-cyan-500 font-bold"></p>
        </div>
        <div
          className={`cursor-pointer bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-400 dark:border-gray-700 hover:shadow-xl transition-transform hover:scale-105 ${
            activeCategory === "food" ? "ring-2 ring-teal-500" : ""
          }`}
          onClick={() => setActiveCategory("food")}
        >
          <h2 className="text-xl font-semibold">Food Management</h2>
          <p className="text-teal-400 font-bold"></p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-6 capitalize">
        {activeCategory || "donor"} Dashboard Overview
      </h2>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {activeCategory === "donor" && (
            <DashboardCard
              text={"Total users"}
              data={donorCounts?.totalUsers}
              showDropdown={false}
              who={"users"}
            />
          )}
          {activeCategory === "serviceWorker" && (
            <>
              <DashboardCard
                text={"Total service workers"}
                data={serviceWorkerCounts?.totalServiceWorkers}
                showDropdown={false}
                who={"service-workers"}
              />
              <DashboardCard
                text={"Total active workers"}
                data={serviceWorkerCounts?.totalActiveWorkers}
                showDropdown={false}
                who={"service-workers"}
              />
              <DashboardCard
                text={"Total pending approvals"}
                data={serviceWorkerCounts?.totalPendingApprovals}
                showDropdown={false}
                who={"service-workers"}
              />
              <DashboardCard
                text={"Actions"}
                data={0}
                showDropdown={true}
                dropdownItems={[
                  {
                    label: "Approve worker",
                    handler: (resetDropdown) => {
                      handleToggleValueUpdateMode(resetDropdown);
                      setThingValueUpdate({
                        title: "Approve Service Worker",
                        fields: [
                          { text: "Enter _id of worker", asValue: "_id" },
                        ],
                        type: "approve",
                      });
                    },
                  },
                  {
                    label: "Reject worker",
                    handler: (resetDropdown) => {
                      handleToggleValueUpdateMode(resetDropdown);
                      setThingValueUpdate({
                        title: "Reject Service Worker",
                        fields: [
                          { text: "Enter _id of worker", asValue: "_id" },
                        ],
                        type: "reject",
                      });
                    },
                  },
                  {
                    label: "Allocate worker to food",
                    handler: (resetDropdown) => {
                      handleToggleValueUpdateMode(resetDropdown);
                      setThingValueUpdate({
                        title: "Allocate worker to food",
                        fields: [
                          { text: "Enter _id of food", asValue: "foodId" },
                          {
                            text: "Enter _id of worker",
                            asValue: "serviceWorkerId",
                          },
                          {
                            text: "Enter food deliver address id",
                            asValue: "foodDeliverAddress",
                          },
                        ],
                        type: "foodAdd",
                      });
                    },
                  },
                ]}
                who={"service-workers"}
                resetDropdown={dropdownReset}
              />
              <DashboardCard
                text={"Filter Options For Table"}
                data={0}
                showDropdown={true}
                dropdownItems={[
                  {
                    label: "All Workers",
                    handler: () => {
                      handleToggleFilterOptions("all");
                    },
                  },
                  {
                    label: "Pending Approvals Of Workers",
                    handler: () => {
                      handleToggleFilterOptions("pendingApprovals");
                    },
                  },
                  {
                    label: "Active Workers",
                    handler: () => {
                      handleToggleFilterOptions("activeWorkers");
                    },
                  },
                ]}
                who={"service-workers"}
                resetDropdown={dropdownReset}
                Icon={Settings2}
              />
            </>
          )}
          {activeCategory === "food" && (
            <>
              <DashboardCard
                text={"Total foods"}
                data={foodCounts?.totalFoodDonations}
                showDropdown={false}
                who={"foods"}
              />
              <DashboardCard
                text={"Total delivered foods"}
                data={foodCounts?.totalDeliveredFoodDeliveries}
                showDropdown={false}
                who={"foods"}
              />
              <DashboardCard
                text={"Total pending food deliveries"}
                data={foodCounts?.totalPendingFoodDeliveries}
                showDropdown={false}
                who={"foods"}
              />
              <DashboardCard
                text={"Total collected food deliveries"}
                data={foodCounts?.totalCollectedFoodDeliveries}
                showDropdown={false}
                who={"foods"}
              />
              <DashboardCard
                text={"Total accepted food deliveries"}
                data={foodCounts?.totalAcceptedFoodDeliveries}
                showDropdown={false}
                who={"foods"}
              />
              <DashboardCard
                text={"Actions"}
                data={0}
                showDropdown={true}
                dropdownItems={[
                  {
                    label: "Allocate food to worker",
                    handler: (resetDropdown) => {
                      handleToggleValueUpdateMode(resetDropdown);
                      setThingValueUpdate({
                        title: "Allocate food to worker",
                        fields: [
                          { text: "Enter _id of food", asValue: "foodId" },
                          {
                            text: "Enter _id of worker",
                            asValue: "serviceWorkerId",
                          },
                          {
                            text: "Enter food deliver address id",
                            asValue: "foodDeliverAddress",
                          },
                        ],
                        type: "foodAdd",
                      });
                    },
                  },
                ]}
                who={"foods"}
                resetDropdown={dropdownReset}
              />
              <DashboardCard
                text={"Filter Options For Table"}
                data={0}
                showDropdown={true}
                dropdownItems={[
                  {
                    label: "All foods",
                    handler: () => {
                      handleToggleFilterOptions("allFoods");
                    },
                  },
                  {
                    label: "Pending Food Deliveries",
                    handler: () => {
                      handleToggleFilterOptions("pendingFoodDeliveries");
                    },
                  },
                  {
                    label: "Accepted Food Deliveries",
                    handler: () => {
                      handleToggleFilterOptions("acceptedFoodDeliveries");
                    },
                  },
                  {
                    label: "Collected Food Deliveries",
                    handler: () => {
                      handleToggleFilterOptions("collectedFoodDeliveries");
                    },
                  },
                  {
                    label: "Delivered Foods",
                    handler: () => {
                      handleToggleFilterOptions("deliveredFoods");
                    },
                  },
                  {
                    label: "Expiring in 24 hours",
                    handler: () => {
                      handleToggleFilterOptions("expiryDate");
                    },
                  },
                  {
                    label: "Veg Foods",
                    handler: () => {
                      handleToggleFilterOptions("VEGETARIAN");
                    },
                  },
                  {
                    label: "Non-Veg Foods",
                    handler: () => {
                      handleToggleFilterOptions("NON_VEGETARIAN");
                    },
                  },
                  {
                    label: "Vegan Foods",
                    handler: () => {
                      handleToggleFilterOptions("VEGAN");
                    },
                  },
                ]}
                who={"service-workers"}
                resetDropdown={dropdownReset}
                Icon={Settings2}
              />
            </>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="items-center mb-6 relative">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center w-full">
              Table Overview
            </h3>
          </div>
          {activeCategory === "donor" && (
            <>
              <SearchFilterTable
                fields={[
                  { label: "Donor Name", key: "donorName", type: "text" },
                  { label: "Email", key: "email", type: "email" },
                  { label: "Created After", key: "createdAt", type: "date" },
                ]}
                onSearch={(data) => {
                  setSearchFilterTableDataForDonor(data);
                  handleSearchFilterTableForDonor(data, 1, 10);
                }}
                onClear={() => {
                  setIsSearchTableForDonorOn(false);
                  setUsers(undefined);
                  setSearchFilterTableDataForDonor(null);
                  setPaginationDonor(getVisitedPagesData(visitedPagesDonor));
                  fetchAdminDashboard(1, 10);
                }}
              />
              <DashboardTable
                data={users || []}
                pagination={paginationDonor}
                actions={{
                  activate: {
                    label: "Update",
                    handler: (user) =>
                      handleToggleEditMode(user as ThingValueType),
                    color: "bg-green-500 text-white",
                  },
                  delete: {
                    label: "Delete",
                    handler: (user) => {
                      setAlertConfirmMessage({
                        message: "Delete user account?",
                        messageType: "info",
                        cancelText: "Cancel",
                        confirmText: "Delete",
                        onConfirm: () => {
                          handleDeleteDonor(user as UserType);
                          setAlertConfirmMessage(null);
                        },
                      });
                    },
                    color: "bg-red-500 text-white",
                  },
                }}
                onPageChange={(newPage) => fetchAdminDashboard(newPage)}
                who="ADMIN"
              />
            </>
          )}
          {activeCategory === "serviceWorker" && (
            <>
              <SearchFilterTable
                fields={[
                  { label: "Worker Name", key: "workerName", type: "text" },
                  { label: "Email", key: "email", type: "email" },
                  { label: "Created After", key: "createdAt", type: "date" },
                ]}
                onSearch={(data) => {
                  setSearchFilterTableDataForServiceWorker(data);
                  handleSearchFilterTableForServiceWorker(data, 1, 10);
                }}
                onClear={() => {
                  setIsSearchTableForServiceWorkerOn(false);
                  setServiceWorkers(undefined);
                  setSearchFilterTableDataForServiceWorker(null);
                  setPaginationServiceWorker(
                    getVisitedPagesData(visitedPagesDonor)
                  );
                  fetchAdminDashboard(1, 10);
                }}
              />
              <DashboardTable
                data={filteredServiceWorkers || []}
                pagination={paginationServiceWorker}
                actions={{
                  activate: {
                    label: "Update",
                    handler: (serviceWorker) =>
                      handleToggleEditMode(serviceWorker as ThingValueType),
                    color: "bg-green-500 text-white",
                  },
                  delete: {
                    label: "Delete",
                    handler: (serviceWorker) => {
                      setAlertConfirmMessage({
                        message: "Delete service worker account?",
                        messageType: "info",
                        cancelText: "Cancel",
                        confirmText: "Delete",
                        onConfirm: () => {
                          handleDeleteServiceWorker(serviceWorker as UserType);
                          setAlertConfirmMessage(null);
                        },
                      });
                    },
                    color: "bg-red-500 text-white",
                  },
                }}
                onPageChange={(newPage) => fetchAdminDashboard(newPage)}
                who="ADMIN"
              />
            </>
          )}
          {activeCategory === "food" && (
            <>
              <SearchFilterTable
                fields={[
                  { label: "Food Name", key: "foodName", type: "text" },
                  { label: "Donor Name", key: "donorName", type: "text" },
                  { label: "Donor email", key: "donorEmail", type: "email" },
                  { label: "Worker Name", key: "workerName", type: "text" },
                  { label: "Worker Email", key: "workerEmail", type: "email" },
                  {
                    label: "Food Status",
                    key: "status",
                    type: "select",
                    options: ["PENDING", "ACCEPTED", "COLLECTED", "DELIVERED"],
                  },
                  {
                    label: "Made date of food After",
                    key: "madeDate",
                    type: "date",
                  },
                ]}
                onSearch={(data) => {
                  setSearchFilterTableDataForFood(data);
                  handleSearchFilterTableForFood(data, 1, 10);
                }}
                onClear={() => {
                  setIsSearchTableForFoodOn(false);
                  setFoods(undefined);
                  setSearchFilterTableDataForFood(null);
                  setPaginationFood(getVisitedPagesData(visitedPagesDonor));
                  fetchAdminDashboard(1, 10);
                }}
              />
              <DashboardTable
                data={filteredFoods || []}
                pagination={paginationFood}
                actions={{
                  delete: {
                    label: "Delete",
                    handler: (food) => {
                      setAlertConfirmMessage({
                        message: "Delete food item?",
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
                  if (isSearchTableForDonorOn) {
                    handleSearchFilterTableForDonor(
                      searchFilterTableDataForDonor,
                      newPage,
                      10
                    );
                    return;
                  }
                  if (isSearchTableForServiceWorkerOn) {
                    handleSearchFilterTableForServiceWorker(
                      searchFilterTableDataForServiceWorker,
                      newPage,
                      10
                    );
                    return;
                  }
                  if (isSearchTableForFoodOn) {
                    handleSearchFilterTableForFood(
                      searchFilterTableDataForFood,
                      newPage,
                      10
                    );
                    return;
                  }
                  fetchAdminDashboard(newPage);
                }}
                who="ADMIN"
              />
            </>
          )}
        </div>
      </div>

      {isEditModeOpen && (
        <EditBox
          data={thingValue as FoodType}
          isNullValuesAllowed={false}
          readOnlyFields={[
            "_id",
            "profilePic",
            "role",
            "accountStatus",
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
                setThingValue(null);
              },
            },
          }}
          onUpdate={(data: FoodType | ServiceWorkerType | UserType) => {
            if ("foodName" in data) {
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
            } else if ("role" in data && data.role === "SERVICE") {
              setAlertConfirmMessage({
                message: "Proceed to update Service Worker?",
                messageType: "info",
                cancelText: "Cancel",
                confirmText: "Update",
                onConfirm: () => {
                  handleServiceWorkerUpdate(data as ServiceWorkerType);
                  setAlertConfirmMessage(null);
                },
              });
            } else if ("role" in data && data.role === "DONOR") {
              setAlertConfirmMessage({
                message: "Proceed to update donor?",
                messageType: "info",
                cancelText: "Cancel",
                confirmText: "Update",
                onConfirm: () => {
                  handleUserUpdate(data as UserType);
                  setAlertConfirmMessage(null);
                },
              });
            }
          }}
          onClose={() => {
            setisEditModeOpen(false);
            setThingValue(null);
          }}
        />
      )}
      {isValueUpdateModeOpen && (
        <DashboardValueUpdater
          title={thingValueUpdate?.title || ""}
          fields={thingValueUpdate?.fields || []}
          type={thingValueUpdate?.type || ""}
          onSubmit={(data) => {
            if (data.type === "approve") {
              setAlertConfirmMessage({
                message: "Approve Service Worker?",
                messageType: "info",
                cancelText: "Cancel",
                confirmText: "Approve",
                onConfirm: () => {
                  handleApproveWorker(data._id as ServiceWorkerType["_id"]);
                  setAlertConfirmMessage(null);
                },
              });
            }
            if (data.type === "reject") {
              setAlertConfirmMessage({
                message: "Reject Service Worker?",
                messageType: "info",
                cancelText: "Cancel",
                confirmText: "Reject",
                onConfirm: () => {
                  handleRejectWorker(data._id as ServiceWorkerType["_id"]);
                  setAlertConfirmMessage(null);
                },
              });
            }
            if (data.type === "foodAdd") {
              setAlertConfirmMessage({
                message: "Proceed to add food?",
                messageType: "info",
                cancelText: "Cancel",
                confirmText: "Add",
                onConfirm: () => {
                  handleFoodAddToServiceWorker(
                    data as {
                      foodId: string;
                      serviceWorkerId: string;
                      foodDeliverAddress: string;
                    }
                  );
                  setAlertConfirmMessage(null);
                },
              });
            }
          }}
          onClose={() => {
            setIsValueUpdateModeOpen(false);
            setThingValue(null);
            dropdownReset();
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

export default AdminDashboard;
