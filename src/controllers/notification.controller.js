const notificationService=require('../services/notification.service')

const getNotifications=async(req,res,next)=>{
    try{
        const userId=req.user.userId
        const notification_id=req.params
        const notification=await notificationService.getNotifications(notification_id)
        res.status(200).json({
            success:true,

        })
    }catch(error){
        next(error)
    }
}