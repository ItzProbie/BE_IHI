const Internship = require("../models/Internship");
const User = require("../models/User");
const Domain = require("../models/Domain");
const mongoose = require("mongoose");

// Auth isTeacher
exports.createInternship = async (req, res) => {
    try {
        const { domain, description, startDate, endDate } = req.body;

        if (!domain || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Missing Fields"
            });
        }

        let domainEntry = await Domain.findOne({ name: domain });

        if (!domainEntry) {
            return res.status(400).json({
                success: false,
                message: "No such domain exists"
            });
        }

        const internship = await Internship.create({
            createdBy: req.user.userId,
            domain: domainEntry._id,
            description: description || "",
            state: true,
            startDate,
            endDate
        });

        await Domain.findByIdAndUpdate(
            domainEntry._id,
            { 
                $addToSet: { teachers: req.user.userId }, 
                $push: { internships: internship._id } 
            }
        );

        await User.findByIdAndUpdate(req.user.userId , 
            {
                $push : {applications : internship._id}
            }
        )

        return res.status(200).json({
            success: true,
            message: "Internship created successfully",
            internship
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating internship, please try again later",
            error: err.message
        });
    }
};

//Auth
exports.getInternships = async(req,res) => {

    try{

        const internships = await Internship.find().populate({
            path : "domain",
            select : "name"
        }).populate({
            path : "createdBy",
            select : "firstName lastName email image dept"
        }).exec();

        res.status(200).json({
            success : true,
            internships
        });

    }catch(err){

        console.log(err);
        res.status(500).json({
            success : false,
            message : "Something went wrong while fetching internships , plz try again later",
            error : err.message 
        });

    }
    
}

// exports.getInternshipDetails = async(req,res) => {

//     try{
//         const user = await User.findById(req.user.userId)
//         .populate({
//             path: 'applications',
//             populate: {
//                 path: 'createdBy', 
//                 model: 'User',
//                 path : "domain",
//                 model : Domain
//             },
//         })
//         .exec();
    
//             const internships = user;


//             res.status(200).json({
//                 success : true,
//                 internships
//             });

//     }catch(err){

//         console.log(err);
//         res.status(500).json({
//             success : false,
//             message : "Something went wrong while fetching internships , plz try again later",
//             error : err.message 
//         });

//     }
    
// }

//auth isTeacher
// exports.getInternshipDetails = async (req, res) => {
//     try {
//         const user = await User.findById(req.user.userId)
//             .populate({
//                 path: 'applications',
//                 populate: {
//                     path: 'createdBy',
//                     model: 'User'
//                 }
//             })
//             .exec();

//         const internshipPromises = user.applications.map(async application => {
//             const domains = await Domain.find({ _id: { $in: application.domain } }).select('name');
//             return {
//                 _id: application._id,
//                 domain: domains.map(domain => domain.name),
//                 description: application.description,
//                 createdBy: application.createdBy,
//                 startDate: application.startDate,
//                 endDate: application.endDate,
//                 State: application.State,
//                 // Include other fields here
//             };
//         });

//         const internships = await Promise.all(internshipPromises);

//         res.status(200).json({
//             success: true,
//             internships
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             success: false,
//             message: "Something went wrong while fetching internships, please try again later",
//             error: err.message
//         });
//     }
// };
exports.getInternshipDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate({
                path: 'applications',
                populate: {
                    path: 'createdBy',
                    model: 'User'
                }
            })
            .exec();
            
            const internshipPromises = user.applications.map(async application => {
                const domains = await Domain.find({ _id: { $in: application.domain } }).select('name');
                const index = application.applicants.findIndex(applicant => applicant.user.equals(new mongoose.Types.ObjectId(user._id)));
            return {
                _id: application._id,
                domain: domains.map(domain => domain.name),
                description: application.description,
                createdBy: application.createdBy,
                startDate: application.startDate,
                endDate: application.endDate,
                State: application.State, // Assuming the State field is named 'State'
                state: application.applicants[index !== -1 ? index : 0].state, // Assuming state is stored in the first applicant
                // Include other fields here
            };
        });

        const internships = await Promise.all(internshipPromises);

        res.status(200).json({
            success: true,
            internships
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Something went wrong while fetching internships, please try again later",
            error: err.message
        });
    }
};


exports.getTeacherInternshipDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate({
                path: 'applications',
                populate: {
                    path: 'createdBy',
                    model: 'User'
                }
            })
            .exec();
                
        const internshipPromises = user.applications.map(async application => {
            const domains = await Domain.find({ _id: { $in: application.domain } }).select('name');
            const applicants = await User.find({ applications: { $in: [application._id] } });
            const index = await application.applicants.findIndex(applicant =>{ applicant.user.equals(new mongoose.Types.ObjectId(applicant._id))
            console.log(applicant, "gyf",applicant._id )});
            console.log("nashe ",index)
            return {
                _id: application._id,
                domain: domains.map(domain => domain.name),
                description: application.description,
                createdBy: application.createdBy,
                startDate: application.startDate,
                endDate: application.endDate,
                State: application.State, // Assuming the State field is named 'State' // Assuming state is stored in the first applicant
                applicants: applicants.map(applicant => ({
                    _id: applicant._id,
                    firstName: applicant.firstName,
                    lastName: applicant.lastName,
                    dept: applicant.dept,
                    id: applicant.id,
                    // state: applicant.applications.find(app => app.equals(application._id)).state
                    state: application.applicants[index !== -1 ? index : 0].state, // Assuming state is stored in the first applicant

                })),
            };
        });

        const internships = await Promise.all(internshipPromises);

        res.status(200).json({
            success: true,
            internships
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Something went wrong while fetching internships, please try again later",
            error: err.message
        });
    }
};



exports.changeState = async(req,res) => {

    try{

        const {internshipId} = req.body;

        if(!internshipId){
            return res.status(400).json({
                success : false,
                message : "Internship Id is mandatory"
            });
        }

        const internship = await Internship.findById(internshipId);

        if(!internship){
            return res.status(404).json({
                success : false,
                message : "Invalid internship id"
            });
        }

        console.log(req.user.userId);
        console.log(internship.createdBy);

        const updatedCreatedBy = new mongoose.Types.ObjectId(req.user.userId); // Assuming req.user.userId is a string representation of an ObjectId

        if (!internship.createdBy.equals(updatedCreatedBy)) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized",
          });
        }

        internship.State = !internship.State;
        
        const updatedInternship = await internship.save();

        return res.status(200).json({
            success : true,
            updatedInternship
        });

    }catch(err){

        console.log(err);
        res.status(500).json({
            success : false,
            message : "Something went wrong while changing State , plz try again later",
            error : err.message 
        });

    }

}

//auth isStudent
exports.apply = async(req,res) => {

    try{

        const {internshipId} = req.body;

        const app = await User.findById(req.user.userId).select("applications");

        if(app.applications.includes(internshipId)){
            return res.status(405).json({
                success : false,
                message : "Already registered"
            });
        }

        console.log(req.body);
        if(!internshipId){
            return res.status(400).json({
                success : false,
                message : "Invalid internship"
            });
        }

        const internship = await Internship.findById(internshipId);

        if(!internship || !(internship?.State)){
            return res.status(404).json({
                success : false,
                message : "Invalid internship"
            });
        }

        internship.applicants.push({
            user : req.user.userId,
            state : 'pending'
        });
        
        await internship.save();
        
        const user = await User.findByIdAndUpdate(req.user.userId , {
            $push: {
                applications : internship._id
            }
        });

        return res.status(200).json({
            success : true,
            user
        });


    }catch(err){

        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong while applying , plz try again later',
            error : err.message
        });

    }

}

//auth isTeacher
exports.accept = async(req,res) => {

    try{
        console.log(req.body);
        const {studentId , internshipId } = req.body;

        if(!studentId || !internshipId){
            return res.status(400).json({
                success : false,
                message : "All fields are mandatory",
            });
        }

        const internship = await Internship.findById(internshipId);
        const user = await User.findById(studentId);
        
        if(!internship || !user){
            console.log("hii")
            return res.status(404).json({
                success : false,
                message : "Invalid inputs"
            });
        }

        const teacher = new mongoose.Types.ObjectId(req.user.userId);
        
        if(!internship.createdBy.equals(teacher)){
            return res.status(401).json({
                success : false,
                message : "Unauuthorized"
            });
        }

        console.log(internship)
        const index = internship.applicants.findIndex(applicant => applicant.user.equals(new mongoose.Types.ObjectId(user._id)));
        console.log("index ",index);
        if(index!==-1){
            internship.applicants[index].state = "accepted";
            console.log(internship.applicants[index])
            const updatedInternship = await internship.save();
            return res.status(200).json({
                success : true,
                updatedInternship
            });
        }

        return res.status(404).json({
            success: false,
            message: "Applicant not found in the internship applicants list"
        });


    }catch(err){

        console.log(err);
        return res.status(500).json({
            success : false,
            message : "Something went wrong while accepting internship , plz try again later",
            error : err.message
        });

    }

}

exports.reject = async(req,res) => {

    try{

        const {studentId , internshipId } = req.body;

        if(!studentId || !internshipId){
            return res.status(400).json({
                success : false,
                message : "All fields are mandatory",
            });
        }

        const internship = await Internship.findById(internshipId);
        const user = await User.findById(studentId);

        if(!internship || !user){
            return res.status(404).json({
                success : false,
                message : "Invalid inputs"
            });
        }

        const teacher = new mongoose.Types.ObjectId(req.user.userId);
        
        if(!internship.createdBy.equals(teacher)){
            return res.status(401).json({
                success : false,
                message : "Unauuthorized"
            });
        }

        const index = internship.applicants.findIndex(applicant => applicant.user.equals(new mongoose.Types.ObjectId(user._id)));

        if(index!==-1){
            internship.applicants[index].state = "rejected";
            const updatedInternship = await internship.save();
            return res.status(200).json({
                success : true,
                updatedInternship
            });
        }

        return res.status(404).json({
            success: false,
            message: "Applicant not found in the internship applicants list"
        });


    }catch(err){

        console.log(err);
        return res.status(500).json({
            success : false,
            message : "Something went wrong while rejecting internship , plz try again later",
            error : err.message
        });

    }

}