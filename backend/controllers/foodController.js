import Food from "../models/food.js";
import FoodDelivery from "../models/foodDelivery.js";
import NearbyPlaces from "../models/nearbyPlaces.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import ServiceWorker from "../models/serviceWorker.js";

export async function foodAdd(req, res) {
    try {
        if (!req.body || !req.file) {
            return ApiError(res, 400, "Please provide food details", "warning");
        }

        const imageKitUpload = new ImageKit({
            publicKey: `${process.env.IMAGE_KIT_PUBLIC_KEY}`,
            privateKey: `${process.env.IMAGE_KIT_PRIVATE_KEY}`,
            urlEndpoint: `${process.env.IMAGE_KIT_URL_ENDPOINT}`
        });
        const fileBuffer = await fs.readFile(req.file.path);
        const uploadedFoodImage = await imageKitUpload.upload({ file: fileBuffer, fileName: req.file.originalname, folder: "food", isPublished: true });

        if (!uploadedFoodImage) {
            return ApiError(res, 400, "Error in uploading food image", "error");
        }

        const food = await Food.create({
            donorId: req.user?._id,
            foodName: req.body.foodName,
            foodImage: uploadedFoodImage?.url || "",
            quantity: req.body.quantity,
            foodState: req.body.foodState,
            foodCity: req.body.foodCity,
            foodAddress: req.body.foodAddress,
            madeDate: req.body.madeDate,
            expiryDate: req.body.expiryDate,
            foodType: req.body.foodType,
            latitude: parseFloat(req.body.latitude),
            longitude: parseFloat(req.body.longitude),
        })

        if (!food) {
            return ApiError(res, 500, "Error while adding food", "error");
        }

        const result = await FoodDelivery.create({
            food: food._id,
            isAccepted: false,
            deliveryStatus: "PENDING"
        })

        if (!result) {
            return ApiError(res, 500, "Error while adding food for delivery", "error");
        }

        return ApiResponse(res, 201, "Food added successfully", null, "success");
    } catch (error) {
        console.log("Error while adding food:", error);
        return ApiError(res, 500, "Error while adding food", "error");
    }
}

import ImageKit from "imagekit";
import fs from "fs/promises"
export const foodImageUpload = async (req, res) => {
    try {
        if (!req.file) {
            return ApiError(res, 400, "Please provide a food image", "warning")
        }
        const imageKitUpload = new ImageKit({
            publicKey: `${process.env.IMAGE_KIT_PUBLIC_KEY}`,
            privateKey: `${process.env.IMAGE_KIT_PRIVATE_KEY}`,
            urlEndpoint: `${process.env.IMAGE_KIT_URL_ENDPOINT}`
        });
        const fileBuffer = await fs.readFile(req.file.path);
        const result = await imageKitUpload.upload({ file: fileBuffer, fileName: req.file.originalname, folder: "food", isPublished: true });
        const food = await Food.findByIdAndUpdate(req.body._id, { $set: { foodImage: result?.url } }, { new: true });
        if (!food) {
            return ApiError(res, 400, "Error in uploading food image", "error")
        }
        return ApiResponse(res, 200, "food image uploaded successfully", null, "success")
    } catch (error) {
        console.log("error in food image upload :", error);
        return ApiError(res, 400, "Error in uploading food image", "error")
    }
}

export async function foodUpdate(req, res) {
    try {
        if (!req.body) {
            return ApiError(res, 400, "Please provide food details", "warning");
        }
        const food = await Food.findById(req.body._id);
        if (!food) {
            return ApiError(res, 404, "Food not found", "info");
        }
        const updatedFood = await Food.findByIdAndUpdate(
            req.body._id,
            { $set: { ...req.body } }
        );

        if (!updatedFood) {
            return ApiError(res, 500, "Error while updating food details", "error");
        }

        return ApiResponse(res, 200, "Food details updated successfully", updatedFood, "success");
    } catch (error) {
        console.log("Error while updating food:", error);
        return ApiError(res, 500, "Error while updating food", "error");
    }
}

export const foodDelete = async (req, res) => {
    try {
        if (!req.body) {
            return ApiError(res, 400, "Please provide food details", "warning");
        }
        const food = await Food.findById(req.body._id);
        if (!food) {
            return ApiError(res, 404, "Food not found", "info");
        }

        if (food.status !== "PENDING") {
            return ApiError(res, 400, "Food already accepted, can't be deleted", "info");
        }

        const deletedFood = await Food.findByIdAndDelete(req.body._id);
        if (!deletedFood) {
            return ApiError(res, 500, "Error while deleting food", "error");
        }

        const foodDelivery = await FoodDelivery.findOneAndDelete({ food: food._id });

        if (!foodDelivery) {
            return ApiError(res, 204, "Food already Removed from Food Delivery list", "info");
        }

        const nearbyPlace = await NearbyPlaces.findOneAndDelete({ food: food._id });

        if (!nearbyPlace) {
            return ApiError(res, 204, "Error while deleting nearby place", "info");
        }

        return ApiResponse(res, 200, "Food deleted successfully", null, "success");
    } catch (error) {
        console.log("Error while deleting food:", error);
        return ApiError(res, 500, "Error while deleting food", "error");
    }
}

export async function foodDeliveries(req, res) {
    try {
        const foodDeliveries = await Food.find({ $or: [{ status: "PENDING" }, { foodDeliverAddress: "" }] });
        if (!foodDeliveries) {
            return ApiError(res, 404, "No food deliveries available", "info");
        }
        return ApiResponse(res, 200, "Available food deliveries fetched successfully", foodDeliveries, "success");
    } catch (error) {
        return ApiError(res, 500, "Error while fetching food deliveries", "error");
    }
}

export const foodDeliveryAccept = async (req, res) => {
    try {
        const worker = req.user;
        if (!req.body?.foodId) {
            return ApiError(res, 400, "Food details are required", "warning");
        }

        const food = await Food.findById(req.body.foodId);
        if (!food) {
            return ApiError(res, 404, "Food not found", "info");
        }
        if (food.status !== "PENDING") {
            return ApiError(res, 400, "Food work done", "info");
        }
        const existsFoodDelivery = await FoodDelivery.findOne({ food: food._id, workerId: worker._id });

        if (existsFoodDelivery?.deliveryStatus === "ACCEPTED") {
            return ApiResponse(res, 200, "Food already accepted", null, "info");
        }

        if (existsFoodDelivery?.deliveryStatus == "DELIVERED" || existsFoodDelivery?.deliveryStatus == "COLLECTED") {
            return ApiError(res, 400, "You can not accept more than one food", "info");
        }

        const delivery = await FoodDelivery.findOneAndUpdate({ food: food._id }, {
            $set: {
                isAccepted: true,
                [worker.role === "SERVICE" ? "workerId" : "organizationId"]: worker._id,
                deliveryStatus: "ACCEPTED"
            }
        });

        if (!delivery) {
            return ApiError(res, 500, "Error while accepting food delivery", "error");
        }
        food.status = "ACCEPTED";
        food.acceptedBy = worker._id;
        await food.save();

        return ApiResponse(res, 200, "Food accepted successfully", food, "success");

    } catch (error) {
        console.log("Error while accepting food delivery:", error);
        return ApiError(res, 500, "Error while accepting food delivery at server", "error");
    }
};

export const foodDeliveryAcceptFromNearbyPlace = async (req, res) => {
    try {
        const worker = req.user;
        if (!req.body) {
            return ApiError(res, 400, "Food details not provided, please provide", "warning");
        }

        const food = await Food.findById(req.body.foodId);
        if (!food) {
            return ApiError(res, 404, "Food not found", "info");
        }
        const existsFoodDelivery = await FoodDelivery.findOne({ food: food._id });
        if (!existsFoodDelivery) {
            return ApiError(res, 404, "Food delivery not found", "info");
        }
        if (existsFoodDelivery.isAccepted == false && food.foodDeliverAddress !== "") {
            return ApiError(res, 400, "Food delivery already accepted", "info");
        }
        const place = await NearbyPlaces.findOneAndUpdate(
            { _id: req.body.placeId },
            {
                isFoodDelivered: false,
                [worker.role === "SERVICE" ? "worker" : "organization"]: worker._id,
                food: food._id,
            }, { new: true });
        if (!place) {
            return ApiError(res, 500, "Failed to add food to place", "error");
        }
        food.foodDeliverAddress = place.placeAddress;
        await food.save();

        return ApiResponse(res, 200, "Food delivery address added successfully.", food, "success");
    } catch (error) {
        console.log("Error while adding food delivery address from nearby place:", error);
        return ApiError(res, 500, "Error while adding food delivery from nearby place ", "error");
    }
}

export const foodDeliveryCollect = async (req, res) => {
    try {
        if (!req.body) {
            return ApiError(res, 400, "Food details are required", "warning");
        }
        const food = await Food.findById(req.body?.foodId);
        if (!food) {
            return ApiError(res, 404, "Food not found", "info");
        }
        if (food.status !== "ACCEPTED") {
            return ApiError(res, 400, "Food not accepted yet", "info");
        }
        food.status = "COLLECTED";
        await food.save();

        const delivery = await FoodDelivery.findOne({ food: food._id });
        if (!delivery) {
            return ApiError(res, 404, "Food delivery not found", "info");
        }
        delivery.deliveryStatus = "COLLECTED";
        await delivery.save();

        return ApiResponse(res, 200, "Food collected successfully", food, "success");
    } catch (error) {
        return ApiError(res, 500, "Error while collecting food at server", "error");
    }
}

export const foodDeliveryComplete = async (req, res) => {
    try {
        if (!req.body) {
            return ApiError(res, 400, "Food details are required", "warning");
        }
        const food = await Food.findById(req.body?.foodId);
        if (!food) {
            return ApiError(res, 404, "Food not found", "info");
        }
        if (food.status !== "COLLECTED") {
            return ApiError(res, 400, "Food not collected yet", "info");
        }
        if (food.foodDeliverAddress === "") {
            return ApiError(res, 400, "Sophisticated delivery address is not added, you need to contact TL and donate nearby people or get nearby people location from the menu.", "info");
        }
        food.status = "DELIVERED";
        await food.save();

        const delivery = await FoodDelivery.findOne({ food: food._id });
        if (!delivery) {
            return ApiError(res, 404, "Food delivery not found", "info");
        }
        delivery.deliveryStatus = "DELIVERED";
        await delivery.save();

        return ApiResponse(res, 200, "Food delivered successfully", food, "success");
    } catch (error) {
        return ApiError(res, 500, "Error while delivering food at server", "error");
    }
}

export const foodAllocateToWorker = async (req, res) => {
    try {
        if (!req.body) {
            return ApiError(res, 400, "Food and  Service Worker id are required", "warning");
        }
        if (!req.body?.foodId) {
            return ApiError(res, 400, "Food id is required", "warning");
        }
        const food = await Food.findById(req.body?.foodId);
        if (!food) {
            return ApiError(res, 404, "Food not found", "info");
        }
        if (food.status == "ACCEPTED") {
            return ApiError(res, 400, "Food is already accepted", "info");
        }

        const worker = await ServiceWorker.findById(req.body?.serviceWorkerId);

        if (!worker) {
            return ApiError(res, 404, "Service Worker not found", "info");
        }

        const delivery = await FoodDelivery.findOne({ food: food._id, workerId: worker._id });
        if (delivery) {
            return ApiResponse(res, 200, "Food already allocated to worker", null, "info");
        }

        const foodDelivery = await FoodDelivery.create({
            food: food._id,
            workerId: worker._id,
            isAccepted: true,
            deliveryStatus: "ACCEPTED"
        });

        if (!foodDelivery) {
            return ApiError(res, 500, "Error while allocating food to worker", "error");
        }

        const place = await NearbyPlaces.find({ _id: req.body?.foodDeliverAddress, food: food._id, worker: worker._id });
        if (place.length > 0) {
            return ApiResponse(res, 200, "Food already allocated to worker at described address", null, "info");
        }
        const result = await NearbyPlaces.findOneAndUpdate(
            { _id: req.body.foodDeliverAddress },
            {
                isFoodDelivered: false,
                worker: worker._id,
                food: food._id,
            }, { new: true }
        );

        if (!result) {
            return ApiError(res, 500, "Error while allocating food to worker at described address", "error");
        }

        food.status = "ACCEPTED";
        food.acceptedBy = worker._id;
        food.foodDeliverAddress = result.placeAddress;
        await food.save();

        return ApiResponse(res, 200, "Food allocated successfully", null, "success");
    } catch (error) {
        console.log("Error while allocating food to worker:", error);
        return ApiError(res, 500, "Error while allocating food to worker at server", "error");
    }
}