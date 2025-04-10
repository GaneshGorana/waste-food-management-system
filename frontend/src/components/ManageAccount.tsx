import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import AlertBox from "./AlertBox";
import AlertConfirmBox from "./AlertConfirmBox";
import LoadingScreen from "./LoadingScreen";

const ManageAccount: React.FC = () => {
  const fields = jwtDecode<Record<string, string>>(
    document.cookie.split("token=")[1]
  );

  const formatLabel = (key: string): string => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const initialFormData = { ...fields };

  const [formData, setFormData] =
    useState<Partial<typeof fields>>(initialFormData);
  const [result, setResult] = useState<ApiError>();
  const [error, setError] = useState<ApiResult>();
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const imageRef = useRef<HTMLInputElement | null>(null);
  const originalProfilePic = useRef<string>(fields.profilePic);
  const [isLoading, setIsLoading] = useState<{
    isLoading: boolean;
    text: string;
  }>({ isLoading: false, text: "" });

  const [alertConfirmMessage, setAlertConfirmMessage] = useState<{
    message: string;
    messageType: "success" | "info" | "warning" | "error";
    cancelText?: string;
    confirmText?: string;
    onConfirm: (e?: React.FormEvent<HTMLFormElement>) => void;
    onCancel?: () => void;
  } | null>(null);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e?.target?.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({
          ...formData,
          profilePic: reader.result as string,
        });
        setIsImageSelected(true);
        setSelectedImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      profilePic: originalProfilePic.current,
    }));
    setIsImageSelected(false);
    setSelectedImage(null);
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  const handleRefreshCookie = async () => {
    if (formData.role === "DONOR") {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/refresh-cookie/user`,
          { _id: fields._id },
          { withCredentials: true }
        );

        if (res.status === 200) {
          setError(undefined);
        } else {
          setError({
            message: "Failed to refresh cookie",
            messageType: "error",
          });
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error refreshing cookie:", error);
          setResult(undefined);
          setError(error.response?.data as ApiError);
        }
      }
    }
    if (formData.role === "SERVICE") {
      try {
        const res = await axios.post(
          `${
            import.meta.env.VITE_BACKEND_ORIGIN_URL
          }/api/refresh-cookie/service-worker`,
          { _id: fields._id },
          { withCredentials: true }
        );

        if (res.status === 200) {
          setError(undefined);
        } else {
          setError({
            message: "Failed to refresh cookie",
            messageType: "error",
          });
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error refreshing cookie:", error);
          setResult(undefined);
          setError(error.response?.data as ApiError);
        }
      }
    }
    if (formData.role === "ADMIN") {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/refresh-cookie/admin`,
          { _id: fields._id },
          { withCredentials: true }
        );

        if (res.status === 200) {
          setError(undefined);
        } else {
          setError({
            message: "Failed to refresh cookie",
            messageType: "error",
          });
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error refreshing cookie:", error);
          setResult(undefined);
          setError(error.response?.data as ApiError);
        }
      }
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) return;

    const formD = new FormData();
    formD.append("profilePic", selectedImage);

    if (formData.role === "DONOR") {
      setIsLoading({ isLoading: true, text: "Uploading" });
      try {
        const response = await axios.post(
          `${
            import.meta.env.VITE_BACKEND_ORIGIN_URL
          }/api/auth/user/upload-profile-pic`,
          formD,
          { withCredentials: true }
        );
        if (response.status === 200) {
          setError(undefined);
          setResult({
            message: "Profile picture uploaded successfully",
            messageType: "success",
          });
          setIsImageSelected(false);
          setSelectedImage(null);
          await handleRefreshCookie();
          const newFields = jwtDecode<Record<string, string>>(
            document.cookie.split("token=")[1]
          );

          originalProfilePic.current = newFields.profilePic;
          setFormData((prev) => ({
            ...prev,
            profilePic: newFields.profilePic,
          }));
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error uploading profile picture:", error);
          setResult(undefined);
          setError(error.response?.data as ApiError);
        }
      } finally {
        setIsLoading({ isLoading: false, text: "" });
      }
    }
    if (formData.role === "SERVICE") {
      setIsLoading({ isLoading: true, text: "Uploading" });
      try {
        const response = await axios.post(
          `${
            import.meta.env.VITE_BACKEND_ORIGIN_URL
          }/api/auth/service-worker/upload-profile-pic`,
          formD,
          { withCredentials: true }
        );
        if (response.status === 200) {
          setError(undefined);
          setResult({
            message: "Profile picture uploaded successfully",
            messageType: "success",
          });
          setIsImageSelected(false);
          setSelectedImage(null);
          await handleRefreshCookie();
          const newFields = jwtDecode<Record<string, string>>(
            document.cookie.split("token=")[1]
          );

          originalProfilePic.current = newFields.profilePic;
          setFormData((prev) => ({
            ...prev,
            profilePic: newFields.profilePic,
          }));
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error uploading profile picture:", error);
          setResult(undefined);
          setError(error.response?.data as ApiError);
        }
      } finally {
        setIsLoading({ isLoading: false, text: "" });
      }
    }
    if (formData.role === "ADMIN") {
      setIsLoading({ isLoading: true, text: "Uploading" });
      try {
        const response = await axios.post(
          `${
            import.meta.env.VITE_BACKEND_ORIGIN_URL
          }/api/auth/admin/upload-profile-pic`,
          formD,
          { withCredentials: true }
        );
        if (response.status === 200) {
          setError(undefined);
          setResult({
            message: "Profile picture uploaded successfully",
            messageType: "success",
          });
          setIsImageSelected(false);
          setSelectedImage(null);
          await handleRefreshCookie();
          const newFields = jwtDecode<Record<string, string>>(
            document.cookie.split("token=")[1]
          );

          originalProfilePic.current = newFields.profilePic;
          setFormData((prev) => ({
            ...prev,
            profilePic: newFields.profilePic,
          }));
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error uploading profile picture:", error);
          setResult(undefined);
          setError(error.response?.data as ApiError);
        }
      } finally {
        setIsLoading({ isLoading: false, text: "" });
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setIsLoading({ isLoading: true, text: "Saving" });
    if (formData.role === "DONOR") {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_ORIGIN_URL}/api/auth/user/update`,
          formData,
          { withCredentials: true }
        );
        if (response.status === 200) {
          setError(undefined);
          setResult(response.data);
          await handleRefreshCookie();
          const newFields = jwtDecode<Record<string, string>>(
            document.cookie.split("token=")[1]
          );
          setFormData(newFields);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error updating user:", error);
          setResult(undefined);
          setError(error.response?.data as ApiError);
        }
      } finally {
        setIsLoading({ isLoading: false, text: "" });
      }
    }
    if (formData.role === "SERVICE") {
      try {
        const response = await axios.post(
          `${
            import.meta.env.VITE_BACKEND_ORIGIN_URL
          }/api/auth/service-worker/update`,
          formData,
          { withCredentials: true }
        );
        if (response.status === 200) {
          setError(undefined);
          setResult(response.data);
          await handleRefreshCookie();
          const newFields = jwtDecode<Record<string, string>>(
            document.cookie.split("token=")[1]
          );
          setFormData(newFields);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error updating user:", error);
          setResult(undefined);
          setError(error.response?.data as ApiError);
        }
      } finally {
        setIsLoading({ isLoading: false, text: "" });
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-white dark:bg-gray-800 py-10">
      <LoadingScreen isLoading={isLoading.isLoading} text={isLoading.text} />

      {(error || result) && (
        <AlertBox
          message={error?.message || (result?.message as string)}
          onClose={() => {
            setError(undefined);
            setResult(undefined);
          }}
          messageType={error?.messageType || result?.messageType || "info"}
        />
      )}
      <div className="p-6 max-w-5xl w-full bg-white text-black dark:text-white dark:bg-gray-800 flex flex-col justify-center">
        <h2 className="text-2xl lg:text-3xl font-semibold text-center">
          Manage Account
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] items-center justify-center gap-10 mt-10 lg:mt-12">
          <div className="flex flex-col items-center">
            <img
              src={formData.profilePic || "/default-profile.png"}
              alt="Profile"
              className="w-32 lg:w-40 h-32 lg:h-40 rounded-full border-4 border-gray-300 dark:border-gray-600 object-cover"
            />

            <div className="flex flex-col items-center gap-2 mt-3 w-full">
              <form
                onSubmit={handleUploadImage}
                encType="multipart/form-data"
                className="flex flex-col items-center gap-2 w-full"
              >
                {!isImageSelected ? (
                  <label
                    htmlFor="profilePic"
                    className="cursor-pointer dark:bg-orange-200 dark:text-gray-800 text-orange-200 bg-transparent border-2 border-orange-300 dark:border-orange-300 rounded-md px-4 py-2 text-center"
                  >
                    Change Profile
                  </label>
                ) : (
                  <>
                    <Button
                      type="button"
                      className="cursor-pointer text-sm lg:text-base text-orange-400 dark:text-orange-300 text-center w-full max-w-[200px]"
                      onClick={handleRemoveImage}
                    >
                      Remove Pic
                    </Button>
                    <Button
                      type="button"
                      className="cursor-pointer text-sm lg:text-base text-cyan-600 dark:text-cyan-400 text-center w-full max-w-[200px]"
                      onClick={() =>
                        setAlertConfirmMessage({
                          message:
                            "Are you sure you want to upload this profile picture?",
                          messageType: "info",
                          cancelText: "Cancel",
                          confirmText: "Upload",
                          onConfirm: async () => {
                            await handleUploadImage();
                            setAlertConfirmMessage(null);
                          },
                          onCancel: () => setAlertConfirmMessage(null),
                        })
                      }
                    >
                      Upload Pic
                    </Button>
                  </>
                )}
                <input
                  type="file"
                  id="profilePic"
                  accept="image/*"
                  ref={imageRef}
                  className="hidden"
                  onChange={handleImageChange}
                />
              </form>
            </div>
          </div>

          <div className="w-full">
            <div className="max-h-[75vh] p-2 lg:p-4">
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(fields)
                    .filter(
                      ([key]) =>
                        !["_id", "role", "iat", "exp", "profilePic"].includes(
                          key
                        )
                    )
                    .map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <Label
                          htmlFor={key}
                          className="text-sm lg:text-base font-medium"
                        >
                          {formatLabel(key)}
                        </Label>
                        <Input
                          id={key}
                          type="text"
                          value={formData[key] ?? value}
                          onChange={(e) => handleChange(key, e.target.value)}
                          placeholder={`Enter ${formatLabel(key)}`}
                          className="mt-1 p-2 lg:p-3 border border-gray-200 rounded-md dark:bg-gray-700 text-base"
                        />
                      </div>
                    ))}
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 mt-10 lg:mt-12 justify-center">
          <Button
            variant="outline"
            className="cursor-pointer w-full sm:w-auto text-base lg:text-lg px-4 lg:px-6 py-2 lg:py-3 text-cyan-500 border-cyan-500 dark:text-cyan-400 dark:border-cyan-400"
          >
            Change Password
          </Button>

          <Button
            type="submit"
            className="cursor-pointer w-full sm:w-auto text-base lg:text-lg px-4 lg:px-6 py-2 lg:py-3 border-2 border-gray-300 dark:border-gray-600"
            onClick={(e) => {
              e.preventDefault();
              setAlertConfirmMessage({
                message: "Do you want to save the changes?",
                messageType: "info",
                cancelText: "Cancel",
                confirmText: "Save",
                onConfirm: async (e?: React.FormEvent<HTMLFormElement>) => {
                  await handleSubmit(e);
                  setAlertConfirmMessage(null);
                },
                onCancel: () => setAlertConfirmMessage(null),
              });
            }}
          >
            Save
          </Button>
        </div>
      </div>
      {alertConfirmMessage && (
        <AlertConfirmBox
          message={alertConfirmMessage.message}
          messageType={alertConfirmMessage.messageType}
          cancelText={alertConfirmMessage.cancelText}
          confirmText={alertConfirmMessage.confirmText}
          onConfirm={() => alertConfirmMessage.onConfirm()}
          onCancel={
            alertConfirmMessage.onCancel || (() => setAlertConfirmMessage(null))
          }
          onClose={() => setAlertConfirmMessage(null)}
        />
      )}
    </div>
  );
};

export default ManageAccount;
