const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {CourseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");


//capture the payment and intiate the Razorpay order
exports.capturePayment = async (req,res) =>{
    //get UserId and CourseId
    const {course_id} = req.body;
    const userId =  req.user.id;
    //validation
    //valid courseId
    if(!course_id){
        return res.json({
            success:false,
            message:"Please provide valid course Id",
        })
    };
    //valid courseDetails
    let course;
    try{
        course = await course.findById(course_id);
        if(!course){
            return res.json({
                success:false,
                message:'Could not find the course',
            })
        }
        //user already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.json({
                success:false,
                message:"Could not find the Course",
            })
        }
    }
    catch(error){
       console.error(error);
       return res.status(500).json({
        success:false,
        message:error.message,
       })
    }
    //order create
    const amount = Course.price;
    const currency = "INR";

    const options ={
        amount :amount*100,
        currency,
        receipt:Math.random(Date.now()).toString(),
        notes :{
                  courseId:course_id,
                  userId,
               }
    };
    try{
      //initiate the payment using razorpay
      const paymentResponse = await instance.orders.create(options);
      console.log(paymentResponse);
      return res.status(200).json({
        success:true,
        courseName:course.courseName,
        courseDescription:course.courseDescription,
        thumbnail:course.thumbnail,
        orderId:paymentResponse.id,
        currency:paymentResponse.currency,
        amount:paymentResponse.amount,

      })
    }
    catch(error){
        console.log(error);
            res.json({
                success:true,
                message:"Could not initiate order"
            })
    }
    //return response
};


//verify Signature of Razorpay and Server
exports.verifySignature = async (req,res) =>{
    const webhookSecret = "1234567";
    //send  signature by razorpay
    const signature = req.headers["x-razorpay-signature"];  //its a behaivor of razorpay

   const shasum =  crypto.createdHmac("sha256",webhookSecret); //hashed base authentication based
   shasum.update(JSON.stringify(req.body));
   const digest = shasum.digest("hex");
   
   if(signature === digest){
    console.log("Payment is authorized");
    const {courseId,userId} = req.body.payload.payment.entity.notes;
    try{
        //ful fill the action

        //find the course and enroll the student in it
        const enrolledCourse = await Course.findOne({_id:courseId},
                                                {$push:{studentsEnrolled:userId}},
                                                {new:true},
        );
        if(!enrolledCourse){
            return res.status(500).json({
                success:false,
                message:"Course not found",
            })
        }
        console.log(enrolledCourse);
        //find the Student and add the course to their list enrolled course me
        const enrolledStudent = await  User.findOneAndUpdate({_id:userId},
                                                              {$push:{courses:courseId}},
                                                              {new:true},
        );
        console.log(enrolledCourse);

        //mail send kardo confirmation wala
        const emailResponse = await mailSender(
                        enrolledStudent.email,
                        "Conguratultions from KhanEdu",
                        "Conguratulations, you are onboarded into new StudyNotion Course",
        );
        console.log(emailResponse);
        return res.status(200).json({
            succes:true,
            message:"Signature Verified and Course AudioDecoder",
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
   else{
     return res.status(400).json({
        success:false,
        message:"Invalid request",
     })
   }

}




