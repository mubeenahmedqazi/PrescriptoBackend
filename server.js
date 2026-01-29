import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import morgan from 'morgan'

const app = express()
const port = process.env.PORT || 4000

// Connect DB & Cloudinary
connectDB()
connectCloudinary()

// Basic middleware first
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://prescripto-xi-eosin.vercel.app",
        "https://prescripto-vr29.vercel.app"
    ],
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// Import routes AFTER middleware
let adminRouter, doctorRouter, userRouter

try {
    adminRouter = (await import('./routes/adminRoute.js')).default
    doctorRouter = (await import('./routes/doctorRoute.js')).default
    userRouter = (await import('./routes/userRoute.js')).default
    
    // API endpoints
    app.use('/api/admin', adminRouter)
    app.use('/api/doctor', doctorRouter)
    app.use('/api/user', userRouter)
    
    console.log('Routes loaded successfully')
} catch (error) {
    console.error('Error loading routes:', error.message)
    
    // Provide basic routes if import fails
    app.get('/api/admin/test', (req, res) => res.json({ message: 'Admin API' }))
    app.get('/api/doctor/test', (req, res) => res.json({ message: 'Doctor API' }))
    app.get('/api/user/test', (req, res) => res.json({ message: 'User API' }))
}

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() })
})

// Root
app.get('/', (req, res) => {
    res.send('API WORKING')
})

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

// Start server
app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`)
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
})