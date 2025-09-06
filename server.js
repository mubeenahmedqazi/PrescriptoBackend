import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import morgan from 'morgan'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'

const app = express()
const port = process.env.PORT || 4000

connectDB()
connectCloudinary()

// ✅ Allow your frontend origin
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",   // React local
        "https://prescripto-xi-https://prescripto-git-main-ahmedqazimubeen-2330s-projects.vercel.app/.vercel.app/",
         // (later when you deploy React)
    ],
    credentials: true
}))

app.use(express.json())
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))

// api endpoints
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

app.get('/', (req, res) => {
    res.send('API WORKING')
})

app.listen(port, () => console.log("Server started", port))
