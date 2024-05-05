const mongoose = require('mongoose');

module.exports = ()=> {
    try {
        mongoose.connect(process.env.DB)
        console.log("Connection Established Successfully....");
    } catch (error) {
        console.log(error);
        console.log("Could not connect to database");
    }
};