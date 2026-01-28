import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    // ✅ Look in Authorization header first, fallback to token
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.headers.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
  }
};

export default authUser;
