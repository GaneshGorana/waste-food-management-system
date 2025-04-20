import User from "../models/user.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { setUser } from "../jwt/userAuthJWT.js";
import mongoose from "mongoose";
import ServiceWorker from "../models/serviceWorker.js";
import Admin from "../models/admin.js";

export const refreshUserCookie = async (req, res) => {
    try {
        const _id = req.body._id;
        const user = await User.findOne({ _id: new mongoose.Types.ObjectId(_id) });
        if (!user) return null;
        const token = setUser(user);
        if (token?.success === false) {
            return ApiError(res, 500, token.error)
        }
        res.clearCookie('token');
        res.cookie("token", token)
        return ApiResponse(res, 200, "Cookie refreshed successfully", null, "success")
    } catch (error) {
        console.log("error in jwt generation : ")
        console.log(error)
        return ApiError(res, 500, "Error in generating token,try again later", "error")
    }
}
export const refreshServiceWorkerCookie = async (req, res) => {
    try {
        const _id = req.body._id;
        const user = await ServiceWorker.findOne({ _id: new mongoose.Types.ObjectId(_id) });
        if (!user) return null;
        const token = setUser(user);
        if (token?.success === false) {
            return ApiError(res, 500, token.error)
        }
        res.clearCookie('token');
        res.cookie("token", token)
        return ApiResponse(res, 200, "Cookie refreshed successfully", null, "success")
    } catch (error) {
        console.log("error in jwt generation : ")
        console.log(error)
        return ApiError(res, 500, "Error in generating token,try again later", "error")
    }
}

export const refreshAdminCookie = async (req, res) => {
    try {
        const _id = req.body._id;
        const user = await Admin.findOne({ _id: new mongoose.Types.ObjectId(_id) });
        if (!user) return null;
        const token = setUser(user);
        if (token?.success === false) {
            return ApiError(res, 500, token.error)
        }
        res.clearCookie('token');
        res.cookie("token", token)
        return ApiResponse(res, 200, "Cookie refreshed successfully", null, "success")
    } catch (error) {
        console.log("error in jwt generation : ")
        console.log(error)
        return ApiError(res, 500, "Error in generating token,try again later", "error")
    }
}