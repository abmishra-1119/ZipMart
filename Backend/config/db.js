import mongoose from "mongoose";

export const connection = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to database');
    } catch (e) {
        console.error('database error', e);
    }
}