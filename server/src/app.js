import express from 'express'
import dotenv from 'dotenv'
dotenv.config({path:"./.env"})
import cors from "cors"
import { userRouter } from './routes/user.route.js'
import cookieParser from 'cookie-parser'
import { productRoute } from './routes/product.route.js'
import { adminRouter } from './routes/admin.route.js'

const app = express()

app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json({ limit: "100kb" }))

app.use("/user",userRouter)
app.use("/product",productRoute)
app.use("/admin", adminRouter )

export {app}