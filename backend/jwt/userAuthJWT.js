import jwt from 'jsonwebtoken'

export function setUser(user) {
    if (!user) return null;
    try {
        const payload = {
            _id: user?._id,
            name: user?.name,
            email: user?.email,
            profilePic: user?.profilePic,
            state: user?.state,
            city: user?.city,
            pincode: user?.pincode,
            address: user?.address,
            role: user?.role,
        }
        return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1d" });
    } catch (error) {
        console.log("error in jwt generation : ")
        console.log(error)
        return { success: false, message: "Error in generating token,try again later" }
    }
}

export function getUser(token) {
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (error) {
        console.log("error in verify jwt token : ")
        console.log(error)
        return { success: false, message: "Error in verification, please login again", expired: error.name === "TokenExpiredError" }
    }
}

export function whoIsAllowed(userType) {
    return (req, res, next) => {
        try {
            const token = req.headers.cookie?.split("token=")[1];
            if (!token) {
                return res
                    .status(401)
                    .json({
                        success: false, message: "Please login to access this page", messageType: "warning",
                        who: "ANY", unAuthorized: true
                    });
            }
            const user = getUser(token);
            if (!user) {
                return res
                    .status(401)
                    .json({ success: false, message: "Please login to access this page", messageType: "warning", who: "ANY", unAuthorized: true });
            }

            if (user.expired) {
                res.clearCookie("token");
                return res
                    .status(401)
                    .json({ success: false, message: "Session expired, please login again", messageType: "warning", who: "ANY", unAuthorized: true });
            }

            if (userType === "ANY") {
                req.user = user;
                return next();
            }
            if (!["DONOR", "ADMIN", "SERVICE"].includes(user.role)) {
                res.clearCookie("token");
                return res
                    .status(401)
                    .json({ success: false, message: "Invalid request, access denied", messageType: "warning", who: user.role, unAuthorized: true });
            }

            if (user.role !== userType) {
                res.clearCookie("token");
                return res
                    .status(403)
                    .json({ success: false, message: "You are not authorized to access this page", messageType: "warning", who: user.role, unAuthorized: true });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error("Error in whoIsAllowed middleware:", error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    };
}
