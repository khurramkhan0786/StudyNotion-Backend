const Course = require("../models/Course");
const  Tag = require("../models/category");
const  User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//createCourse handler function
exports.createCourse = async (req,res) => {
  try{
    //fetch data DB
    const {courseName,courseDescription,whatYouWillLearn,price,tag} = req.body;

    //get thumbnail
    const thumbnail = req.files.thumbnailImage;

    //validation
    if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag  || !thumbnail){
        return res.status(400).json({
            success:false,
            message:"All fields are required",
        })
    }
    //check for instructor
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor Details : ",instructorDetails);
     //TODO :verify that userId and InstructorDetails._id are sameor Different
    if(!instructorDetails){
        return res.status(404).json({
            success:false,
            message:"Instructor is not not found",
        })
    }
    //chech given tag is valid or not
    const tagDetails = await Tag.findById(tag);
    if(!tagDetails){
        return res.status(404).json({
            success:false,
            message:"Tag is not not found",
        })
    }
    //Upload Image to cloudinary
    const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);
    //create an Entry for new course
    const newCourse = await Course.create({
        courseName,
        courseDescription,
        Instructor : instructorDetails._id,
        whatYouWillLearn,
        price,
        tag:tagDetails._id,
        thumbnail:thumbnailImage.secure_url,
    })
    //add the new course to the user schema of Instructor
    await User.findByIdAndUpdate(
        {_id:instructorDetails._id},
        {
            $push:{
                course:newCourse._id,
            }
        },
        {new:true},
    );
 
        // **Update the Tag schema by adding the new course**
        await Tag.findByIdAndUpdate(
            tagDetails._id,
            { $push: { course: newCourse._id } },
            { new: true }
        );
    
         //return response
         return res.status(200).json({
            success:true,
            message:"Course created Successfully",
            data:newCourse,
         })
  }
  catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        meassage:"failed to create Course",
        error:error.message,
    })
  }
}

//getAllCourses handler function
exports.showAllCourses = async (req,res) =>{
    try{
        //Todo:change the 
        const allCourses = await Course.find({});
          
        return res.status(200).json({
            success:true,
            message:"Data for all course fectched successFully",
            data:allCourses,
        })

    }
    catch(err){
     console.log(err);
     return res.status(500).json({
        success:false,
        message:"Cannot Fetch course data",
        error:err.message
     })
    }
}