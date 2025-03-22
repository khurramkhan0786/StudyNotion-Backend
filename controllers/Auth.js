const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");

//*************************** sendOTP **********************************
exports.sendOTP = async (req,res) => { 
    try{
    //fetch email from request ki Body
    const {email} = req.body;

    //check if user already exist
    const checkUserPresent = await User.findOne({email});

    //if user already exist ,then retrun a response
    if(checkUserPresent){
        return res.status(401).json({
            success: false,
            message:'user is already registered'
        })
    }

    //generate otp
    var otp  = otpGenerator.generate(6,{
    upperCaseAlphabets:false,
    lowerCaseAlphabets:false,
    specialChars:false,
   });
    console.log("OTP generate : ",otp);


    //check unique otp or not 
    let result = await OTP.findOne({otp:otp});
    while(result){
    otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
       });
       result = await OTP.findOne({otp:otp});
    }

    const otpPayload = {email, otp}
   
    //create an entry for OTP
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

   //return response successful
    res.status(200).json({
    success:true,
    message:"OTP is send Successfully",
    otp,
  })
}
catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:error.message,
    })
}
};


//************************************* signUp handler *********************************

exports.signUp  = async (req,res) =>{
try{
   //data fetch from request body
    const {firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,otp} =  req.body;
   //validate krlo
   if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
    return res.status(403).json({
        success:false,
        meassage:"All fields are required",
    })
   }
   //2 password match krlo
   if(password !== confirmPassword){
    return res.status(400).json({
        success:false,
        message:"password and confirmPassword does not mach, please try again",
    });
   }
   //check user already exist or not
   const existingUser = await User.findOne({email});
   if(existingUser){
    return res.status(400).json({
        success:false,
        message:"User is already registerd",
    });
   }
   //find most recent OTP stored for the user
   const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
   console.log(recentOtp);
   //validate OTP
   if(recentOtp.length == 0){
      //OTP is not found
      return res.status(400).json({
        success:false,
        message:"OTP Not  Found",
      })
   }else if(otp !== recentOtp.otp){
    //invalid OTP
    return res.status(400).json({
        success:false,
        message:"Invalid OTP",
    });
   }

   //Hash password
   const hashedPassword = await bcrypt.hash(password ,10)


   //entry create in db
   const profileDetails = await Profile.create({
    gender:null,
    dateOfBirth:nulll,
    about:null,
    contactNumber:null,
   })


   const user = await User.create({
    firstName,
    lastName,
    email,
    contactNumber,
     password:hashedPassword,
     accountType,
     additionalDetails:profileDetails._id,
     image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
   })
   //return response
   return res.status(200).json({
    success:true,
    message:'User is registered Successfully',
    user,
   })
}
catch(error){
  console.log(error);
  res.status(500).json({
    success:false,
    message:"user cannot be registerd. Please try again",
  })
}
}

// *************************************** login handler ************************************
exports.login = async (req,res) =>{
    try{
      //get data from req body
      const {email,password} = req.body;
      //validation
      if(!email || !password){
        return res.status(403).json({
            success:false,
            message:"All fieds are required, please try again"
        });
      }
      //user check exist or not 
      const  user = await User.findOne({email}).populate("additionalDetails");
      if(!user){
        return res.status(401).json({
            success:false,
            message:"User is not registered,please signup first",
        })
      }
      //generate JWT, after Password match
      if(await bcrypt.compare(password,user.password)){
        const payload = {
            email : user.email,
            id: user._id,
            accountType:user.accountType,
        }
        const token = jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn:"2h",
        });
        user.token = token;
        user.password = undefined;
      
      //create cookie and send response
      const options = {
        expires: new Date(Date.now() + 3*24*60*60*1000),
        httpOnly:true,
      }
      res.cookie("token",token,options).status(200).json({
        success:true,
        token,
        user,
        message:"Logged in SuccessFully",
      })
    }
    else {
     return res.status(401).json({
        success:false,
        message:"Pasword is incorrect",
     });
    }
    }
    catch(error){
       console.log(error);
       return res.status(500).json({
        success:false,
        message:"Login failure, please try again",
       });
    }

};

//changePassword
exports.changePassword = async (req,res) =>{
    try{
          // 1️⃣ Get data from req.body
          const { email, oldPassword, newPassword, confirmPassword } = req.body;

          // 2️⃣ Validate input fields
          if (!email || !oldPassword || !newPassword || !confirmPassword) {
              return res.status(400).json({ error: "All fields are required." });
          }
          if (newPassword !== confirmPassword) {
              return res.status(400).json({ error: "New passwords do not match." });
          }
  
          // 3️⃣ Find the user in DB
          const user = await User.findOne({ email });
          if (!user) {
              return res.status(404).json({ error: "User not found." });
          }
  
          // 4️⃣ Compare old password with stored hash
          const isMatch = await bcrypt.compare(oldPassword, user.password);
          if (!isMatch) {
              return res.status(400).json({ error: "Old password is incorrect." });
          }
  
          // 5️⃣ Hash new password
          const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 salt rounds
  
          // 6️⃣ Update password in database
          user.password = hashedPassword;
          await user.save();
  
          // 7️⃣ Send email notification
          await mailSender(
            email,
            "Password Changed Successfully",
            "<p>Your password has been updated successfully. If you did not request this change, please contact support immediately.</p>"
        );
  
          // 8️⃣ Return success response
          res.json({ message: "Password updated successfully." });


    }
    catch(error){
        console.error(error);
        res.status(500).json({ error: "Something went wrong." });
    }
}
