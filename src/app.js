import express, { urlencoded } from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";


const app = express()

// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true
// }));
app.use(cors())

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"))
app.use(cookieParser())




//////////////////
// Routes imports
//////////////////
import userRouter from "./routes/user.routes.js";




//////////////////////
// routes declaration
//////////////////////
// http://localhost:3000/api/v1/users

app.use("/api/v1/users", userRouter)


export default app;