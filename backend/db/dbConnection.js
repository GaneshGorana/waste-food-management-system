import mongoose from "mongoose";

const dbConnection = async () => {
    await mongoose.connect(process.env.DB_URL).then(() => console.log("connected")).catch(() => console.log("DB connection problem"))
}

export default dbConnection;