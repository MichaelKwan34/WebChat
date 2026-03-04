import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, no token" });
  }
};

export default protect;