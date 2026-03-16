const notificationService=require('../services/notification.service')


const getNotifications=async(req,res,next)=>{
    try{
        const userId=req.user.userId
       
        const notification=await notificationService.getNotifications(userId)
        res.status(200).json({
            success:true,
            notification

        })
    }catch(error){
        next(error)
    }
}

const markRead=async(req,res,next)=>{
    try{
        const userId=req.user.userId
        const notification_id=req.params
        const result=await notificationService.markRead(userId,notification_id)
        res.status(200).json({
            message:"notification marked as read"
        })
    }catch(error){
        next(error)
    }
}

const markAllRead=async(req,res,next)=>{
    try{
        const userId=req.user.userId
        const result=await notificationService.markAllRead(userId)
        res.status(200).json({
            message:"all notifications marked read"
        })
    }catch(error){
        next(error)
    }
}




module.exports={
    getNotifications,
    markRead,
    markAllRead
}