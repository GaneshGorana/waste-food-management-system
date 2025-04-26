import mongoose, { Types } from "mongoose";
import Food from "../models/food.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import FoodDelivery from "../models/foodDelivery.js";
import User from "../models/user.js";
import AccountHandle from "../models/accountHandle.js";
import ServiceWorker from "../models/serviceWorker.js";

export const getDataByIdOfFoodForDonor = async (req, res) => {
    try {
        const donorId = req.user?._id;
        const { _id } = req.body;

        const totalDonations = await Food.countDocuments({ donorId });
        const pendingDonations = await Food.countDocuments({ donorId, status: "PENDING" });
        const collectedDonations = await Food.countDocuments({ donorId, status: "COLLECTED" });

        const result = await Food.aggregate([
            {
                $match: {
                    $and: [
                        { $expr: { $eq: ["$donorId", { $toObjectId: donorId }] } },
                        { _id: { $eq: new mongoose.Types.ObjectId(_id) } }
                    ]
                }
            },

            {
                $lookup: {
                    from: "serviceworkers",
                    localField: "acceptedBy",
                    foreignField: "_id",
                    as: "acceptedBy"
                }
            },
            {
                $project: {
                    _id: 1,
                    foodName: 1,
                    foodImage: 1,
                    quantity: 1,
                    foodType: 1,
                    foodState: 1,
                    foodCity: 1,
                    foodAddress: 1,
                    foodDeliverAddress: 1,
                    madeDate: 1,
                    expiryDate: 1,
                    status: 1,
                    acceptedBy: {
                        $cond: {
                            if: { $gt: [{ $size: "$acceptedBy" }, 0] },
                            then: { $arrayElemAt: ["$acceptedBy.name", 0] },
                            else: null
                        }
                    },
                    acceptedById:
                    {
                        $ifNull: [{ $arrayElemAt: ["$acceptedBy._id", 0] }, null]
                    }
                }
            }
        ]);

        return ApiResponse(res, 200, "Food update data for donor", {
            totalDonations,
            pendingDonations,
            collectedDonations,
            foodDonations: result
        }, "success");
    } catch (error) {
        console.error("Donor get data by food id error:", error);
        return ApiError(res, 500, "Error fetching updated data of food for donor", "error");
    }
};

export const getDataByIdOfFoodForServiceWorker = async (req, res) => {
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

        const result = await Food.aggregate([
            {
                $match: {
                    _id: { $eq: new mongoose.Types.ObjectId(_id) }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "donorId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $project: {
                    _id: 1,
                    foodName: 1,
                    foodImage: 1,
                    quantity: 1,
                    foodType: 1,
                    foodState: 1,
                    foodCity: 1,
                    foodAddress: 1,
                    foodDeliverAddress: 1,
                    madeDate: 1,
                    expiryDate: 1,
                    status: 1,
                    donorId: { $ifNull: [{ $arrayElemAt: ["$user._id", 0] }, null] },
                    donorName: { $ifNull: [{ $arrayElemAt: ["$user.name", 0] }, null] },
                    donorEmail: { $ifNull: [{ $arrayElemAt: ["$user.email", 0] }, null] },
                    donorAddress: { $ifNull: [{ $arrayElemAt: ["$user.address", 0] }, null] },
                    latitude: 1,
                    longitude: 1,
                }
            }
        ]);
        return ApiResponse(res, 200, "Food updated data for service worker", {
            count: {
                totalPendingFoodDeliveries: counts.totalPendingFoodDeliveries?.[0]?.count || 0,
                totalAcceptedFoodDeliveries: counts.totalAcceptedDeliveries?.[0]?.count || 0,
                totalCollectedFoodDeliveries: counts.totalCollectedDeliveries?.[0]?.count || 0,
                totalDeliveredFoodDeliveries: counts.totalDeliveredDeliveries?.[0]?.count || 0,
                totalFoodDonations: totalFoodDonations || 0,
            },
            foodDonations: result,
        }, "success");

    } catch (error) {
        console.error("Service Worker data get by food id error:", error);
        return ApiError(res, 500, "Error fetching updated data of food for service worker", "error");
    }
};

export const getDataByIdOfDonorForAdmin = async (req, res) => {
    try {
        const { _id } = req.body;

        const totalUsers = await User.countDocuments();

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $eq: new mongoose.Types.ObjectId(_id) }
                }
            },
            {
                $project: {
                    password: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                }
            }
        ]);

        return ApiResponse(res, 200, "Donor updated data for admin", {
            count: {
                totalUsers,
            },
            users: users,
        }, "success");

    } catch (error) {
        console.error("Admin get data by id for donor error:", error);
        return ApiError(res, 500, "Error fetching updated data of donor for admin", "error");
    }
}

export const getDataByIdOfServiceWorkerForAdmin = async (req, res) => {
    try {
        const { _id } = req.body;
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

        const serviceWorkerData = await ServiceWorker.aggregate([
            {
                $match: {
                    _id: { $eq: new mongoose.Types.ObjectId(_id) }
                }
            },
            {
                $project: {
                    password: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                }
            }
        ]);

        return ApiResponse(res, 200, "Service Worker updated data for admin", {
            count: {
                totalServiceWorkers: totalServiceWorkers[0]?.count || 0,
                totalActiveWorkers: totalActiveWorkers[0]?.count || 0,
                totalPendingApprovals: totalPendingApprovals[0]?.count || 0,
            },
            serviceWorkers: serviceWorkerData,
        }, "success");

    } catch (error) {
        console.error("Admin get data by id for service worker error:", error);
        return ApiError(res, 500, "Error fetching updated data of service worker for admin", "error");
    }
}

export const getDataByIdOfFoodForAdmin = async (req, res) => {
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

        const foodData = await Food.aggregate([
            {
                $match: {
                    _id: { $eq: new mongoose.Types.ObjectId(_id) }
                }
            },
            {
                $lookup: {
                    from: "serviceworkers",
                    localField: "acceptedBy",
                    foreignField: "_id",
                    as: "acceptedBy"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "donorId",
                    foreignField: "_id",
                    as: "donor"
                },
            },
            {
                $project: {
                    _id: 1,
                    foodName: 1,
                    foodImage: 1,
                    quantity: 1,
                    foodType: 1,
                    foodState: 1,
                    foodCity: 1,
                    foodAddress: 1,
                    foodDeliverAddress: 1,
                    madeDate: 1,
                    expiryDate: 1,
                    status: 1,
                    donorId: { $ifNull: [{ $arrayElemAt: ["$donor._id", 0] }, null] },
                    donorName: { $ifNull: [{ $arrayElemAt: ["$donor.name", 0] }, null] },
                    donorEmail: { $ifNull: [{ $arrayElemAt: ["$donor.email", 0] }, null] },
                    donorAddress: { $ifNull: [{ $arrayElemAt: ["$donor.address", 0] }, null] },
                    acceptedById: {
                        $ifNull: [{ $arrayElemAt: ["$acceptedBy._id", 0] }, null]
                    },
                    acceptedByName: {
                        $ifNull: [{ $arrayElemAt: ["$acceptedBy.name", 0] }, null]
                    },
                    acceptedByEmail: {
                        $ifNull: [{ $arrayElemAt: ["$acceptedBy.email", 0] }, null]
                    },
                    latitude: 1,
                    longitude: 1,
                }
            }
        ]);

        return ApiResponse(res, 200, "Food updated data for admin", {
            count: {
                totalPendingFoodDeliveries: totalPendingFoodDeliveries[0]?.count || 0,
                totalAcceptedFoodDeliveries: totalAcceptedDeliveries[0]?.count || 0,
                totalCollectedFoodDeliveries: totalCollectedDeliveries[0]?.count || 0,
                totalDeliveredFoodDeliveries: totalDeliveredDeliveries[0]?.count || 0,
                totalFoodDonations: totalFoodDonations || 0,
            },
            foodDonations: foodData,
        }, "success");

    } catch (error) {
        console.error("Admin get data by id for food error:", error);
        return ApiError(res, 500, "Error fetching updated data of food for admin", "error");
    }
}