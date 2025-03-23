const Profile = require("../models/Profile");
const User  = require("../models/User");


exports.updateProfile = async (req,res) =>{
    try{
       //get data
        const {dateOfBirth="",about="",contactNumber,gender} = req.body;
       //get userid
        const id  = req.user.id;
       //validation
       if(!contactNumber || !gender ||!id){
        return res.status(400).json({
            success:false,
            message:"All fiuelds are required",
        });
       } 
       //find profile
       const userDetails = await User.findById(id);
       const profileId = userDetails.additionalDetails;
       const profileDetails = await Profile.findById(profileId);
       //update profile
       profileDetails.dateOfBirth = dateOfBirth;
       profileDetails.about = about;
       profileDetails.gender = gender;
       profileDetails.contactNumber = contactNumber;

       //return response

    }catch(error){

    }
}