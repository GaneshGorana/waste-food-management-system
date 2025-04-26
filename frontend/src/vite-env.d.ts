/// <reference types="vite/client" />

interface ApiError {
  message: string;
  messageType: "warning" | "error" | "info" | "success";
}

interface ApiResult<T = Record<string, unknown>> extends ApiError {
  data?: T[];
}

type ThemeState = {
  theme: "light" | "dark";
};

type UserType = {
  _id?: string;
  name: string;
  state: string;
  city: string;
  pincode: number;
  address: string;
  email: string;
  profilePic?: string;
  role: "DONOR" | "SERVICE" | "ADMIN";
};

type ServiceWorkerType = {
  _id?: string;
  name: string;
  state: string;
  city: string;
  pincode: number;
  address: string;
  email: string;
  profilePic?: string;
  role: "SERVICE";
  accountStatus: "ACTIVE" | "INACTIVE";
};

type FoodType = {
  _id?: string;
  donorId?: string;
  foodName: string;
  foodImage: string | File;
  quantity?: number;
  foodState: string;
  foodCity: string;
  foodAddress: string;
  status: "PENDING" | "ACCEPTED" | "COLLECTED" | "DELIVERED";
  acceptedBy?: string;
  madeDate?: Date | string;
  expiryDate?: Date | string;
  foodType: "VEGETARIAN" | "NON_VEGETARIAN" | "VEGAN";
  foodDeliverAddress?: string;
  acceptedById?: string;
  latitude?: number;
  longitude?: number;
};

interface ErrorType {
  success: boolean;
  message: string;
  messageType: string;
}

type NearByPlacesType = {
  _id: string;
  placeName: string;
  placeState: string;
  placeCity: string;
  placeAddress: string;
  placePincode: number;
  isFoodDelivered: boolean;
  worker?: string;
  food?: string;
  latitude: number;
  longitude: number;
};
