import { createSlice } from "@reduxjs/toolkit";

type DonorState = {
  data: UserType[];
};

const initialState: DonorState = {
  data: [],
};
export const DonorState = createSlice({
  name: "donor",
  initialState,
  reducers: {
    addDonor: (state, action) => {
      const { data } = action.payload;
      state.data.push(...data);
    },

    updateDonor: (state, action) => {
      const { _id, data } = action.payload;

      state.data = state.data.map((doc) => (doc._id === _id ? data : doc));
    },

    deleteDonor: (state, action) => {
      const { _id } = action.payload;
      state.data = state.data.filter((doc) => doc?._id !== _id);
    },

    clearDataDonor: (state) => {
      state.data = [];
    },
  },
});

export const { addDonor, updateDonor, deleteDonor, clearDataDonor } =
  DonorState.actions;

export default DonorState.reducer;
