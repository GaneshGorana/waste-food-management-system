import User from '../models/user.js'
import bcrypt from 'bcryptjs'
import { setUser } from "../jwt/userAuthJWT.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"

export const userRegister = async (req, res) => {
    if (!req.body) {
        return ApiError(res, 400, "Please provide user details", "warning")
    }
    try {
        const existingUser = await User.findOne({ email: req?.body?.email });
        if (existingUser) {
            return ApiError(res, 400, "Email already registered", "info");
        }
        const user = await User.create(req.body);
        return ApiResponse(res, 201, "Registered successfully", null, "success")
    } catch (err) {
        console.log("registration process error :");
        return ApiError(res, 400, "Error in user registration", "error")
    }
};

export const userLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return ApiError(res, 400, "User not found", "info")
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return ApiError(res, 400, "Invalid credentials", "warning")
        }
        const token = setUser(user);
        if (token.error) {
            return ApiError(res, 500, token.error)
        }
        res.cookie('token', token);
        return ApiResponse(res, 200, "Logged in successfully", null, "success")
    } catch (err) {
        console.log("login process error :");
        return ApiError(res, 400, "Error in user login", "error")
    }
};

export const userUpdate = async (req, res) => {
    try {

        if (!req.body) {
            return ApiError(res, 400, "Please provide user details", "warning")
        }

        const isUserExists = await User.findOne({ _id: req.body._id });
        if (!isUserExists) {
            return ApiError(res, 400, "Donor not found", "info");
        }

        const user = await User.findByIdAndUpdate(req.body._id, { $set: req.body });

        if (!user) {
            return ApiError(res, 400, "Error in user update", "error")
        }
        return ApiResponse(res, 200, "Donor details updated successfully", null, "success")

    } catch (error) {
        console.log("update process error in user :");
        return ApiError(res, 400, "Error in user update", "error")
    }
}

export const userDelete = async (req, res) => {
    try {
        const user = req.body;
        if (!user) {
            return ApiError(res, 400, "Please provide donor details", "warning")
        }
        const userFound = await User.findByIdAndDelete(user._id);
        if (!userFound) {
            return ApiError(res, 400, "DOnor not found", "info")
        }
        return ApiResponse(res, 200, "Account deleted successfully", null, "success")
    } catch (error) {
        console.log("delete process error in donor :");
        return ApiError(res, 400, "Error in account delete", "error")
    }
}

import ImageKit from "imagekit";
import fs from "fs/promises"
export const userProfilePicUpload = async (req, res) => {
    try {
        if (!req.file) {
            return ApiError(res, 400, "Please provide a profile picture", "warning")
        }
        const imageKitUpload = new ImageKit({
            publicKey: `${process.env.IMAGE_KIT_PUBLIC_KEY}`,
            privateKey: `${process.env.IMAGE_KIT_PRIVATE_KEY}`,
            urlEndpoint: `${process.env.IMAGE_KIT_URL_ENDPOINT}`
        });
        const fileBuffer = await fs.readFile(req.file.path);
        const result = await imageKitUpload.upload({ file: fileBuffer, fileName: req.file.originalname, folder: "user", isPublished: true });

        if (!result) {
            return ApiError(res, 400, "Error in uploading profile picture 2", "error")
        }

        await fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            }
        });

        const user = await User.findByIdAndUpdate(req.user._id, { $set: { profilePic: result?.url } }, { new: true });
        if (!user) {
            return ApiError(res, 400, "Error in uploading profile picture 3", "error")
        }
        return ApiResponse(res, 200, "Profile picture uploaded successfully", null, "success")
    } catch (error) {
        console.log("upload process error in user :", error);
        return ApiError(res, 400, "Error in uploading profile picture 4", "error")
    }
}

export const logout = (req, res) => {
    if (!req.headers?.cookie) {
        return ApiError(res, 400, "You're not logged in", "warning");
    }
    res.clearCookie('token');
    return ApiResponse(res, 200, "Logged out successfully", null, "success");
};