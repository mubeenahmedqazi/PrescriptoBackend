import jwt from "jsonwebtoken";

const authDoctor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
    }

    const token = authHeader.split(" ")[1];
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    req.doctor = { id: token_decode.id };
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
  }
};

export default authDoctor;
