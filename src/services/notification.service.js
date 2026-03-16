const notificationRepository=require('../repositories/notification.repository')

const getNotifications=async(userId,notification_id)=>{
    return await notificationRepository.getNotifications(userId,notification_id)
}

const markRead=async(userId,notification_id)=>{
    return await notificationRepository.markRead(userId,notification_id)
}

const markAllRead=async(userId)=>{
    return await notificationRepository.markAllRead(userId)
}

const createNotifications=async(userId,type,reference_id,message)=>{
    return await notificationRepository.createNotifications(userId)
}


module.exports={
    getNotifications,
    markRead,
    markAllRead
}