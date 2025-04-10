import { createSlice } from "@reduxjs/toolkit";

type ServiceWorkerState = {
  data: ServiceWorkerType[];
};

const initialState: ServiceWorkerState = {
  data: [],
};
export const ServiceWorkerState = createSlice({
  name: "serviceWorker",
  initialState,
  reducers: {
    addServiceWorker: (state, action) => {
      const { data } = action.payload;
      state.data.push(...data);
    },

    updateServiceWorker: (state, action) => {
      const { _id, data } = action.payload;

      state.data = state.data.map((doc) => (doc._id === _id ? data : doc));
    },

    deleteServiceWorker: (state, action) => {
      const { _id } = action.payload;
      state.data = state.data.filter((doc) => doc?._id !== _id);
    },

    clearDataServiceWorker: (state) => {
      state.data = [];
    },
  },
});

export const {
  addServiceWorker,
  updateServiceWorker,
  deleteServiceWorker,
  clearDataServiceWorker,
} = ServiceWorkerState.actions;

export default ServiceWorkerState.reducer;
