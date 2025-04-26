import Admin from '../models/admin.js'
import bcrypt from 'bcryptjs'
import { setUser } from "../jwt/userAuthJWT.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"

export const adminRegister = async (req, res) => {
    if (!req.body) {
        return ApiError(res, 400, "Please provide admin details", "warning")
    }
    try {
        const existingAdmin = await Admin.findOne({ email: req?.body?.email });
        if (existingAdmin) {
            return ApiError(res, 400, "Email already registered", "info");
        }
        const admin = await Admin.create(req.body);
        return ApiResponse(res, 201, "Registered successfully", null, "success")
    } catch (err) {
        console.log("admin registration process error :");
        console.log(err);
        return ApiError(res, 400, "Error in admin registration", "error")
    }
};

export const adminLogin = async (req, res) => {
    if (!req.body) {
        return ApiError(res, 400, "Please provide admin details", "warning")
    }
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return ApiError(res, 400, "Admin not found", "info")
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return ApiError(res, 400, "Invalid credentials", "warning")
        }
        const token = setUser(admin);
        if (token.error) {
            return ApiError(res, 500, token.error)
        }
        res.cookie('token', token);
        return ApiResponse(res, 200, "Logged in successfully", null, "success")
    } catch (err) {
        console.log("admin login process error :");
        return ApiError(res, 400, "Error in admin login", "error")
    }
};

export const adminUpdate = async (req, res) => {
    try {
        if (!req.body) {
            return ApiError(res, 400, "Please provide admin details", "warning")
        }

        const isAdminExists = await Admin.findOne({ _id: req.body._id });
        if (!isAdminExists) {
            return ApiError(res, 400, "Admin not found", "info");
        }

        const admin = await Admin.findByIdAndUpdate(req.body._id, { $set: req.body });
        return ApiResponse(res, 200, "Updated successfully", null, "success")
    } catch (err) {
        console.log("admin update process error :");
        return ApiError(res, 400, "Error in admin update", "error")
    }
};

export const adminUpdatePassword = async (req, res) => {
    if (!req.body) {
        return ApiError(res, 400, "Please provide admin details", "warning")
    }
    const { oldPassword, newPassword } = req.body;
    try {
        const admin = await Admin.findById(req.user._id);
        if (!admin) {
            return ApiError(res, 400, "Admin not found", "info")
        }
        const isMatch = await bcrypt.compare(oldPassword, admin.password);
        if (!isMatch) {
            return ApiError(res, 400, "Invalid credentials", "warning")
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Admin.findByIdAndUpdate(req.user._id, { password: hashedPassword });

        return ApiResponse(res, 200, "Password updated successfully", null, "success")
    } catch (err) {
        console.log("admin password update process error :", err);
        return ApiError(res, 400, "Error in admin password update", "error")
    }
}

export const adminDelete = async (req, res) => {
    try {
        if (!req.body) {
            return ApiError(res, 400, "Please provide admin details", "warning")
        }

        const isAdminExists = await Admin.findOne({ _id: req.body._id });
        if (!isAdminExists) {
            return ApiError(res, 400, "Admin not found", "info");
        }

        const admin = await Admin.findByIdAndDelete(req.body._id);

        if (!admin) {
            return ApiError(res, 400, "Error in admin delete", "error")
        }

        return ApiResponse(res, 200, "Deleted successfully", null, "success")
    } catch (err) {
        console.log("admin delete process error :");
        return ApiError(res, 400, "Error in admin delete", "error")
    }
};

import ImageKit from "imagekit";
import fs from "fs/promises"
export const adminProfilePicUpload = async (req, res) => {
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
        const result = await imageKitUpload.upload({ file: fileBuffer, fileName: req.file.originalname, folder: "admin", isPublished: true });

        await fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            }
        });

        const admin = await Admin.findByIdAndUpdate(req.user._id, { $set: { profilePic: result?.url } }, { new: true });
        if (!admin) {
            return ApiError(res, 400, "Error in uploading profile picture", "error")
        }
        return ApiResponse(res, 200, "Profile picture uploaded successfully", null, "success")
    } catch (error) {
        console.log("upload process error in admin :", error);
        return ApiError(res, 400, "Error in uploading profile picture 4", "error")
    }
}