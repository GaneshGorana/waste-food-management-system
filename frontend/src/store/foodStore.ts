import { combineReducers, configureStore } from "@reduxjs/toolkit";
import themeReducer from "../features/system/theme";
import foodReducer from "../features/dashboardData/food";
import donorReducer from "../features/dashboardData/donor";
import serviceWorkerReducer from "../features/dashboardData/serviceWorker";
import countReducer from "../features/dashboardData/count";

const rootReducer = combineReducers({
  theme: themeReducer,
  food: foodReducer,
  donor: donorReducer,
  serviceWorker: serviceWorkerReducer,
  count: countReducer,
});

export const foodStore = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
