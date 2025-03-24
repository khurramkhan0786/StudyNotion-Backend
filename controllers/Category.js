const Category = require("../models/category");
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

//categoryPageDetails
exports.categoryPageDetails = async (req,res) =>{
    try{
          //get category Id
          const {categoryId} = req.body;
          //get courses for for sepecified categoryId
          const selectedCategory = await Category.findById(categoryId)
                                                 .populate("courses")
                                                 .exec();
          //validation
          if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"Data Not Found",
            })
          }
          //get coursesfor different categories
          const differentCategories = await Category.find({
                                                                _id:{$ne:categoryId},
                                                                })
                                                                .populate("courses")
                                                                .exec();
          //get  top selling courses
          //HW
          //return response
          return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories,
            }
          })
       }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}