import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import app from './app.js'
import { port } from './constants.js';
import logger from './utils/logger.js';

dotenv.config() // This loads the variables from .env into process.env

connectDB()
.then( () => {
    app.listen(port, () => {
        logger.info(`📡 Server is running at port ${port}`)
    })
})
.catch( (err) => {
    logger.error("MONGO db connection failed !!! ", err);
})






















/* first approach
import express from 'express'
const app = express()

;( async () => {
    try {
        mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR:", error)
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("ERROR:", error)
        throw error
    }
}) ()
*/
// second approach


