import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config()
const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGO_URI as string
        // console.log(mongoURI)
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export default connectDB;