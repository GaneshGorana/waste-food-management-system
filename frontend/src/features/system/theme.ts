import { createSlice } from "@reduxjs/toolkit";

const initialState: ThemeState = {
  theme: (localStorage.getItem("theme") as "light" | "dark") ?? "light",
};

export const themeSystem = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
  },
});

export const { toggleTheme } = themeSystem.actions;
export default themeSystem.reducer;
