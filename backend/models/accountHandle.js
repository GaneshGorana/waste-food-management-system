import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const accountHandleSchema = new mongoose.Schema({
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceWorker' },
    isRequestAccepted: { type: Boolean, default: false },
    accountStatus: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'INACTIVE' }
}, { timestamps: true });

const AccountHandle = mongoose.model('AccountHandle', accountHandleSchema);
export default AccountHandle;