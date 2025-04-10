import NearbyPlaces from "../models/nearbyPlaces.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export async function nearbyPlaces(req, res) {
    try {
        const result = await NearbyPlaces.find({ isFoodDelivered: false, food: null }).sort({ createdAt: 1 })
        if (!result) {
            return ApiError(res, 404, "No nearby places found", "info");
        }
        return ApiResponse(res, 200, "Nearby places fetched successfully", result, "success");
    } catch (error) {
        return ApiError(res, 500, "Error while fetching nearby places", "error");
    }
}