import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized"
      })
    }

    const token = authHeader.split(" ")[1]

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id).select("-password")

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      })
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    })
  }
}

export default authUser
