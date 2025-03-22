const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcryptjs");


//resetPasswordToken
exports.resetPasswordToken = async (req,res) =>{
    try{
    //get email from req body
    const email = req.body.email;
    //check user for this email, email validation
    const user = await User.findOne({email:email});
    if(!user){
        return res.json({success:false,
            message:"Tur Email is not registered with us"
        });
    }
    //genreate token
    const token = crypto.randomUUID()
    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
        {email:email},
       {
        token:token,
        resetPasswordExpires:Date.now() + 5*60*1000,
       },
       {new:true});
    //create url
     const url = `http://localhost:3000/update-password/${token}`
    //send mail constaining the url
    await mailSender(email,"Password Resent Link",`password Reset Link:${url}`);
    //return response
     return res.json({
        success:true,
        message:"Email sent Successfully, please check email and change pwd",
     })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
         success:false,
         message:"Some went wrong,while sending resst pwd",
        });
     }
}



//resetPassword

exports.resetPassword = async (req,res) =>{
    try{
      //data fetch

      const {password,confirmPassword,token} = req.body;
      //validation
      if(password !== confirmPassword){
        return res.json({
            success:false,
            message:'Password not matching',
        });
      }
      //get user details from db using token
      const userDetails = await User.findOne({token:token});
      //if no entry -invalid token
      if(!userDetails){
         return res.json({
            success:false,
            message:'Token is Invalid',
         })
      }
      //token time check
      if(userDetails.resetPasswordExpires < Date.now()){
               return res.json({
                success:false,
                message:"token is Expired, Please login again"
               })
      }
      //hash pwd
      const hashedPassword = await bcrypt.hash(password,10);
      //Paasword update
      await User.findOneAndUpdate(
        {token:token},
        {password:hashedPassword},
        {new:true},
      )
      //return response
      return res.status(200).json({
        success:true,
        message:"password reset successfully"
      })
    } 
    catch(error){
        console.log(error);
        return res.status(500).json({
         success:false,
         message:"Something  went wrong ,while sending reset pwd",
        });
     }
}