import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { Provider } from "react-redux";
import { foodStore } from "./store/foodStore.js";
import SocketProvider from "./context/SocketProvider.jsx";
import { PaginationProvider } from "./context/PaginationProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <SocketProvider>
    <PaginationProvider>
      <Provider store={foodStore}>
        <App />
      </Provider>
    </PaginationProvider>
  </SocketProvider>
);
