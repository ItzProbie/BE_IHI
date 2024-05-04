const User = require("../models/User");
const Internship = require("../models/Internship");
const {uploadFileToCloudinary} = require("../utils/cloudinary");



//auth isTeacher
exports.getUser = async(req,res) => {

    try{

        const userMail = req.body.mail;

        if(!userMail){
            return res.status(400).json({
                success : false,
                message : "Missing mail"
            });
        }

        const user = await User.findOne({email : userMail}).select("firstName lastName email role id image dept" );

        if(!user){
            return res.status(404).json({
                success : false,
                message : "Invalid user"
            });
        }

        return res.status(200).json({
            success : true,
            user
        });

    }catch(err){

        return res.status(500).json({
            success : false,
            error : err.message,
            message : "Something went wrong while getting student data , plz try again later"
        });

    }

}

//auth isAdmin
exports.deleteUser = async(req,res) => {

    try{

        const {mail} = req.body;

        if(!mail){
            return res.status(400).json({
                success : false,
                message : "Missing user"
            });
        }

        const user = await User.findOne({email : mail});

        if(!user){
            return res.status(404).json({
                success : false,
                message : "Invalid User"
            });
        }

        await User.findByIdAndDelete(user._id);

        return res.status(200).json({
            success : true,
            message : "user deleted successfully"
        });

    }catch(err){

        console.log(err);
        return res.status(500).json({
            success : false,
            message : "Something went wrong , plz try again later"
        });

    }

}

//auth
exports.changeDP = async(req,res) => {

    try{
        console.log(req);
      const file = req.files.image;
      console.log(file);

      if(!file){
        return res.status(400).json({
            success : false,
            message : "Missing file"
        });
      }
      
      const fileType = file.name.split(".")[1].toLowerCase();
      
      const supportedTypes = ["jpg" , "jpeg" , "png"];

      if(!supportedTypes.includes(fileType)){

        return res.status(400).json({
            success : false,
            message : "Invalid file type"
        });

      }
      const response  =  await uploadFileToCloudinary(file , "internshipPortal");
      

      const user = await User.findByIdAndUpdate(req.user.userId ,
        {image : response.secure_url},{new : true}
      ).select("image");

      return res.status(200).json({
        success : true,
        user
      });


    }catch(err){

        console.log(err);
        return res.status(500).json({
            success : false,
            message : "Error occured while changing the dp , plz try again later",
            error : err.message
        });

    }

}