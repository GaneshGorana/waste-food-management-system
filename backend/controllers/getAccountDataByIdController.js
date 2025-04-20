import Admin from "../models/admin.js";
import ServiceWorker from "../models/serviceWorker.js";
import User from "../models/user.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getAccountDataByIdOfDonor = async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) {
            return ApiError(res, 400, "Please provide donor id", "warning")
        }
        const user = await User.findById(_id).select("-password -__v -updatedAt -createdAt").lean();
        if (!user) {
            return ApiError(res, 400, "Donor not found", "info")
        }
        return ApiResponse(res, 200, "Donor details fetched successfully", user, "success")
    } catch (error) {
        console.log("get donor details error :");
        return ApiError(res, 400, "Error in fetching donor details", "error")
    }
}

export const getAccountDataByIdOfServiceWorker = async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) {
            return ApiError(res, 400, "Please provide service worker id", "warning")
        }
        const user = await ServiceWorker.findById(_id).select("-password -__v -updatedAt -createdAt").lean();
        if (!user) {
            return ApiError(res, 400, "Service worker not found", "info")
        }
        return ApiResponse(res, 200, "Service worker details fetched successfully", user, "success")
    } catch (error) {
        console.log("get service worker details error :", error);
        return ApiError(res, 400, "Error in fetching service worker details", "error")
    }
}

export const getAccountDataByIdOfAdmin = async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) {
            return ApiError(res, 400, "Please provide admin id", "warning")
        }
        const user = await Admin.findById(_id).select("-password -__v -updatedAt -createdAt").lean();
        if (!user) {
            return ApiError(res, 400, "Admin not found", "info")
        }
        return ApiResponse(res, 200, "Admin details fetched successfully", user, "success")
    } catch (error) {
        console.log("get admin details error :");
        return ApiError(res, 400, "Error in fetching admin details", "error")
    }
}

