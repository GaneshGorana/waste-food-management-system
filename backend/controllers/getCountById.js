import { Types } from "mongoose";
import Food from "../models/food.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import FoodDelivery from "../models/foodDelivery.js";
import User from "../models/user.js";
import AccountHandle from "../models/accountHandle.js";

export const getCountByIdOfFoodForDonor = async (req, res) => {
    try {
        const donorId = req.user?._id;

        const totalDonations = await Food.countDocuments({ donorId });
        const pendingDonations = await Food.countDocuments({ donorId, status: "PENDING" });
        const collectedDonations = await Food.countDocuments({ donorId, status: "COLLECTED" });

        return ApiResponse(res, 200, "Food count data donor", {
            totalDonations,
            pendingDonations,
            collectedDonations,
        }, "success");
    } catch (error) {
        console.error("Donor count by id error:", error);
        return ApiError(res, 500, "Error fetching updated count of food for donor", "error");
    }
};

export const getCountByIdOfFoodForServiceWorker = async (req, res) => {
    try {
        const { _id } = req.body;

        const foodCounts = await FoodDelivery.aggregate([
            {
                $facet: {
                    totalPendingFoodDeliveries: [
                        { $match: { deliveryStatus: "PENDING" } },
                        { $count: "count" }
                    ],
                    totalAcceptedDeliveries: [
                        {
                            $match: {
                                deliveryStatus: "ACCEPTED",
                                workerId: new Types.ObjectId(req.user?._id)
                            }
                        },
                        { $count: "count" }
                    ],
                    totalCollectedDeliveries: [
                        {
                            $match: {
                                deliveryStatus: "COLLECTED",
                                workerId: new Types.ObjectId(req.user?._id)
                            }
                        },
                        { $count: "count" }
                    ],
                    totalDeliveredDeliveries: [
                        {
                            $match: {
                                deliveryStatus: "DELIVERED",
                                workerId: new Types.ObjectId(req.user?._id)
                            }
                        },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const totalFoodDonations = await Food.countDocuments();

        const counts = foodCounts[0] || {};

        return ApiResponse(res, 200, "Food updated count for service worker", {
            count: {
                totalPendingFoodDeliveries: counts.totalPendingFoodDeliveries?.[0]?.count || 0,
                totalAcceptedFoodDeliveries: counts.totalAcceptedDeliveries?.[0]?.count || 0,
                totalCollectedFoodDeliveries: counts.totalCollectedDeliveries?.[0]?.count || 0,
                totalDeliveredFoodDeliveries: counts.totalDeliveredDeliveries?.[0]?.count || 0,
                totalFoodDonations: totalFoodDonations || 0,
            },
        }, "success");

    } catch (error) {
        console.error("Service Worker count get by food id error:", error);
        return ApiError(res, 500, "Error fetching updated count of food for service worker", "error");
    }
};

export const getCountByIdOfDonorForAdmin = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        return ApiResponse(res, 200, "Donor updated count for admin", {
            count: {
                totalUsers,
            },
        }, "success");

    } catch (error) {
        console.error("Admin get count by id of donor error:", error);
        return ApiError(res, 500, "Error fetching updated count of donor for admin", "error");
    }
}

export const getCountByIdOfServiceWorkerForAdmin = async (req, res) => {
    try {
        const serviceWorkerCounts = await AccountHandle.aggregate([
            {
                $facet: {
                    totalServiceWorkers: [{ $count: "count" }],
                    totalActiveWorkers: [
                        { $match: { accountStatus: "ACTIVE" } },
                        { $count: "count" }
                    ],
                    totalPendingApprovals: [
                        { $match: { isRequestAccepted: false } },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const {
            totalServiceWorkers = [{ count: 0 }],
            totalActiveWorkers = [{ count: 0 }],
            totalPendingApprovals = [{ count: 0 }]
        } = serviceWorkerCounts[0] || {};

        return ApiResponse(res, 200, "Service Worker updated data for admin", {
            count: {
                totalServiceWorkers: totalServiceWorkers[0]?.count || 0,
                totalActiveWorkers: totalActiveWorkers[0]?.count || 0,
                totalPendingApprovals: totalPendingApprovals[0]?.count || 0,
            },
        }, "success");

    } catch (error) {
        console.error("Admin get count by if for service worker error:", error);
        return ApiError(res, 500, "Error fetching updated count of service worker for admin", "error");
    }
}

export const getCountByIdOfFoodForAdmin = async (req, res) => {
    try {
        const foodCounts = await FoodDelivery.aggregate([
            {
                $facet: {
                    totalPendingFoodDeliveries: [
                        { $match: { deliveryStatus: "PENDING" } },
                        { $count: "count" }
                    ],
                    totalAcceptedDeliveries: [
                        { $match: { deliveryStatus: "ACCEPTED" } },
                        { $count: "count" }
                    ],
                    totalCollectedDeliveries: [
                        { $match: { deliveryStatus: "COLLECTED" } },
                        { $count: "count" }
                    ],
                    totalDeliveredDeliveries: [
                        { $match: { deliveryStatus: "DELIVERED" } },
                        { $count: "count" }
                    ],
                }
            }
        ]);

        const totalFoodDonations = await Food.countDocuments();

        const {
            totalPendingFoodDeliveries,
            totalAcceptedDeliveries = [{ count: 0 }],
            totalCollectedDeliveries = [{ count: 0 }],
            totalDeliveredDeliveries = [{ count: 0 }],
        } = foodCounts[0] || {};

        return ApiResponse(res, 200, "Food updated count for admin", {
            count: {
                totalPendingFoodDeliveries: totalPendingFoodDeliveries[0]?.count || 0,
                totalAcceptedFoodDeliveries: totalAcceptedDeliveries[0]?.count || 0,
                totalCollectedFoodDeliveries: totalCollectedDeliveries[0]?.count || 0,
                totalDeliveredFoodDeliveries: totalDeliveredDeliveries[0]?.count || 0,
                totalFoodDonations: totalFoodDonations || 0,
            },
        }, "success");

    } catch (error) {
        console.error("Admin get count by id for food error:", error);
        return ApiError(res, 500, "Error fetching updated count of food for admin", "error");
    }
}