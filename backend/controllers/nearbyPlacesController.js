import NearbyPlaces from "../models/nearbyPlaces.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const nearbyPlaces = async (req, res) => {
    try {
        const result = await NearbyPlaces.find({ isFoodDelivered: false, food: null }).sort({ createdAt: 1 }).select("-__v -createdAt -updatedAt").lean();
        if (!result) {
            return ApiError(res, 404, "No nearby places found", "info");
        }
        return ApiResponse(res, 200, "Nearby places fetched successfully", result, "success");
    } catch (error) {
        return ApiError(res, 500, "Error while fetching nearby places", "error");
    }
}

export const addNearByPlace = async (req, res) => {
    try {
        if (!req.body) {
            return ApiError(res, 400, "Please provide nearby place details", "warning")
        }

        const result = await NearbyPlaces.create(req.body)

        if (!result) {
            return ApiError(res, 400, "Error while adding nearby place", "error")
        }
        return ApiResponse(res, 200, "Place added successfully", null, "success")

    } catch (error) {
        return ApiError(res, 500, "Error while adding nearby places", "error");
    }
}

export const updateNearByPlace = async (req, res) => {
    try {
        if (!req.body) {
            return ApiError(res, 400, "Please provide nearby place details", "warning")
        }
        const { _id } = req.body;
        const result = await NearbyPlaces.findByIdAndUpdate(_id, req.body, { new: true })

        if (!result) {
            return ApiError(res, 400, "Error while updating nearby place", "error")
        }
        return ApiResponse(res, 200, "Place updated successfully", null, "success")

    } catch (error) {
        return ApiError(res, 500, "Error while updating nearby places", "error");
    }
}
export const deleteNearByPlace = async (req, res) => {
    try {
        if (!req.body) {
            return ApiError(res, 400, "Please provide nearby place details", "warning")
        }
        const { _id } = req.body;
        const result = await NearbyPlaces.findByIdAndDelete(_id)

        if (!result) {
            return ApiError(res, 400, "Error while deleting nearby place", "error")
        }
        return ApiResponse(res, 200, "Place deleted successfully", null, "success")

    } catch (error) {
        return ApiError(res, 500, "Error while deleting nearby places", "error");
    }
}