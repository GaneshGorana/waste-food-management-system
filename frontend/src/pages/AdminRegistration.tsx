import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AlertBox from "@/components/AlertBox";
function AdminRegisteration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    organizationNumber: "",
    state: "",
    city: "",
    address: "",
    pincode: "",
  });
  const [error, setError] = useState<ApiError>();
  const [result, setResult] = useState<ApiResult>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserRegistration = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      if (formData.password !== formData.confirmPassword) {
        setError({ message: "Passwords do not match", messageType: "warning" });
        return;
      }
      const result = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/auth/admin/register`,
        formData
      );
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        organizationName: "",
        organizationNumber: "",
        state: "",
        city: "",
        address: "",
        pincode: "",
      });
      if (result.status === 201) {
        setError(undefined);
        setResult(result.data);
        navigate("/admin/login");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setResult(undefined);
        console.error("Error registering admin:", error);
        setError(error.response?.data as ApiError);
      }
    }
  };
  return (
    <div className="mt-14 flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-800">
      {(error || result) && (
        <AlertBox
          message={error?.message || result?.message || ""}
          onClose={() => {
            setError(undefined);
            setResult(undefined);
          }}
          messageType={error?.messageType || result?.messageType || "info"}
        />
      )}
      <div className="bg-white dark:bg-slate-700 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">
          Admin Registeration
        </h2>
        <form
          onSubmit={(e) => handleUserRegistration(e)}
          method="POST"
          className="space-y-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-slate-600 dark:text-white dark:border-gray-600"
            required
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-slate-600 dark:text-white dark:border-gray-600"
            required
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-slate-600 dark:text-white dark:border-gray-600"
            required
          />
          <input
            type="number"
            name="pincode"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-slate-600 dark:text-white dark:border-gray-600"
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-slate-600 dark:text-white dark:border-gray-600"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-slate-600 dark:text-white dark:border-gray-600"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-slate-600 dark:text-white dark:border-gray-600"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-slate-600 dark:text-white dark:border-gray-600"
            required
          />
          <button
            type="submit"
            className="cursor-pointer w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors duration-300"
          >
            Register Admin
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          Already have an account?
          <Link
            to="/admin/login"
            className="cursor-pointer text-blue-500 dark:text-blue-400 ml-1"
            onClick={() => {
              setError(undefined);
              setResult(undefined);
            }}
          >
            Login Admin
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminRegisteration;
