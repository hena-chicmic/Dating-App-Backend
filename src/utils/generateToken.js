const jwt=require('jsonwebtoken')

const generateAccessToken=(payload)=>{
    return jwt.sign(
        payload,
        process.env.ACCESS_SECRET,
        {expiresIn:"15m"}
    )
}

const generateRefreshToken=(payload)=>{
    const uniquePayload = {
        ...payload,
        jti: require('crypto').randomUUID()
    };
    return jwt.sign(
        uniquePayload,
        process.env.REFRESH_SECRET,
        {expiresIn:"7d"}
    )
}

module.exports={
    generateAccessToken,
    generateRefreshToken
}