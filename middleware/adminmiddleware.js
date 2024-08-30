const Admin = require("../models/AdminSchema");
const jwt = require("jsonwebtoken");
const adminmiddleware = async (req, res, next) => {
  try {
    res.setHeader(
      "Access-Control-Allow-Origin",
      "https://quickadmitplus-frontend.vercel.app"
    );
    const token = req.headers["jwtoken"];
    if (!token) {
      return res.status(401).send("Unauthorized: No Token Provided");
    }
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    let rootUser = await Admin.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });
    if (!rootUser) {
      throw new Error("User Not Found");
    }
    req.token = token;
    req.rootUser = rootUser;
    req.email = rootUser.email;
    next();
  } catch (err) {
    res.status(401).send("Unauthorized : No Token Provided");
    console.log(err);
  }
};
module.exports = adminauthenticate;
