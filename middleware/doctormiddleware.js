const Doctor = require("../models/DoctorSchema");
const jwt = require("jsonwebtoken");
const doctormiddleware = async (req, res, next) => {
  try {
    res.setHeader(
      "Access-Control-Allow-Origin",
      "https://quickadmitplus-frontend-re4kbt8yh-sumit-jaiswars-projects.vercel.app"
    );
    const token = req.headers["jwtoken"];
    if (!token) {
      return res.status(401).send("Unauthorized: No Token Provided");
    }
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    let rootUser = await Doctor.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });
    if (!rootUser) {
      throw new Error("Patient Not Found");
    }
    req.token = token;
    req.rootUser = rootUser;
    req.doctorid = rootUser.doctorid;
    req.email = rootUser.email;
    req.image = rootUser.image;
    req.contentType = rootUser.contentType;
    next();
  } catch (err) {
    res.status(401).send("Unauthorized : No Token Provided");
    console.log(err);
  }
};
module.exports = doctormiddleware;
