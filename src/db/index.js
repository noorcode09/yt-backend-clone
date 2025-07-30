import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import logger from "../utils/logger.js";

//  first clean and standard
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        logger.info(`🍃 MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        logger.error("MONGODB connection error ", error)
        process.exit(1)
    }
}


export default connectDB;
