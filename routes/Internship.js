const express = require('express');
const router = express.Router();

const { createInternship , getInternships , apply , changeState , accept , reject ,getInternshipDetails, getTeacherInternshipDetails } = require("../controllers/Internship");
const { auth , isTeacher , isStudent } = require('../middlewares/Auth');

router.post("/createInternship" , auth , isTeacher , createInternship);
router.get("/getInternships" , auth , getInternships);
router.post("/apply" , auth , isStudent , apply);
router.post("/changeState" , auth , isTeacher , changeState);
router.post("/acceptApplicant" , auth , isTeacher , accept);
router.post("/rejectApplicant" , auth , isTeacher , reject);
router.get("/getInternshipDetails" , auth , getInternshipDetails);
router.get("/getTeacherInternshipDetails" , auth , isTeacher , getTeacherInternshipDetails);


module.exports = router;