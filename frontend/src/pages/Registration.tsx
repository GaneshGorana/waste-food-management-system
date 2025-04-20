import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AlertBox from "../components/AlertBox";

function Registeration() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<ApiError>();
  const [result, setResult] = useState<ApiResult>();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserRegistration = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      if (formData.password !== formData.confirmPassword) {
        setFormError({
          message: "Passwords do not match",
          messageType: "warning",
        });
        return;
      }
      const result = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/auth/user/register`,
        formData
      );
      if (result.status === 201) {
        setFormError(undefined);
        setResult(result.data);
        navigate("/login");
      }
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
    } catch (error) {
      setResult(undefined);
      if (axios.isAxiosError(error) && error.response?.data) {
        setFormError(error.response.data);
      } else {
        setFormError({
          message: "An unexpected error occurred at registration",
          messageType: "error",
        });
      }
      console.error("Error registering user:", error);
    }
  };
  return (
    <div className="mt-18 flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-800">
      {(formError || result) && (
        <AlertBox
          message={formError?.message || result?.message || ""}
          onClose={() => {
            setFormError(undefined);
            setResult(undefined);
          }}
          messageType={
            (formError?.messageType || result?.messageType || "info") as
              | "warning"
              | "error"
              | "info"
              | "success"
          }
        />
      )}
      <div className="bg-white dark:bg-slate-700 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">
          Register
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
            Register
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          Already have an account?
          <Link
            to="/login"
            className="cursor-pointer text-blue-500 dark:text-blue-400 ml-1"
            onClick={() => {
              setFormError(undefined);
              setResult(undefined);
            }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Registeration;
