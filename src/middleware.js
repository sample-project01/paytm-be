const jwt = require("jsonwebtoken")

require("dotenv").config()

module.exports=authMiddleware=(req,res,next)=>{
    // console.log(req.headers)
    // console.log(req.cookies)
    const Realtoken= req.cookies.PayTM
    // if(!header || !header.startsWith("Bearer ")){
    //     return res.json({
    //         success:false,
    //         msg:"token missing"
    //     })
    // }

    
    // const token = header.split(" ")[1]

    try {
        const decoded = jwt.verify(Realtoken,process.env.JWT_SECRET)

        if(!decoded){
            return res.json({
                success:false,
                msg:"token is tempered"
            })
        }
        req.userId= decoded.userId
        // console.log("before next")
        next()
        
    } catch (error) {
        console.log(error)
        // console.log("middleware")
        res.json({
            error:"error"
        })
        
    }


}