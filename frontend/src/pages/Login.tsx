import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AlertBox from "@/components/AlertBox";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isOrganization, setIsOrganization] = useState(false);
  const [formError, setFormError] = useState<ApiError>();
  const [result, setResult] = useState<ApiResult>();
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isOrganization) {
        const result = await axios.post(
          `${
            import.meta.env.VITE_BACKEND_ORIGIN_URL
          }/api/auth/organization/login`,
          formData,
          { withCredentials: true }
        );
        if (result.status === 200) {
          setFormError(undefined);
          setResult(result.data);
          window.dispatchEvent(new Event("cookieRefresh"));
          navigate("/dashboard/organization");
        }
      } else {
        const result = await axios.post(
          `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/auth/user/login`,
          formData,
          { withCredentials: true }
        );
        if (result.status === 200) {
          setFormError(undefined);
          setResult(result.data);
          window.dispatchEvent(new Event("cookieRefresh"));
          navigate("/dashboard/user");
        }
      }
      setFormData({ email: "", password: "" });
    } catch (error) {
      setResult(undefined);
      if (axios.isAxiosError(error) && error.response) {
        setFormError(error.response.data);
      } else {
        setFormError({
          message: "An unexpected error occurred.",
          messageType: "error",
        });
      }
      console.log("Error login user : ", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-800">
      {(formError || result) && (
        <AlertBox
          message={formError?.message || result?.message || ""}
          onClose={() => {
            setFormError(undefined);
            setResult(undefined);
          }}
          messageType={formError?.messageType || result?.messageType || "info"}
        />
      )}
      <div className="bg-white dark:bg-slate-700 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">
          Login
        </h2>
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setIsOrganization(false)}
            className={`px-4 py-2 mx-2 rounded-md cursor-pointer transition-all duration-500 ${
              !isOrganization
                ? "bg-blue-500 text-white"
                : "bg-gray-300 dark:bg-gray-600 dark:text-white"
            }`}
          >
            User
          </button>
          <button
            onClick={() => setIsOrganization(true)}
            className={`px-4 py-2 mx-2 rounded-md cursor-pointer transition-all duration-500 ${
              isOrganization
                ? "bg-blue-500 text-white"
                : "bg-gray-300 dark:bg-gray-600 dark:text-white"
            }`}
          >
            Organization
          </button>
        </div>
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
            Login
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?
          <Link
            to="/register"
            className="cursor-pointer text-blue-500 dark:text-blue-400 ml-1"
            onClick={() => {
              setFormError(undefined);
              setResult(undefined);
            }}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
