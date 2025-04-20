import { createSlice } from "@reduxjs/toolkit";

type CountState = {
  donorCounts: [];
  foodCounts: [];
  serviceWorkerCounts: [];
};

const initialState: CountState = {
  donorCounts: [],
  foodCounts: [],
  serviceWorkerCounts: [],
};

export const CountState = createSlice({
  name: "count",
  initialState,
  reducers: {
    setDonorStateCounts: (state, action) => {
      state.donorCounts = action.payload;
    },
    setFoodStateCounts: (state, action) => {
      state.foodCounts = action.payload;
    },
    setServiceWorkerStateCounts: (state, action) => {
      state.serviceWorkerCounts = action.payload;
    },
    clearAllCounts: (state) => {
      state.donorCounts = [];
      state.foodCounts = [];
      state.serviceWorkerCounts = [];
    },
  },
});

export const {
  setDonorStateCounts,
  setFoodStateCounts,
  setServiceWorkerStateCounts,
  clearAllCounts,
} = CountState.actions;

export default CountState.reducer;
