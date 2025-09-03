import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies?.token;
    
    console.log('Auth middleware - cookies:', req.cookies)
    console.log('Auth middleware - token:', token ? 'present' : 'missing')

    if (!token) {
      return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - decoded user:', decoded)

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message)
    return res.status(401).json({ success: false, message: "Token is not valid" });
  }
};

export default authenticate;
