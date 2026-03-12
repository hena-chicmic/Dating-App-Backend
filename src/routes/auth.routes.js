const express=require('express')
const router=express.Router()

const {register,resendVerification,verifyEmail,login,forgotPassword,resetPassword,refresh,logout}=
require('../controllers/auth.controller')

router.post('/register', register)
router.post('/verify-email', verifyEmail)
router.post('/resend-verification', resendVerification)

router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', logout)

router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)


module.exports=router