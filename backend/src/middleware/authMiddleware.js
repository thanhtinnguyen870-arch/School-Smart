import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ message: "User inactive or not found" });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};
