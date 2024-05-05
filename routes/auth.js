const express = require('express');
const cookieParser = require("cookie-parser");
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminSchema');
const Patient = require('../models/PatientSchema');
const Hospital = require('../models/HospitalSchema');
const Doctor = require('../models/DoctorSchema');
const AdmitPatient = require('../models/AdmissionSchema');
const patientmiddleware = require('../middleware/patientmiddleware');
const hospitalmiddleware = require('../middleware/hospitalmiddleware');
const doctormiddleware = require('../middleware/doctormiddleware');
const nodemailer = require('nodemailer');
const multer = require('multer');
require('../db');
const bycrypthash = require('bcryptjs');
router.use(cookieParser());
const storage = multer.memoryStorage();
const upload = multer({storage: storage});
router.post('/patientupdatedata', upload.single('image'), patientmiddleware , async (req, res) => {
    const Email = req.email;
    const {patientname,gender,mobileno,bloodgrp,address,city,district,states} = req.body;
    let update;
    const updateData = {
        patientname,
        gender,
        mobileno,
        bloodgrp,
        address,
        city,
        district,
        states,
    }

    if(req.file) {
        updateData.image = req.file.buffer;
        updateData.contentType = req.file.mimetype;
    }
    update = await Patient.updateOne({email:Email},{
        $set:updateData
    });
    if(update) {
        console.log("Success Updated");
        return res.status(201).json({message:'Updated Successfully'});
        
        
    }else{
        console.log("error");
    }
   
});
router.post('/hospitalupdatedata', upload.single('image'), hospitalmiddleware , async (req, res) => {
    const Email = req.email;
    const {hospitalname,address,city,district,states,hospitaltype,mobileno} = req.body;
    let update;
    const updateData = {
        hospitalname,
        address,
        city,
        district,
        states,
        hospitaltype,
        mobileno,
    }

    if(req.file) {
        updateData.image = req.file.buffer;
        updateData.contentType = req.file.mimetype;
    }
    update = await Hospital.updateOne({email:Email},{
        $set:updateData
    });
    if(update) {
        console.log("Success Updated");
        return res.status(201).json({message:'Updated Successfully'});
        
        
    }else{
        console.log("error");
    }
   
});
router.post('/doctorupdatedata', upload.single('image'), doctormiddleware , async (req, res) => {
    const Email = req.email;
    const {doctorname,gender,profession,mobileno,hospitalname,address,city,district,states,} = req.body;
    let update;
    const updateData = {
        doctorname,
        gender,
        profession,
        mobileno,
        hospitalname,
        address,
        city,
        district,
        states,
    }

    if(req.file) {
        updateData.image = req.file.buffer;
        updateData.contentType = req.file.mimetype;
    }
    update = await Doctor.updateOne({email:Email},{
        $set:updateData
    });
    if(update) {
        console.log("Success Updated");
        return res.status(201).json({message:'Updated Successfully'});
        
        
    }else{
        console.log("error");
    }
   
});
router.post('/patientregister', async (req, res)=> {
    const { patientid,patientname,gender,mobileno,bloodgrp,city,district,states,email,password,code,status } = req.body;
    try {
        let user;
        let savedUser;
        const userdetail = await Patient.findOne({ email });
        if(userdetail) {
            return res.status(203).json({error: "Email Already Exists"});
        }
        user = new Patient({ patientid,patientname,gender,mobileno,bloodgrp,city,district,states,email,password,code,status });
        savedUser = await user.save();

        if (savedUser) {
            function sendRegistrationEmail(userEmail) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });
                const mailOptions = {
                    from: 'No Reply <noreply@quickadmitplus.app>',
                    to: userEmail,
                    subject: 'Welcome to QuickAdmit Plus ! Your One Time Password for QuickAdmit Plus Security',
                    html: `
                        <div style="width:100%;text-align:center;">
                            <div style="padding:10px;display:flex;flex-direction:rows;align-items:center;justify-content:center">
                                <img src="https://codecrafters.infinityfreeapp.com/images/quickadmitpluslogo.png" alt="Logo" width="120px" height="73">
                                <h1 style="font-size:20px;font-weight:bold;">QuickAdmit Plus</h1>
                            </div>
                            <div>
                                <img src="https://codecrafters.infinityfreeapp.com/images/security.png" alt="securitylogo">
                            </div>
                            <div>
                                <h1 style="font-weight:bold;color:#31ac07;">Hey ${patientname} , Your Patient ID is ${patientid}</h1>
                                <h3 style="font-weight:bold;">Wowwee ! Thanks for Registering Accounts with QuickAdmit Plus ! <br/><br/>Use this code to sign up to QuickAdmit Plus Security .</h4>
                                <h1 style="font-weight:bold;color:#d90671;letter-spacing: 8px;">${code}</h1>
                                <h3 style="font-weight:bold;">This code will Securely Sign Up using
                                <br/><br/> ${email} <br/><br/> Please do not reply to this email. This mailbox is not monitored.</h4>
                            </div>
                        </div>
                    `,
                    headers: {
                        'Reply-To': 'noreply@quickadmitplus.app',
                    },
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }
            sendRegistrationEmail(email);
            return res.status(201).json({ message: 'User Registered' });
        }
        else {
            return res.status(422).json({ error: 'User Registration Failed' });
        }
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/patientlogin',async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) {
        return res.json({error: "All Field Is Compulsory . Please Fill all the detail"})
    }
    try {
        const userlogin = await Patient.findOne({email});
        if(userlogin) {
            const ismatch = await bycrypthash.compare(password,userlogin.password);
            const token = await userlogin.generateAuthToken();
            res.setHeader('jwtoken',token);
            if(ismatch) {
                if(userlogin.code == 'AccVerified' && userlogin.status == 'Verified') {
                    return res.status(200).json({message: "Login Successfull & Account Verified"});
                }
                else {
                    return res.status(201).json({message: "Login Successfull & Account Verification Pending"});
                }
            }
            else {
                return res.status(202).json({error: "Incorrect Password"});
            }
        }
        else {
            console.log("Invalid Username");
        }
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/patientotp' ,async (req, res) => {   
    const { email,code } = req.body;
    if(!code) {
        return res.status(401).json({ error: 'OTP Field is Compulsory , Please Fill the Detail' });
    }
    try {
        const userlogin = await Patient.findOne({email});
        if(userlogin) {
            if(code == userlogin.code) {
                let update;
                const updateData = {
                    code: 'AccVerified',
                    status:'Verified',
                }
                update = await Patient.updateOne({email:email},{
                    $set:updateData
                });
                console.log(update)
                if(update) {
                    console.log("Account Activated");
                    return res.status(201).json({ message: 'Account Verified Successfully' });  
                }else{
                    console.log("error");
                }
            }
        }
    }
    catch(err) {
        console.log(err);
    }
});
router.get('/patientdashboard', patientmiddleware ,async (req, res) => {   
    res.send(req.rootUser)
});
router.get('/patientlogout', async (req, res) => {
    console.log("Logout");
    res.status(200).send('User Logout');
});
router.post('/hospitalregister', async (req, res)=> {
    const { hospitalid,hospitalname,city,district,states,hospitaltype,mobileno,email,password,code,status } = req.body;
    try {
        let user;
        let savedUser;
        const userdetail = await Hospital.findOne({ email });
        if(userdetail) {
            return res.status(203).json({error: "Email Already Exists"});
        }
        user = new Hospital({ hospitalid,hospitalname,city,district,states,hospitaltype,mobileno,email,password,code,status });
        savedUser = await user.save();
        if (savedUser) {
            function sendRegistrationEmail(userEmail) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });
                const mailOptions = {
                    from: 'No Reply <noreply@quickadmitplus.app>',
                    to: userEmail,
                    subject: 'Welcome to QuickAdmit Plus ! Your One Time Password for QuickAdmit Plus Security',
                    html: `
                        <div style="width:100%;text-align:center;">
                            <div style="padding:10px;display:flex;flex-direction:rows;align-items:center;justify-content:center">
                                <img src="https://codecrafters.infinityfreeapp.com/images/quickadmitpluslogo.png" alt="Logo" width="120px" height="73">
                                <h1 style="font-size:20px;font-weight:bold;">QuickAdmit Plus</h1>
                            </div>
                            <div>
                                <img src="https://codecrafters.infinityfreeapp.com/images/security.png" alt="securitylogo">
                            </div>
                            <div>
                                <h1 style="font-weight:bold;color:#31ac07;">Hey ${hospitalname}, Your Hospital ID is ${hospitalid}</h1>
                                <h3 style="font-weight:bold;">Wowwee ! Thanks for Registering Accounts with QuickAdmit Plus ! <br/><br/>Use this code to sign up to QuickAdmit Plus Security .</h4>
                                <h1 style="font-weight:bold;color:#d90671;letter-spacing: 8px;">${code}</h1>
                                <h3 style="font-weight:bold;">This code will Securely Sign Up using
                                <br/><br/> ${email} <br/><br/> Please do not reply to this email. This mailbox is not monitored.</h4>
                            </div>
                        </div>
                    `,
                    headers: {
                        'Reply-To': 'noreply@quickadmitplus.app',
                    },
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }
            sendRegistrationEmail(email);
            return res.status(201).json({ message: 'Hospital Registered' });
        }
        else {
            return res.status(422).json({ error: 'Hospital Registration Failed' });
        }
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/hospitallogin',async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) {
        return res.json({error: "All Field Is Compulsory . Please Fill all the detail"})
    }
    try {
        const userlogin = await Hospital.findOne({email});
        if(userlogin) {
            const ismatch = await bycrypthash.compare(password,userlogin.password);
            const token = await userlogin.generateAuthToken();
            res.setHeader('jwtoken',token);
            if(ismatch) {
                if(userlogin.code == 'AccVerified' && userlogin.status == 'Verified') {
                    return res.status(200).json({message: "Login Successfull & Account Verified"});
                }
                else {
                    return res.status(201).json({message: "Login Successfull & Account Verification Pending"});
                }
            }
            else {
                return res.status(202).json({error: "Incorrect Password"});
            }
        }
        else {
            console.log("Invalid Username");
        }
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/hospitalotp' ,async (req, res) => {   
    const { email,code } = req.body;
    if(!code) {
        return res.status(401).json({ error: 'OTP Field is Compulsory , Please Fill the Detail' });
    }
    try {
        const userlogin = await Hospital.findOne({email});
        if(userlogin) {
            if(code == userlogin.code) {
                let update;
                const updateData = {
                    code: 'AccVerified',
                    status:'Verified',
                }
                update = await Hospital.updateOne({email:email},{
                    $set:updateData
                });
                console.log(update)
                if(update) {
                    console.log("Account Activated");
                    return res.status(201).json({ message: 'Account Verified Successfully' });  
                }else{
                    console.log("error");
                }
            }
        }
    }
    catch(err) {
        console.log(err);
    }
});
router.get('/hospitaldashboard', hospitalmiddleware ,async (req, res) => {   
    res.send(req.rootUser)
});
router.get('/hospitallogout', async (req, res) => {
    console.log("Logout");
    res.status(200).send('User Logout');
});
router.post('/doctorregister', async (req, res)=> {
    const { doctorid,doctorname,gender,profession,mobileno,hospitalname,city,district,states,email,password,code,status } = req.body;
    try {
        let user;
        let savedUser;
        const userdetail = await Doctor.findOne({ email });
        if(userdetail) {
            return res.status(203).json({error: "Email Already Exists"});
        }
        user = new Doctor({ doctorid,doctorname,gender,profession,mobileno,hospitalname,city,district,states,email,password,code,status });
        savedUser = await user.save();
        if (savedUser) {
            function sendRegistrationEmail(userEmail) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });
                const mailOptions = {
                    from: 'No Reply <noreply@quickadmitplus.app>',
                    to: userEmail,
                    subject: 'Welcome to QuickAdmit Plus ! Your One Time Password for QuickAdmit Plus Security',
                    html: `
                        <div style="width:100%;text-align:center;">
                            <div style="padding:10px;display:flex;flex-direction:rows;align-items:center;justify-content:center">
                                <img src="https://codecrafters.infinityfreeapp.com/images/quickadmitpluslogo.png" alt="Logo" width="120px" height="73">
                                <h1 style="font-size:20px;font-weight:bold;">QuickAdmit Plus</h1>
                            </div>
                            <div>
                                <img src="https://codecrafters.infinityfreeapp.com/images/security.png" alt="securitylogo">
                            </div>
                            <div>
                                <h1 style="font-weight:bold;color:#31ac07;">Hey ${doctorname}, Your Doctor ID is ${doctorid}</h1>
                                <h3 style="font-weight:bold;">Wowwee ! Thanks for Registering Accounts with QuickAdmit Plus ! <br/><br/>Use this code to sign up to QuickAdmit Plus Security .</h4>
                                <h1 style="font-weight:bold;color:#d90671;letter-spacing: 8px;">${code}</h1>
                                <h3 style="font-weight:bold;">This code will Securely Sign Up using
                                <br/><br/> ${email} <br/><br/> Please do not reply to this email. This mailbox is not monitored.</h4>
                            </div>
                        </div>
                    `,
                    headers: {
                        'Reply-To': 'noreply@quickadmitplus.app',
                    },
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }
            sendRegistrationEmail(email);
            return res.status(201).json({ message: 'Doctor Registered' });
        }
        else {
            return res.status(422).json({ error: 'Doctor Registration Failed' });
        }
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/doctorlogin',async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) {
        return res.json({error: "All Field Is Compulsory . Please Fill all the detail"})
    }
    try {
        const userlogin = await Doctor.findOne({email});
        if(userlogin) {
            const ismatch = await bycrypthash.compare(password,userlogin.password);
            const token = await userlogin.generateAuthToken();
            res.setHeader('jwtoken',token);
            if(ismatch) {
                if(userlogin.code == 'AccVerified' && userlogin.status == 'Verified') {
                    return res.status(200).json({message: "Login Successfull & Account Verified"});
                }
                else {
                    return res.status(201).json({message: "Login Successfull & Account Verification Pending"});
                }
            }
            else {
                return res.status(202).json({error: "Incorrect Password"});
            }
        }
        else {
            console.log("Invalid Username");
        }
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/doctorotp' ,async (req, res) => {   
    const { email,code } = req.body;
    if(!code) {
        return res.status(401).json({ error: 'OTP Field is Compulsory , Please Fill the Detail' });
    }
    try {
        const userlogin = await Doctor.findOne({email});
        if(userlogin) {
            if(code == userlogin.code) {
                let update;
                const updateData = {
                    code: 'AccVerified',
                    status:'Verified',
                }
                update = await Doctor.updateOne({email:email},{
                    $set:updateData
                });
                console.log(update)
                if(update) {
                    console.log("Account Activated");
                    return res.status(201).json({ message: 'Account Verified Successfully' });  
                }else{
                    console.log("error");
                }
            }
        }
    }
    catch(err) {
        console.log(err);
    }
});
router.get('/doctordashboard', doctormiddleware ,async (req, res) => {   
    res.send(req.rootUser)
});
router.get('/doctorlogout', async (req, res) => {
    console.log("Logout");
    res.status(200).send('User Logout');
});
router.get('/patientprofileimg', patientmiddleware ,async (req, res) => {
    if(req.image && req.contentType) {
        res.contentType(req.contentType)
        res.send(req.image) 
    }
});
router.get('/hospitalprofileimg', hospitalmiddleware ,async (req, res) => {
    if(req.image && req.contentType) {
        res.contentType(req.contentType)
        res.send(req.image) 
    }
});
router.get('/doctorprofileimg', doctormiddleware ,async (req, res) => {
    if(req.image && req.contentType) {
        res.contentType(req.contentType)
        res.send(req.image) 
    }
});
router.get('/hospitalnames', async (req, res) => {
    try {
        const hospitals = await Hospital.find({}, 'hospitalname'); // Retrieve only the hospital names
        res.json(hospitals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/patient-info/:patientid', async (req, res) => {
    const patientid = req.params.patientid;

    try {
        // Find the patient in the database by their ID
        const patient = await Patient.findOne({ patientid: patientid });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // If patient found, send back patient information
        res.status(200).json(patient);
    } catch (error) {
        console.error('Error fetching patient information:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/patientadmit', async (req, res)=> {
    const { patientid,patientname,gender,mobileno,bloodgrp,city,district,states,email,hospitalname,country } = req.body;
    try {
        let user;
        let savedUser;
        user = new AdmitPatient({ patientid,patientname,gender,mobileno,bloodgrp,city,district,states,email,hospitalname,country });
        savedUser = await user.save();

        if (savedUser) {
            function sendRegistrationEmail(userEmail) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });
                const mailOptions = {
                    from: 'No Reply <noreply@quickadmitplus.app>',
                    to: userEmail,
                    subject: 'Welcome to QuickAdmit Plus ! Patient Admission Detail',
                    html: `
                        <div style="width:100%;text-align:center;">
                            <div style="padding:10px;display:flex;flex-direction:rows;align-items:center;justify-content:center">
                                <img src="https://codecrafters.infinityfreeapp.com/images/quickadmitpluslogo.png" alt="Logo" width="120px" height="73">
                                <h1 style="font-size:20px;font-weight:bold;">QuickAdmit Plus</h1>
                            </div>
                            <div>
                                <img src="https://codecrafters.infinityfreeapp.com/images/security.png" alt="securitylogo">
                            </div>
                            <div>
                                <h1 style="font-weight:bold;color:#31ac07;">Hey ${patientname} , Patient ID : ${patientid}</h1>
                                <h3 style="font-weight:bold;">Your are Securely Admitted in ${hospitalname} .</h3>
                                <h4>Please do not reply to this email. This mailbox is not monitored.</h4>
                            </div>
                        </div>
                    `,
                    headers: {
                        'Reply-To': 'noreply@quickadmitplus.app',
                    },
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }
            sendRegistrationEmail(email);
            return res.status(201).json({ message: 'User Registered' });
        }
        else {
            return res.status(422).json({ error: 'User Registration Failed' });
        }
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;