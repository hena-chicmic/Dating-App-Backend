const jwt=require("jsonwebtoken")

const verifyToken=(token,secret)=>{
    return jwt.verify(token,secret)
}

module.exports={verifyToken}