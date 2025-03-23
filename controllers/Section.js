const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection  =async (req,res) =>{
    try{
         //data fetch
         const {sectionName,CourseId} = req.body;
         //data validation
         if(!sectionName || ! CourseId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
         }
         //create section
         const newSection = await Section.create({sectionName});
         //update course with section ObjectId
         const updatedCourseDetails = await Course.findByIdAndUpdate(CourseId,
                                                      {
                                                        $push:{
                                                        courseContent:newSection._id,
                                                      }
                                                      },
                                                      {new:true},
                                                    )
          //HW = use populate to replace section/sub-sections both in the UpdatedCourseDetails                                         
         //return response
        return res.status(200).json({
            success:true,
            message:'section created successfully',
            updatedCourseDetails,
        })
    }
    catch(error){
    return res.status(500).json({
        success:false,
        message:"Unable to create Section,please try again",
        error:error.message,
    })
    }
}


exports.updateSection = async (req,res) =>{
    try{
        //fetch data 
        const {sectionName,sectionId} = res.body;
        //validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
         }
        //update data
        const section   = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
        //return response
        return res.status(200).json({
            success:true,
            message:'section updated successfully',
        })
         
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update Section,please try again",
            error:error.message,
        })
    }
}


exports.deleteSection = async (req,res) =>{
    try{
           //get Id - assuming that we are sending ID in Params
           const {sectionId} =  req.params
           //use findByIdAndDelete
           await Section.findByIdAndDelete(sectionId);
           //TODO: do we need to delete the enry form the courseSchema
           //return response 
           return res.status(200).json({
            success:true,
            message:"Section deleted Successfully"
           })
       }

    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update Section,please try again",
            error:error.message,
        })
    }
}