import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const organizationSchema = new mongoose.Schema({
    organizationName: { type: String, required: true },
    organizationNumber: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: Number, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePic: { type: String, default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png' },
    password: { type: String, required: true },
    role: { type: String, enum: ['DONOR', 'SERVICE'], default: 'DONOR' },
    isOrganization: { type: Boolean, default: true },
}, { timestamps: true });

organizationSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;