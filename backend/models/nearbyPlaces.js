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
        default: null,
    },
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        default: null,
    },
    latitude: {
        type: Number,
        default: 0,
    },
    longitude: {
        type: Number,
        default: 0,
    },

}, { timestamps: true });

nearbyPlacesSchema.plugin(mongooseAggregatePaginate)

const NearbyPlaces = mongoose.model("NearbyPlaces", nearbyPlacesSchema);
export default NearbyPlaces;