import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctor.Model.js'
import appointmentModel from '../models/appointmentModel.js'
//import razorpay from 'razorpay'

// API TO REGISTER USER
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !password || !email) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid email" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: 'Enter a strong password' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = { name, email, password: hashedPassword }
        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API TO LOGIN USER
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API TO GET USER PROFILE
// API TO GET USER PROFILE
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id   // ✅ this comes from authUser middleware
    const userData = await userModel.findById(userId).select('-password')
    res.json({ success: true, userData })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}


// API TO UPDATE USER PROFILE
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id  // ✅ get user ID from token
        const { name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        const updatedData = {
            name,
            phone,
            address: JSON.parse(address),
            dob,
            gender
        }

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
            updatedData.image = imageUpload.secure_url
        }

        const user = await userModel.findByIdAndUpdate(userId, updatedData, { new: true })
        res.json({ success: true, message: "Profile Updated", userData: user })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//api to book appointment
const bookAppointment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      })
    }

    const userData = req.user
    const { docId, slotDate, slotTime } = req.body

    if (!docId || !slotDate || !slotTime) {
      return res.status(400).json({
        success: false,
        message: "Missing appointment data"
      })
    }

    const appointment = new appointmentModel({
      userId: userData._id,
      userData,
      docId,
      slotDate,
      slotTime
    })

    await appointment.save()

    res.json({
      success: true,
      message: "Appointment booked successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

//api to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // ✅ Fix ObjectId comparison
    if (appointmentData.userId.toString() !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    // ✅ Mark as cancelled (not delete)
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    // ✅ Release doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);
    if (doctorData.slots_booked[slotDate]) {
      doctorData.slots_booked[slotDate] = doctorData.slots_booked[slotDate].filter(
        (e) => e !== slotTime
      );
      await doctorModel.findByIdAndUpdate(docId, { slots_booked: doctorData.slots_booked });
    }

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}
// const razorpayInstance=new razorpay({
//     key_id:'',
//     key_secret:''
// })
// Api to make appointment using razorpay

// const paymentRazorpay=async(req,res)=>{

// }




export { registerUser, loginUser, getProfile, updateProfile,bookAppointment,listAppointment ,cancelAppointment}
