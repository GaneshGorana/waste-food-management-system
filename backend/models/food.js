import mongoose from 'mongoose'
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const foodSchema = new mongoose.Schema({
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    foodName: { type: String, required: true },
    foodImage: { type: String, default: "" },
    quantity: { type: String, required: true },
    foodState: { type: String, required: true },
    foodCity: { type: String, required: true },
    foodAddress: { type: String, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'COLLECTED', 'DELIVERED'],
        default: 'PENDING'
    },
    acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceWorker',
        default: null
    },
    madeDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    foodType: { type: String, required: true },
    foodDeliverAddress: { type: String, default: "" },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
}, { timestamps: true });

foodSchema.plugin(mongooseAggregatePaginate)

const Food = mongoose.model('Food', foodSchema);
export default Food;