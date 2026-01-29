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
const bookAppointment=async(req,res)=>{
    try {
        const{docId,slotDate,slotTime}=req.body
        const userId = req.user.id; 
        const docData=await doctorModel.findById(docId).select('-password')
        if(!docData.available){
            return res.json({success:false,message:"Doctor is not available"})
        }
        let slots_booked=docData.slots_booked
        //checking for slots availibility
        if(slots_booked[slotDate]){
            if(slots_booked[slotDate].includes(slotTime)){
                return res.json({success:false,message:"Slots not available"})
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else{
            slots_booked[slotDate]=[]
            slots_booked[slotDate].push(slotTime)
        }
        const userData=await userModel.findById(userId).select('-password')
        delete docData.slots_booked
        const appointmentData={
            userId,
            docId,
            userData,
            docData,
            amount:docData.fees,
            slotTime,
            slotDate,
            date:Date.now()


        }
        const newAppointment=new appointmentModel(appointmentData)
        await newAppointment.save()
        //save new slots data in docdata
        await doctorModel.findByIdAndUpdate(docId,{slots_booked})
        res.json({success:true,message:"Appointment Booked"})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}
//api to get user appointments my-appointments page

const listAppointment =async(req,res)=>{
    try {
        const userId=req.user.id
        const appointments=await appointmentModel.find({userId})
        res.json({success:true,appointments})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
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
