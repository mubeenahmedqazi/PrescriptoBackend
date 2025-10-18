import express from 'express'
import { doctorList, loginDoctor, appointmentsDoctor,appointmentCancel,appointmentComplete,doctorDashboard,doctorProfile,updateDoctorProfile } from '../controllers/doctorController.js'
import authDoctor from '../middlewears/authDoctor.js'

const doctorRouter = express.Router()

// Route to fetch doctor list
doctorRouter.get('/list', doctorList)

// Route for doctor login
doctorRouter.post('/login', loginDoctor)

// Route for doctor appointments (protected)
doctorRouter.get('/appointments',  appointmentsDoctor)
doctorRouter.post('/complete-appointment', authDoctor, appointmentComplete)
doctorRouter.post('/cancel-appointment', authDoctor, appointmentCancel)
doctorRouter.get('/dashboard', authDoctor, doctorDashboard)
doctorRouter.get('/profile', authDoctor, doctorProfile)
doctorRouter.post('/update-profile', authDoctor, updateDoctorProfile)

export default doctorRouter
