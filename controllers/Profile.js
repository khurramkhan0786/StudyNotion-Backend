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
       await profileDetails.save();

       //return response
       return res.status(200).json({
        success:true,
        message:"profile is Updated Successfully",
        profileDetails,
       })

    }catch(error){
     
        return res.status(500).json({
            success:false,
            meassage:"failed to update Profile",
            error:error.message,
        })
    }
}

//delete account handler
//Explore ->how can we schedule this deleion operation
exports.deleteAccount = async (req,res) =>{
    try{
       //Get id
       const id = req.user.id;
     //validationid
     const userDetails = await User.findById(id);
     if(!userDetails){
        return res.status(404).json({
            success:false,
            message:"User not found",
        });
     }
     //user profile delete
     await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
     //TODO HW: enrolled user form all enrolled course

     //delete user
     await User.findByIdAndDelete({_id:id});
     //response
     return res.status(200).json({
        success:true,
        message:"User Deleted Successfully"
     })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            meassage:"failed to delete Profile",
        })
    }
}


exports.getAllUserDetails = async (req,res) =>{
    try{
        //get id    
        const id = req.user.id;

        //validation and get user details
        const userDetails = await UserfindById(id).populate("addtionalDetails").exec();
       //return response
       return res.status(200).json({
        success:true,
        message:"User Data Fetched Successfully",
       })


       }
    catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
        })
    }
 }
