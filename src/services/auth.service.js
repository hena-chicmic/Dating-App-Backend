const crypto=require('crypto')

const db=require('../config/db')
const {hashPassword,comparePassword}=require('../utils/hash')
const {generateAccessToken,generateRefreshToken}=require('../utils/generateToken')



const register=async(data)=>{
    const {name,email,password}=data

    const existingUser=await db.query(
        'SELECT id from users where email=$1',
        [email]
    ) 
    if(existingUser.rows.length){
        throw new Error("user already exists!!")
    }
    const hashedPassword=hashPassword(password)
    
    const result = await db.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1,$2,$3)
         RETURNING id,name,email`,
        [name, email, hashedPassword]
    )

    const user = result.rows[0]

    const otp = Math.floor(100000 + Math.random() * 900000)

    await db.query(
        `INSERT INTO email_verifications (user_id, OTPtoken)
         VALUES ($1,$2)`,
        [user.id, otp]
    )

    console.log("Verification OTP:", otp)

    const accessToken = generateAccessToken({
        user_id: user.id
    })

    const refreshToken = generateRefreshToken({
        user_id: user.id
    })

    return {
        user,
        accessToken,
        refreshToken
    }
}

const verifyEmail = async (userId, OTPtoken) => {

    
    const result = await db.query(
        `SELECT * FROM email_verifications
         WHERE user_id=$1`,
        [userId]
    )

    if (!result.rows.length) {
        throw new Error("Verification record not found")
    }

    const record = result.rows[0]

    
    if (record.OTPtoken != OTPtoken) {
        throw new Error("Invalid OTP")
    }

    
    const now = new Date()

    if (now > record.expires_at) {
        throw new Error("OTP expired")
    }

    
    await db.query(
        `UPDATE users
         SET is_verified = TRUE
         WHERE id = $1`,
        [userId]
    )

    
    await db.query(
        `DELETE FROM email_verifications
         WHERE user_id=$1`,
        [userId]
    )
    return true
}



const resendVerification = async (userId) => {


    const userResult = await db.query(
        `SELECT id, is_verified FROM users WHERE id=$1`,
        [userId]
    )

    if(!userResult.rows.length){
        throw new Error("User not found")
    }

    const user = userResult.rows[0]

    
    if(user.is_verified){
        throw new Error("Email already verified")
    }

    
    const otp = Math.floor(100000 + Math.random() * 900000)

    
    await db.query(
        `UPDATE email_verifications
         SET OTPtoken=$1,
             expires_at = NOW() + INTERVAL '15 minutes',
             created_at = NOW()
         WHERE user_id=$2`,
        [otp, userId]
    )

    
    console.log("New verification OTP:", otp)

    return true
}

const login = async (data) => {

    const { email, password } = data

    const result = await db.query(
        `SELECT id,name,email,password_hash,is_verified
         FROM users
         WHERE email=$1`,
        [email]
    )

    if(!result.rows.length){
        throw new Error("Invalid email or password")
    }

    const user = result.rows[0]

    const match = await comparePassword(password, user.password_hash)

    if(!match){
        throw new Error("Invalid email or password")
    }

    const accessToken = generateAccessToken({
        user_id: user.id
    })

    const refreshToken = generateRefreshToken({
        user_id: user.id
    })

    return {
        user,
        accessToken,
        refreshToken
    }
}

const forgotPassword = async (email) => {

    const result = await db.query(
        `SELECT id FROM users WHERE email=$1`,
        [email]
    )

    if(!result.rows.length){
        return new Error("Invalid email")
    }

    const user = result.rows[0]

    const otp = Math.floor(100000 + Math.random() * 900000)
    //reset table not present
    await db.query(
        `INSERT INTO email_verifications(user_id, otp_token)
         VALUES($1,$2)
         ON CONFLICT (user_id)
         DO UPDATE SET
            otp_token=$2,
            expires_at=NOW()+INTERVAL '15 minutes'`,
        [user.id, otp]
    )

    console.log("Reset OTP:", otp)
}







    


                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 


