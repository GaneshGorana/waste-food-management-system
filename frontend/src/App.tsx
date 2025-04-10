import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Donate from "./pages/Donate";
// import Track from "./pages/Track";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Navbar from "./components/Navbar";
import Footer from "./pages/Footer";
import DonorDashboard from "./pages/DonorDashboard";
import ServiceWorkerRegisteration from "./pages/ServiceWorkerRegistration";
import ServiceWorkerLogin from "./pages/ServiceWorkerLogin";
import ServiceWorkerDashboard from "./pages/ServiceWorkerDashboard";
import AdminRegisteration from "./pages/AdminRegistration";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NearbyPlaces from "./pages/NearbyPlaces";
import ManageAccount from "./components/ManageAccount";
import ProtectedRoute from "./utility/ProtectedRoute";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Router>
        <Navbar />
        <main className="flex-grow w-full min-w-[300px] mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/donate" element={<Donate />} />
              <Route path="/dashboard/user" element={<DonorDashboard />} />
              <Route
                path="/dashboard/manage-account"
                element={<ManageAccount />}
              />
              <Route
                path="/dashboard/service-worker"
                element={<ServiceWorkerDashboard />}
              />
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
            </Route>
            <Route
              path="/service-worker/register"
              element={<ServiceWorkerRegisteration />}
            />
            <Route
              path="/service-worker/login"
              element={<ServiceWorkerLogin />}
            />
            <Route path="/nearby-places" element={<NearbyPlaces />} />
            <Route path="/admin/register" element={<AdminRegisteration />} />
            <Route path="/admin/login" element={<AdminLogin />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}
export default App;
