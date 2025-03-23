const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//create SubSection
exports.createSubSection = async (req,res) =>{
    try{
        //fetch data from req body
        const {sectionId,title,timeDuration,description} = req.body;
        //extract file/video
        const video = req.files.videoFile;
        //validation
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:"Alll fields age required",
            });
        }
        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        //create a sub section
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })
        //update section with this sub section Objects
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                                                {$push:{
                                                                    subSection:subSectionDetails._id,
                                                                }},
                                                                {new:true});
                           //HW: log updated section here,after adding populate query                                     











        //return response
         return res.status(200).json({
            success:true,
            message:"Sub Section Created Successfully",
            updatedSection,
         });
  
    }
    catch(error){
      return res.status(500).json({
        success:false,
        message:"Internal Server error",
        error:error.message,
      })
    }
}

//HW:updatesubSection
// Update SubSection
exports.updateSubSection = async (req, res) => {
    try {
        // Fetch data from request body
        const { subSectionId, title, timeDuration, description } = req.body;
        
        // Check if the subsection exists
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // Check if a new video file is uploaded
        let videoUrl = subSection.videoUrl; // Keep old video if no new one is provided
        if (req.files && req.files.videoFile) {
            const video = req.files.videoFile;
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            videoUrl = uploadDetails.secure_url;
        }

        // Update SubSection details
        const updatedSubSection = await SubSection.findByIdAndUpdate(
            subSectionId,
            {
                title: title || subSection.title,
                timeDuration: timeDuration || subSection.timeDuration,
                description: description || subSection.description,
                videoUrl: videoUrl,
            },
            { new: true } // Return updated document
        );

        // Log updated subsection
        console.log("Updated SubSection:", updatedSubSection);

        // Return response
        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            updatedSubSection,
        });

    } catch (error) {
        console.error("Error updating SubSection:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

//HW: deleteSubsection


// Delete SubSection
exports.deleteSubSection = async (req, res) => {
    try {
        // Extract subsection ID from request
        const { subSectionId } = req.body;

        // Check if the subsection exists
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // Remove the subsection from the database
        await SubSection.findByIdAndDelete(subSectionId);

        // Update the Section model by removing the subsection reference
        await Section.updateMany(
            { subSection: subSectionId },  // Find sections containing this subSection
            { $pull: { subSection: subSectionId } } // Remove the subSection from the array
        );

        return res.status(200).json({
            success: true,
            message: "SubSection deleted successfully",
        });

    } catch (error) {
        console.error("Error deleting SubSection:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};