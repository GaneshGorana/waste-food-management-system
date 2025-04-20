import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const nearbyPlacesSchema = new mongoose.Schema({
    placeName: {
        type: String,
    },
    placeState: {
        type: String,
    },
    placeCity: {
        type: String,
    },
    placeAddress: {
        type: String,
    },
    placePincode: {
        type: Number,
    },
    isFoodDelivered: {
        type: Boolean,
        default: false,
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceWorker",
    },
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
    },

}, { timestamps: true });

nearbyPlacesSchema.plugin(mongooseAggregatePaginate)

const NearbyPlaces = mongoose.model("NearbyPlaces", nearbyPlacesSchema);
export default NearbyPlaces;