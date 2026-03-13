const express=require('express')
const router=express.Router()
const notificationController=require('../controllers/notification.controller')
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.get('/read',notificationController.getNotifications)
router.patch('/mark-read',notificationController.markRead)
router.patch('/mark-all-read',notificationController.markAllRead)


module.exports=router;
