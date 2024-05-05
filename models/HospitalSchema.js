const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const hospitalSchema = new mongoose.Schema({
    hospitalid:{
        type: String,
        required:true
    },
    hospitalname:{
        type: String,
        required:true
    },
    address:{
        type: String,
        required:false
    },
    city:{
        type: String,
        required:true
    },
    district: {
        type: String,
        required:true
    },
    states: {
        type: String,
        required:true
    },
    hospitaltype: {
        type: String,
        required:true
    },
    mobileno: {
        type: String,
        required:true
    },
    email:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required:true
    },
    code:{
        type: String,
        required:true
    },
    status:{
        type: String,
        required:true
    },
    tokens : [
        {
            token : {
                type: String,
                required:true
            }
        }
    ],
    image:Buffer,
    contentType: String,
})
hospitalSchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password,12);
    }
    next();
});
hospitalSchema.methods.generateAuthToken = async function() {
    try {
        let token = jwt.sign({_id:this._id},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    }
    catch(err) {
        console.log(err);
    }
}
const User = mongoose.model('HOSPITAL', hospitalSchema);
module.exports = User