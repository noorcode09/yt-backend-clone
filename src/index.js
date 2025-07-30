import dotenv from 'dotenv';
import connectDB from "./db/index.js";

dotenv.config() // This loads the variables from .env into process.env

connectDB()






















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


