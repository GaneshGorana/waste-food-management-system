import User from '../models/user.js';
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Food from '../models/food.js';
import ServiceWorker from '../models/serviceWorker.js';

export const getSearchTableDataForDonor = async (req, res) => {
    const { foodName, status, madeDate } = req.body;
    const { page = 1, limit = 10 } = req.query;

    if (!req.body) {
        return ApiError(res, 400, "Please provide food search details", "warning");
    }

    try {
        const matchStage = {};
        if (foodName) {
            matchStage.foodName = { $regex: foodName, $options: "i" };
        }
        if (status) {
            matchStage.status = status;
        }
        if (madeDate) {
            matchStage.madeDate = { $gte: new Date(madeDate) };
        }

        const aggregateQuery = Food.aggregate([
            { $match: matchStage },
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
                    },
                    latitude: 1,
                    longitude: 1,
                }
            }
        ]);

        const options = { page: parseInt(page), limit: parseInt(limit) };

        const searchTableData = await Food.aggregatePaginate(aggregateQuery, options);

        return ApiResponse(res, 200, "Search results fetched successfully", {
            foodDonations: searchTableData?.docs || [],
            pagination: {
                totalDocs: searchTableData?.totalDocs || 0,
                limit: searchTableData?.limit || 0,
                page: searchTableData?.page || 0,
                totalPages: searchTableData?.totalPages || 0,
                pagingCounter: searchTableData?.pagingCounter || 0,
                hasPrevPage: searchTableData?.hasPrevPage || false,
                hasNextPage: searchTableData?.hasNextPage || false,
                prevPage: searchTableData?.prevPage || null,
                nextPage: searchTableData?.nextPage || null,
            }
        }, "success");
    } catch (err) {
        console.error("Error in search table data for donor process:", err);
        return ApiError(res, 500, "Error in fetching search table data", "error");
    }
};

export const getSearchTableDataForserviceWorker = async (req, res) => {
    const { foodName, donorName, status, madeDate } = req.body;
    const { page = 1, limit = 10 } = req.query;

    if (!req.body) {
        return ApiError(res, 400, "Please provide food search details", "warning");
    }

    try {
        const matchStage = {};
        if (foodName) {
            matchStage.foodName = { $regex: foodName, $options: "i" };
        }
        if (status) {
            matchStage.status = status;
        }
        if (madeDate) {
            matchStage.madeDate = { $gte: new Date(madeDate) };
        }

        const aggregateQuery = Food.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: "users",
                    localField: "donorId",
                    foreignField: "_id",
                    as: "donor"
                }
            },
            {
                $addFields: {
                    donorName: { $ifNull: [{ $arrayElemAt: ["$donor.name", 0] }, null] }
                }
            },
            {
                $match: donorName
                    ? { donorName: { $regex: donorName, $options: "i" } }
                    : {}
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
                    donorName: 1,
                    donorEmail: { $ifNull: [{ $arrayElemAt: ["$donor.email", 0] }, null] },
                    donorAddress: { $ifNull: [{ $arrayElemAt: ["$donor.address", 0] }, null] },
                    latitude: 1,
                    longitude: 1,
                }
            }
        ]);

        const options = { page: parseInt(page), limit: parseInt(limit) };

        const searchTableData = await Food.aggregatePaginate(aggregateQuery, options);

        return ApiResponse(res, 200, "Search results fetched successfully", {
            foodDonations: searchTableData?.docs || [],
            pagination: {
                totalDocs: searchTableData?.totalDocs || 0,
                limit: searchTableData?.limit || 0,
                page: searchTableData?.page || 0,
                totalPages: searchTableData?.totalPages || 0,
                pagingCounter: searchTableData?.pagingCounter || 0,
                hasPrevPage: searchTableData?.hasPrevPage || false,
                hasNextPage: searchTableData?.hasNextPage || false,
                prevPage: searchTableData?.prevPage || null,
                nextPage: searchTableData?.nextPage || null,
            }
        }, "success");
    } catch (err) {
        console.error("Error in search table data for service worker:", err);
        return ApiError(res, 500, "Error in fetching search table data", "error");
    }
};

export const getSearchTableDataForDonorByAdmin = async (req, res) => {
    const { donorName, email, createdAt } = req.body;
    const { page = 1, limit = 10 } = req.query;

    if (!req.body) {
        return ApiError(res, 400, "Please provide donor search details", "warning");
    }

    try {
        const matchStage = {};
        if (donorName) {
            matchStage.name = { $regex: donorName, $options: "i" };
        }
        if (email) {
            matchStage.email = email;
        }
        if (createdAt) {
            matchStage.createdAt = { $gte: new Date(createdAt) };
        }

        const aggregateQuery = User.aggregate([
            { $match: matchStage },
            {
                $project: {
                    password: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                }
            }
        ]);

        const options = { page: parseInt(page), limit: parseInt(limit) };

        const users = await User.aggregatePaginate(aggregateQuery, options);

        return ApiResponse(res, 200, "Search results fetched successfully", {
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
    } catch (err) {
        console.error("Error in search table data for donor:", err);
        return ApiError(res, 500, "Error in fetching search table data", "error");
    }
};

export const getSearchTableDataForServiceWorkerByAdmin = async (req, res) => {
    const { workerName, email, createdAt } = req.body;
    const { page = 1, limit = 10 } = req.query;

    if (!req.body) {
        return ApiError(res, 400, "Please provide worker search details", "warning");
    }

    try {
        const matchStage = {};
        if (workerName) {
            matchStage.name = { $regex: workerName, $options: "i" };
        }
        if (email) {
            matchStage.email = email;
        }
        if (createdAt) {
            matchStage.createdAt = { $gte: new Date(createdAt) };
        }

        const aggregateQuery = ServiceWorker.aggregate([
            { $match: matchStage },
            {
                $project: {
                    password: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                }
            }
        ]);

        const options = { page: parseInt(page), limit: parseInt(limit) };

        const serviceWorkers = await ServiceWorker.aggregatePaginate(aggregateQuery, options);

        return ApiResponse(res, 200, "Search results fetched successfully", {
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
    } catch (err) {
        console.error("Error in search table data for service worker:", err);
        return ApiError(res, 500, "Error in fetching search table data", "error");
    }
};

export const getSearchTableDataForFoodByAdmin = async (req, res) => {
    const { foodName, donorName, donorEmail, workerName, workerEmail, status, madeDate } = req.body;
    const { page = 1, limit = 10 } = req.query;

    if (!req.body) {
        return ApiError(res, 400, "Please provide food search details", "warning");
    }

    try {
        const matchStage = {};
        if (foodName) {
            matchStage.foodName = { $regex: foodName, $options: "i" };
        }
        if (status) {
            matchStage.status = status;
        }
        if (madeDate) {
            matchStage.madeDate = { $gte: new Date(madeDate) };
        }

        const aggregateQuery = Food.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: "users",
                    localField: "donorId",
                    foreignField: "_id",
                    as: "donor"
                }
            },
            {
                $lookup: {
                    from: "serviceworkers",
                    localField: "acceptedBy",
                    foreignField: "_id",
                    as: "worker"
                }
            },
            {
                $addFields: {
                    donorName: { $ifNull: [{ $arrayElemAt: ["$donor.name", 0] }, null] },
                    donorEmail: { $ifNull: [{ $arrayElemAt: ["$donor.email", 0] }, null] },
                    workerName: { $ifNull: [{ $arrayElemAt: ["$worker.name", 0] }, null] },
                    workerEmail: { $ifNull: [{ $arrayElemAt: ["$worker.email", 0] }, null] }
                }
            },
            {
                $match: {
                    ...(donorName ? { donorName: { $regex: donorName, $options: "i" } } : {}),
                    ...(donorEmail ? { donorEmail: { $regex: donorEmail, $options: "i" } } : {}),
                    ...(workerName ? { workerName: { $regex: workerName, $options: "i" } } : {}),
                    ...(workerEmail ? { workerEmail: { $regex: workerEmail, $options: "i" } } : {})
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
                    donorId: { $ifNull: [{ $arrayElemAt: ["$donor._id", 0] }, null] },
                    donorName: 1,
                    donorEmail: 1,
                    donorAddress: { $ifNull: [{ $arrayElemAt: ["$donor.address", 0] }, null] },
                    workerId: { $ifNull: [{ $arrayElemAt: ["$worker._id", 0] }, null] },
                    workerName: 1,
                    workerEmail: 1,
                    latitude: 1,
                    longitude: 1,
                }
            }
        ]);

        const options = { page: parseInt(page), limit: parseInt(limit) };

        const searchTableData = await Food.aggregatePaginate(aggregateQuery, options);

        return ApiResponse(res, 200, "Search results fetched successfully", {
            foodDonations: searchTableData?.docs || [],
            pagination: {
                totalDocs: searchTableData?.totalDocs || 0,
                limit: searchTableData?.limit || 0,
                page: searchTableData?.page || 0,
                totalPages: searchTableData?.totalPages || 0,
                pagingCounter: searchTableData?.pagingCounter || 0,
                hasPrevPage: searchTableData?.hasPrevPage || false,
                hasNextPage: searchTableData?.hasNextPage || false,
                prevPage: searchTableData?.prevPage || null,
                nextPage: searchTableData?.nextPage || null,
            }
        }, "success");
    } catch (err) {
        console.error("Error in search table data for food by admin:", err);
        return ApiError(res, 500, "Error in fetching search table data", "error");
    }
};