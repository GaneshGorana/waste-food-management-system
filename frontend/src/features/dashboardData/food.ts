import { createSlice } from "@reduxjs/toolkit";

type FoodState = {
  data: FoodType[];
};

const initialState: FoodState = {
  data: [],
};
export const foodState = createSlice({
  name: "food",
  initialState,
  reducers: {
    addFood: (state, action) => {
      const { data } = action.payload;
      state.data.push(...data);
    },

    updateFood: (state, action) => {
      const { _id, data } = action.payload;

      state.data = state.data.map((doc) => (doc._id === _id ? data : doc));
    },

    deleteFood: (state, action) => {
      const { _id } = action.payload;
      state.data = state.data.filter((doc) => doc?._id !== _id);
    },

    // exprimental
    updateDonorDetailsInFood: (state, action) => {
      const { _id, donorDetails } = action.payload;
      state.data = state.data.map((doc) => {
        if (doc._id === _id) {
          return { ...doc, donorDetails };
        }
        return doc;
      });
    },

    //expreimental
    updateServiceWorkerDetailsInFood: (state, action) => {
      const { _id, serviceWorkerDetails } = action.payload;
      state.data = state.data.map((doc) => {
        if (doc._id === _id) {
          return { ...doc, serviceWorkerDetails };
        }
        return doc;
      });
    },

    clearDataFood: (state) => {
      state.data = [];
    },
  },
});

export const {
  addFood,
  updateFood,
  deleteFood,
  updateDonorDetailsInFood,
  updateServiceWorkerDetailsInFood,
  clearDataFood,
} = foodState.actions;
export default foodState.reducer;
