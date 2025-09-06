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

// Connect DB & Cloudinary
connectDB()
connectCloudinary()

// ✅ Allow your frontend origins (removed trailing slash)
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://prescripto-xi-eosin.vercel.app",
        "https://prescripto-vr29.vercel.app"
    ],
    credentials: true
}))

// Debug: log origin (optional)
app.use((req, res, next) => {
  console.log("Origin:", req.headers.origin)
  next()
})

app.use(express.json())
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))

// API endpoints
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

// Root test
app.get('/', (req, res) => {
    res.send('API WORKING')
})

// Start server
app.listen(port, () => console.log("Server started on port", port))
