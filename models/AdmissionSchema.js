const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AdmissionSchema = new mongoose.Schema({
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
    hospitalname:{
        type: String,
        required:false
    },
    country:{
        type: String,
        required:false
    },
})
const User = mongoose.model('ADMIT', AdmissionSchema);
module.exports = User