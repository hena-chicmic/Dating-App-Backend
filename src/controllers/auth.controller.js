const authServices=require('../services/auth.service')


const register=async(req,res,next)=>{
    try{
        await authServices.register(req.body)

        res.status(201).json({
            message:"user registered successfully.Please verify"
        })
    }catch(error){
        next(error)
    }
}

const verifyEmail=async(req,res,next)=>{
    try{
        const{user_id,OTPtoken}=req.body
        await authServices.verifyEmail(user_id,OTPtoken)
        res.status(200).json({
            message:"verified successfully"
        })
          
    }catch(error){
        next(error)
    }
}

const resendVerification=async(req,res,next)=>{
    try{
        const {user_id}=req.body
        await authServices.resendVerification(user_id)
        res.status(200).json({
            message:"OTP sent again"
        })
    }catch(error){
        next(error)
    }
} 

const login=async(req,res,next)=>{
    try{
        const {accessToken,refreshToken,user}=await authServices.login(req.body)

        res.cookie("refreshToken",refreshToken,{
            httpOnly:true,
            secure:false
        })

        res.status(200).json({
            message:"Login successful",
            accessToken
        })
    }catch(error){
        next(error)
    }
}

const forgotPassword=async(req,res,next)=>{
    try{
        const {email}=req.body
        await authServices.forgotPassword(email)
        res.status(200).json({
            message:"reset instructions sent to email"
        })
        
    }catch(error){
        next(error)
    }
}

const resetPassword=async(req,res,next)=>{
    try{
        const {newpassword,token}=req.body;
        await authServices.resetPassword(newpassword,token)
        res.status(200).json({
            message:"Password reset successfully"
        })
    }catch(error){
        next(error)
    }
}

const refresh=async(req,res,next)=>{
    try{
        const token=req.cookies.refreshToken;
        const accessToken=await authServices.refresh(token)
        res.json({
            accessToken
        })
    }catch(error){
        next(error)
    }
}

const logout=async(req,res,next)=>{
    try{
        await authServices.logout(
            req.user.user_id,
            req.user.sessionId
        )
        res.clearCookie("refreshToken")
        res.json({
            message:"logout successful"
        })
    }catch(error){
        next(error)
    }
}

module.exports={register,resendVerification,verifyEmail,login,forgotPassword,resetPassword,refresh,logout}