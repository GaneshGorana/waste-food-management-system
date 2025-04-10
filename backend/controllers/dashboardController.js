import Food from "../models/food.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getDonorDashboard = async (req, res) => {
    try {
        const donorId = req.user?._id;
        const { page = 1, limit = 5 } = req.query;

        const pendingDonations = await Food.countDocuments({ donorId, status: "PENDING" });
        const collectedDonations = await Food.countDocuments({ donorId, status: "COLLECTED" });

        const aggregateQuery = Food.aggregate([
            { $match: { $expr: { $eq: ["$donorId", { $toObjectId: donorId }] } } },
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

        const options = { page: parseInt(page), limit: parseInt(limit) };
        const foodDonations = await Food.aggregatePaginate(aggregateQuery, options);
        return ApiResponse(res, 200, "Donor dashboard data", {
            counts: {
                totalDonations: foodDonations?.totalDocs || 0,
                pendingDonations,
                collectedDonations,
            },
            foodDonations: foodDonations?.docs || [],
            pagination: {
                pagingCounter: foodDonations?.pagingCounter || 0,
                limit: foodDonations?.limit || 0,
                page: foodDonations?.page || 0,
                totalPages: foodDonations?.totalPages || 0,
                totalDocs: foodDonations?.totalDocs || 0,
            }
        }, "success");
    } catch (error) {
        console.error("Donor dashboard error:", error);
        return ApiError(res, 500, "Error fetching donor dashboard data", "error");
    }
};

import ServiceWorker from "../models/serviceWorker.js";
import User from "../models/user.js";
import AccountHandle from "../models/accountHandle.js";
import FoodDelivery from "../models/foodDelivery.js";
import { Types } from "mongoose";

export const getAdminDashboardUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const totalUsers = await User.countDocuments();

        const aggregateQuery = User.aggregate([
            {
                $project: {
                    password: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                }
            }
        ]);

        const options = {
            page,
            limit,
        };

        const users = await User.aggregatePaginate(aggregateQuery, options);

        return ApiResponse(res, 200, "Admin dashboard data fetched successfully", {
            count: {
                totalUsers,
            },
            users: users?.docs || [],
            pagination: {
                totalDocs: users?.totalDocs || 0,
                limit: users?.limit || 0,
                page: users?.page || 0,
                totalPages: users?.totalPages || 0,
                pagingCounter: users?.pagingCounter || 0,
                hasPrevPage: users?.hasPrevPage || false,
                hasNextPage: users?.hasNextPage || false,
                prevPage: users?.prevPage || null,
                nextPage: users?.nextPage || null,
            }
        }, "success");

    } catch (error) {
        console.error("Admin dashboard error:", error);
        return ApiError(res, 500, "Error fetching admin dashboard data", "error");
    }
};

export const getAdminDashboardServiceWorker = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

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

        const aggregateQuery = ServiceWorker.aggregate([
            {
                $project: {
                    password: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                }
            }
        ]);

        const options = { page, limit };

        const serviceWorkers = await ServiceWorker.aggregatePaginate(aggregateQuery, options);

        return ApiResponse(res, 200, "Admin dashboard data fetched successfully", {
            count: {
                totalServiceWorkers: totalServiceWorkers[0]?.count || 0,
                totalActiveWorkers: totalActiveWorkers[0]?.count || 0,
                totalPendingApprovals: totalPendingApprovals[0]?.count || 0,
            },
            serviceWorkers: serviceWorkers?.docs || [],
            pagination: {
                totalDocs: serviceWorkers?.totalDocs || 0,
                limit: serviceWorkers?.limit || 0,
                page: serviceWorkers?.page || 0,
                totalPages: serviceWorkers?.totalPages || 0,
                pagingCounter: serviceWorkers?.pagingCounter || 0,
                hasPrevPage: serviceWorkers?.hasPrevPage || false,
                hasNextPage: serviceWorkers?.hasNextPage || false,
                prevPage: serviceWorkers?.prevPage || null,
                nextPage: serviceWorkers?.nextPage || null,
            }
        }, "success");

    } catch (error) {
        console.error("Admin dashboard error:", error);
        return ApiError(res, 500, "Error fetching admin dashboard data", "error");
    }
}

export const getAdminDashboardFood = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

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
                    ]
                }
            }
        ]);

        const {
            totalPendingFoodDeliveries,
            totalAcceptedDeliveries = [{ count: 0 }],
            totalCollectedDeliveries = [{ count: 0 }],
            totalDeliveredDeliveries = [{ count: 0 }]
        } = foodCounts[0] || {};

        const aggregateQuery = Food.aggregate([
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
                }
            }
        ]);

        const options = { page, limit };

        const foods = await Food.aggregatePaginate(aggregateQuery, options);

        return ApiResponse(res, 200, "Admin dashboard food data fetched successfully", {
            count: {
                totalPendingFoodDeliveries: totalPendingFoodDeliveries[0]?.count || 0,
                totalAcceptedFoodDeliveries: totalAcceptedDeliveries[0]?.count || 0,
                totalCollectedFoodDeliveries: totalCollectedDeliveries[0]?.count || 0,
                totalDeliveredFoodDeliveries: totalDeliveredDeliveries[0]?.count || 0,
                totalFoodDonations: foods?.totalDocs || 0,
            },
            foodDonations: foods?.docs || [],
            pagination: {
                totalDocs: foods?.totalDocs || 0,
                limit: foods?.limit || 0,
                page: foods?.page || 0,
                totalPages: foods?.totalPages || 0,
                pagingCounter: foods?.pagingCounter || 0,
                hasPrevPage: foods?.hasPrevPage || false,
                hasNextPage: foods?.hasNextPage || false,
                prevPage: foods?.prevPage || null,
                nextPage: foods?.nextPage || null,
            }
        }, "success");

    } catch (error) {
        console.error("Admin dashboard error:", error);
        return ApiError(res, 500, "Error fetching admin dashboard food data", "error");
    }
}


export const getServiceWorkerDashboard = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

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

        const aggregateQuery = Food.aggregate([
            { $match: {} },
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
                    donorName: { $ifNull: [{ $arrayElemAt: ["$user.name", 0] }, null] },
                    donorEmail: { $ifNull: [{ $arrayElemAt: ["$user.email", 0] }, null] },
                    donorAddress: { $ifNull: [{ $arrayElemAt: ["$user.address", 0] }, null] }
                }
            }
        ]);

        const options = { page, limit };
        const foods = await Food.aggregatePaginate(aggregateQuery, options);
        return ApiResponse(res, 200, "Service Worker dashboard data fetched successfully", {
            count: {
                totalPendingFoodDeliveries: counts.totalPendingFoodDeliveries?.[0]?.count || 0,
                totalAcceptedFoodDeliveries: counts.totalAcceptedDeliveries?.[0]?.count || 0,
                totalCollectedFoodDeliveries: counts.totalCollectedDeliveries?.[0]?.count || 0,
                totalDeliveredFoodDeliveries: counts.totalDeliveredDeliveries?.[0]?.count || 0,
                totalFoodDonations: totalFoodDonations || 0,
            },
            foodDonations: foods.docs || [],
            pagination: {
                totalDocs: foods.totalDocs || 0,
                limit: foods.limit || 0,
                page: foods.page || 0,
                totalPages: foods.totalPages || 0,
                pagingCounter: foods.pagingCounter || 0,
                hasPrevPage: foods.hasPrevPage || false,
                hasNextPage: foods.hasNextPage || false,
                prevPage: foods.prevPage || null,
                nextPage: foods.nextPage || null
            }
        }, "success");

    } catch (error) {
        console.error("Service Worker dashboard error:", error);
        return ApiError(res, 500, "Error fetching service worker dashboard data", "error");
    }
};
