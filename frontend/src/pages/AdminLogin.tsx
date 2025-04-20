import AlertBox from "@/components/AlertBox";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<ApiError>();
  const [result, setResult] = useState<ApiResult>();
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/auth/admin/login`,
        formData,
        { withCredentials: true }
      );
      if (result.status === 200) {
        setError(undefined);
        setResult(result.data);
        window.dispatchEvent(new Event("cookieRefresh"));
        navigate("/dashboard/admin");
      }
      setFormData({ email: "", password: "" });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error logging in admin:", error);
        setResult(undefined);
        setError(error.response?.data as ApiError);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-800">
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
          Admin Login
        </h2>
        <form onSubmit={(e) => handleUserLogin(e)} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-600 text-gray-900 dark:text-white"
            required
          />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-600 text-gray-900 dark:text-white"
            required
          />
          <button
            type="submit"
            className="cursor-pointer w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors duration-300"
          >
            Login Admin
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?
          <Link
            to="/admin/register"
            className="cursor-pointer text-blue-500 dark:text-blue-400 ml-1"
            onClick={() => {
              setError(undefined);
              setResult(undefined);
            }}
          >
            Register Admin
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
