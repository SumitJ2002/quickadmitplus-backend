const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const patientSchema = new mongoose.Schema({
    patientid:{
        type: String,
        required:true
    },
    patientname:{
        type: String,
        required:true
    },
    gender:{
        type: String,
        required:true
    },
    mobileno: {
        type: String,
        required:true
    },
    bloodgrp: {
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
patientSchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password,12);
    }
    next();
});
patientSchema.methods.generateAuthToken = async function() {
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
const User = mongoose.model('PATIENT', patientSchema);
module.exports = User