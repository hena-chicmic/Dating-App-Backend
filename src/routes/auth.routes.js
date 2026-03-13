const express=require('express')
const router=express.Router()

const {register,resendVerification,verifyEmail,login,forgotPassword,resetPassword,refresh,logout,googleLogin}=
require('../controllers/auth.controller')
const isAuthenticated=require('../middleware/auth.middleware')

router.post('/register', register)
router.post('/verify-email', verifyEmail)
router.post('/resend-verification', resendVerification)
router.post('/google', googleLogin)

router.post('/login',isAuthenticated, login)
router.post('/refresh',isAuthenticated, refresh)
router.post('/logout',isAuthenticated, logout)

router.post('/forgot-password',isAuthenticated, forgotPassword)
router.post('/reset-password',isAuthenticated, resetPassword)


module.exports=router