const User = require('../models/User');
const Otp = require("../models/Otp");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");

exports.sendOTP = async(req,res) => {

    try{

        const {email} = req.body;

        if(await User.findOne({email})){
            return res.status(401).json({
                success : false,
                message : "User already resistered"
            });
        }

        var otp = otpGenerator.generate(6 , {
            upperCaseAlphabets : false,
            lowerCaseAlphabets : false,
            specialChars : false
        });

        result = await Otp.findOne({otp : otp});

        while(result){
            otp = otpGenerator.generate(6 , {
                upperCaseAlphabets : false,
                lowerCaseAlphabets : false,
                specialChars : false
            });
            result = await Otp.findOne({otp : otp}); 
        }

        const newOTP = await Otp.create({
            email , otp
        });

        console.log(newOTP);

        res.status(200).json({
            success : true,
            message : "OTP sent successfully"
        });

    }catch(err){
        console.log(err);
        res.status(500).json({
            success : false,
            message : "Something went wrong",
            error : err.message
        });
    }

}

exports.signUp = async(req,res) => {

    try{

        const{
            firstName , lastName , email , password , id , mentor , dept , otp
        } = req.body;

        // console.log(otp);
        // console.log(req.body);

        const role = req.body.role || 'Student';

        if(!firstName || !email || !password || !lastName || !id || !dept || !otp){
            return res.status(404).json({
                success : false,
                mssg : "ALL FIELDS ARE MANDATORY"
            });
        }
        
        if(role==='Student' && !(mentor)){
            return res.status(404).json({
                success : false,
                mssg : "ALL FIELDS ARE MANDATORY"
            });
        }

        const existingMail = await User.findOne({email});
        const existingId = await User.findOne({id});

        if(existingId || existingMail){
            
            return res.status(400).json({
                success : false,
                mssg : "User already registered please login"
            });
        }

        const otpDB = await Otp.find({email}).sort({createdAt : -1}).limit(1);
       console.log(otpDB);
        if(otpDB.length === 0){

            return res.status(400).json({
                success : false,
                mssg : "INVALID OTP"
            });

        }
        else if(parseInt(otp) !== parseInt(otpDB[0].otp)){
            console.log(otp , otpDB[0].otp);
           
            return res.status(400).json({
                success : false,
                mssg : "INVALID OTP"
            });

        }

        if(role==='Student'){
            
            const mentorUser = await User.findOne({email : mentor});
            if(!mentorUser && mentorUser.role==='Student'){
               
                return sessionStorage.status(400).json({
                    success : false,
                    message : "Invalid mentor"
                });
            }

            const hashedPassword = await bcrypt.hash(password , 10);

            const user = await User.create({
                firstName,
                lastName,
                email,
                role,
                password : hashedPassword,
                id,
                mentor : mentorUser._id,
                image : `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
                dept
            });

        }

        else {

            const hashedPassword = await bcrypt.hash(password , 10);

            const user = await User.create({
                firstName,
                lastName,
                email,
                role,
                password : hashedPassword,
                id,
                image : `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`,
                dept
            });
            
        }

        

        return res.status(200).json({
            success : true,
            message : "User successfully registered"
        });



    }catch(err){

        console.log(err);

        return res.status(500).json({
            success : false,
            error : err.message,
            message : "Cant signup , plz try again later"
        });

    }

}

exports.login = async(req,res) => {

    try{

        const {email , password} = req.body;

        if(!email || !password){
            return res.status(403).json({
                success : false,
                message : "Missing login credentials"
            });
        }

        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json({
                success : false,
                message : "User not registered"
            });
        }

        if(bcrypt.compare(password , user.password)){

            const payload = {
                email : user.email,
                userId : user._id,
                role : user.role
            };

            const token = jwt.sign(payload ,  process.env.JWT_SECRET , {
                expiresIn : "2h"
            });

            res.status(200).json({
                success : true,
                token ,
                name : `${user.firstName} ${user.lastName}` ,

                dp : user.image , 
                role : user.role ,
                id : user.id,
                applications : user.applications,
                message : "Logged in successfully"
            });

        }
        else{
            return res.status(401).json({
                success : false,
                message : "Password is incorrect"
            });
        }

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : "Somethng went wrong while login , plz try again later",
            error : err.message
        })
    }

}