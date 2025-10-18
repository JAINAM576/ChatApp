
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "No token provided, authorization denied",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found, token invalid",
        success: false,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired, please login again",
        success: false,
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};