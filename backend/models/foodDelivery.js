import mongoose from 'mongoose'

const foodDeliverySchema = new mongoose.Schema({
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceWorker',
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
    },
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    isAccepted: {
        type: Boolean,
        default: false
    },
    deliveryStatus: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'COLLECTED', 'DELIVERED'],
        default: 'PENDING'
    },
}, { timestamps: true });

const FoodDelivery = mongoose.model('FoodDelivery', foodDeliverySchema);
export default FoodDelivery;