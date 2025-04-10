import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: Number, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePic: { type: String, default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png' },
    password: { type: String, required: true },
    role: { type: String, default: 'DONOR' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.plugin(mongooseAggregatePaginate)

const User = mongoose.model('User', userSchema);
export default User;