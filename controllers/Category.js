const Tag = require("../models/category");


//create Tag ka handler function

exports.createCategory = async (req,res) =>{
    try{
        //fetch Data
       const {name,description} = req.body;
       //validation
       if(!name || !description){
           return res.status(400).json({
               success:false,
               message:"Please provide all details",
           });
       }
       //create entry in DB
       const tagDetails = await Tag.create({
        name:name,
        description:description,
       });
    console.log(tagDetails);
    //return response
     return res.status(200).json({
         success:true,
         message:"Tag created successfully",
     });

    }
    catch(err){
    return res.status(500).json({
        success:false,
        message:err.message,
    });
    }
};

//getAlltags handler function
exports.showAllCategory = async (req,res) =>{
    try{
        //fetch all tags
        const allcategory = await Tag.find({},{name:true,description:true});
        //return response
        return res.status(200).json({
            success:true,
            message:"All tags fetched successfully", 
            allcategory,
        });
    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        });
    }
}