import jwt from "jsonwebtoken"

const authUser = async (req, res, next) => {
    try {
        const token = req.headers.token  // or use Authorization header

        if (!token) {
            return res.json({ success: false, message: 'Not Authorized, Login Again' })
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET)

        // ✅ safer place than req.body
        req.user = { id: token_decode.id }

        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default authUser
