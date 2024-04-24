const Domain = require("../models/Domain");
const Internship = require("../models/Internship");

//isTeacher
exports.createDomain = async(req,res) => {

    try{

        const name = req.body.name;

        if(!name){
            return res.status(400).json({
                success : false,
                message : "All Fields Are Mandatory"
            });
        }

        const duplicate = await Domain.findOne({name});

        if(duplicate){
            return res.status(403).json({
                success : false,
                message : "Domain Exists"
            });
        }

        const domain = await Domain.create({name});

        res.status(200).json({
            success : true,
            message : "Domain created successfully",
            domain
        });

    }catch(err){

        console.log(err);
        res.status(500).json({
            success :false,
            message : "Something went wrong while creating domain , plz tryb again later",
            error : err.message
        });

    }

}

//auth
exports.getDomains = async(req,res) => {
    
    try{

        const domain = await Domain.find().select("name");

        res.status(200).json({
            success : true,
            domain
        });

    }catch(err){

        console.log(err);
        res.status(500).json({
            success : false,
            message : "Something went wrong while fetching domains , plz try again later",
            error : err.message
        });

    }

}

//auth
exports.getDomain = async(req,res) => {

    try{

        const domainName = req.params.domainName;

        if(!(domainName)){
            res.status(400).json({
                success : false,
                message : "Missing domain name"
            })
        }
        const domain = await Domain.find({name : domainName}).populate('internships').select("domain description State startDate endDate");

        if(!domain){
            res.status(404).json({
                success : false,
                message : "No such domain name"
            });
        } 

        res.status(200).json({
            success : true,
            domain
        });

    }catch(err){

        console.log(err);
        res.status(500).json({
            success : false,
            message : "Something went wrong while fetching domain data"
        });

    }

}

//auth isAdmin
exports.deleteDomain = async(req,res) => {

    try{

        const domainName = req.body.domainName;

        

        if(!domainName){
            return res.status(400).json({
                success : false,
                message : "Missing domain name",
            });
        }

        const domain = await Domain.findOne({name : domainName});

        if(!domain){
            res.status(404).json({
                success : false,
                message : "Unknown Domain"
            });
        }

        for (const internshipId of domain.internships) {
            await Internship.findByIdAndDelete(internshipId);
        }

        await Domain.findByIdAndDelete(domain._id);

        return res.status(200).json({
            success : true,
            message : "Domain deleted successfully"
        });

    }catch(err){

        console.log(err);
        res.status(500).json({
            success :false,
            message : "Something went wrong while deleting the domain",
            error : err.message
        });

    }

}