import ServiceWorker from '../models/serviceWorker.js'
import bcrypt from 'bcryptjs'
import { setUser } from "../jwt/userAuthJWT.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import AccountHandle from '../models/accountHandle.js'
import mongoose from "mongoose"

export const workerRegister = async (req, res) => {
    if (!req.body) {
        return ApiError(res, 400, "Please provide worker details", "warning")
    }
    try {
        const existingWorker = await ServiceWorker.findOne({ email: req?.body?.email });
        if (existingWorker) {
            return ApiError(res, 400, "Email already registered", "info");
        }
        const user = await ServiceWorker.create(req.body);
        if (!user) {
            return ApiError(res, 400, "Error in worker registration", "error")
        }
        const updateStatus = await AccountHandle.create({ worker: user._id });
        if (!updateStatus) {
            return ApiError(res, 400, "Error in worker registration", "error")
        }
        return ApiResponse(res, 201, "Registered successfully", null, "success")
    } catch (err) {
        console.log("worker registration process error :");
        return ApiError(res, 400, "Error in worker registration", "error")
    }
};

export const workerLogin = async (req, res) => {
    if (!req.body) {
        return ApiError(res, 400, "Please provide worker details", "warning")
    }
    const { email, password } = req.body;
    try {
        const worker = await ServiceWorker.findOne({ email });
        if (!worker) {
            return ApiError(res, 400, "Service worker not found", "info")
        }
        const isWorker = await AccountHandle.findOne({ worker: worker._id });
        if (!isWorker) {
            return ApiError(res, 400, "Service Worker not found, your request maybe rejected", "info")
        }
        if (!isWorker.isRequestAccepted) {
            return ApiError(res, 400, "Service Worker request not approved,try again later", "info")
        }
        const isMatch = await bcrypt.compare(password, worker.password);
        if (!isMatch) {
            return ApiError(res, 400, "Invalid credentials", "warning")
        }
        worker.latitude = req.body.lat;
        worker.longitude = req.body.lng;
        await worker.save();
        const token = setUser(worker);
        if (token.error) {
            return ApiError(res, 500, token.error)
        }
        res.cookie('token', token);
        return ApiResponse(res, 200, "Logged in successfully", null, "success")
    } catch (err) {
        console.log("worker login process error :");
        return ApiError(res, 400, "Error in worker login", "error");
    }
};

export const workerUpdate = async (req, res) => {
    if (!req.body) {
        return ApiError(res, 400, "Please provide worker details", "warning")
    }
    const { email } = req.body;
    try {
        const worker = await ServiceWorker.findOne({ email });
        if (!worker) {
            return ApiError(res, 400, "Service worker not found", "info")
        }
        const updateStatus = await ServiceWorker.updateOne({ email }, req.body);
        if (!updateStatus) {
            return ApiError(res, 400, "Error in worker update", "error")
        }
        return ApiResponse(res, 200, "Updated successfully", null, "success")
    } catch (err) {
        console.log("worker update process error :");
        return ApiError(res, 400, "Error in worker update", "error")
    }
}

export const workerUpdatePassword = async (req, res) => {
    if (!req.body) {
        return ApiError(res, 400, "Please provide worker details", "warning")
    }
    const { oldPassword, newPassword } = req.body;
    try {
        const worker = await ServiceWorker.findById(req.user._id);
        if (!worker) {
            return ApiError(res, 400, "Service worker not found", "info")
        }
        const isMatch = await bcrypt.compare(oldPassword, worker.password);
        if (!isMatch) {
            return ApiError(res, 400, "Invalid credentials", "warning")
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await ServiceWorker.findByIdAndUpdate(req.user._id, { password: hashedPassword });

        return ApiResponse(res, 200, "Password updated successfully", null, "success")
    } catch (err) {
        console.log("worker password update process error :");
        return ApiError(res, 400, "Error in worker password update", "error")
    }
}

export const workerDelete = async (req, res) => {
    try {
        const user = req.body;
        if (!user) {
            return ApiError(res, 400, "Please provide user details", "warning")
        }
        const userFound = await ServiceWorker.findByIdAndDelete(user._id);
        if (!userFound) {
            return ApiError(res, 400, "Service worker not found", "info")
        }
        return ApiResponse(res, 200, "Account deleted successfully", null, "success")
    } catch (error) {
        console.log("delete process error in user :");
        return ApiError(res, 400, "Error in account delete", "error")
    }
}

export const workerApprove = async (req, res) => {
    try {
        if (!req.body) {
            return ApiError(res, 400, "Please provide worker id to approve.", "warning")
        }
        const worker = await ServiceWorker.findOne({ _id: req.body?._id })
        if (!worker) {
            return ApiError(res, 400, "Worker not found", "info");
        }
        if (worker.accountStatus === "ACTIVE") {
            return ApiResponse(res, 200, "Worker already approved", null, "info");
        }
        worker.accountStatus = "ACTIVE"
        await worker.save()

        const workerHandle = await AccountHandle.findOne({ worker: new mongoose.Types.ObjectId(worker._id) });
        workerHandle.accountStatus = "ACTIVE"
        workerHandle.isRequestAccepted = true
        await workerHandle.save()
        return ApiResponse(res, 200, "Worker approved successfully", null, "success")
    } catch (error) {
        console.error("Worker approval error:", error);
        return ApiError(res, 500, "Server Error in worker approval", "error");
    }
}

export const workerReject = async (req, res) => {
    try {
        if (!req.body) {
            return ApiError(res, 400, "Please provide worker id to reject.", "warning")
        }
        const worker = await ServiceWorker.findOne({ _id: req.body?._id })
        if (!worker) {
            return ApiError(res, 400, "Worker not found", "info");
        }
        if (worker.accountStatus === "INACTIVE") {
            return ApiResponse(res, 200, "Worker already rejected", null, "info");
        }
        worker.accountStatus = "INACTIVE"
        await worker.save()

        const workerHandle = await AccountHandle.findOneAndDelete({ worker: new mongoose.Types.ObjectId(worker._id) });
        if (!workerHandle) {
            return ApiError(res, 400, "Worker not exists in account handle system", "info");
        }
        return ApiResponse(res, 200, "Worker rejected successfully", null, "success")
    } catch (error) {
        console.error("Worker rejection error:", error);
        return ApiError(res, 500, "Server Error in worker rejection", "error");
    }
}

import ImageKit from "imagekit";
import fs from "fs/promises"
export const workerProfilePicUpload = async (req, res) => {
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
        const result = await imageKitUpload.upload({ file: fileBuffer, fileName: req.file.originalname, folder: "serviceWorker", isPublished: true });

        await fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            }
        });

        const worker = await ServiceWorker.findByIdAndUpdate(req.user._id, { $set: { profilePic: result?.url } }, { new: true });
        if (!worker) {
            return ApiError(res, 400, "Error in uploading profile picture", "error")
        }
        return ApiResponse(res, 200, "Profile picture uploaded successfully", null, "success")
    } catch (error) {
        console.log("upload process error in worker :", error);
        return ApiError(res, 400, "Error in uploading profile picture 4", "error")
    }
}