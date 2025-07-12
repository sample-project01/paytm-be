const express = require("express")
const {User} = require("../../db")
const z = require("zod")
const bcrypt= require("bcrypt")
const jwt = require("jsonwebtoken")
const middleware = require("../middleware")
const {Account}= require("../../db")

require("dotenv").config()






const router= express.Router()

const signupSchema=z.object({
    firstName:z.string(),
    lastName:z.string(),
    userName:z.string(),
    password:z.string()
})


router.post("/signup",async(req,res)=>{
    req.body.userName= req.body.email
    try {

        const {success}= signupSchema.safeParse(req.body)

        if(!success){
            return res.json({
                success:false,
                msg:"invalid Credentials"
            })
        }

        
        const existedUser = await User.findOne({
            userName:req.body.userName
        })

        // console.log(existedUser)


        if(existedUser){
            return res.json({
                success:false,
                msg:"user already existed"
            })

        }
        const hashedPass=  await bcrypt.hash(req.body.password,10)

        const newUser= await User.create({
            userName:req.body.userName,
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            password:hashedPass
        })
        await Account.create({
            userId:newUser._id,
            balance:10000
        })
       
        res.json({
            success:true,
            msg:"user created successfully",
            newUser
        })
        
    } catch (error) {
        console.log(error)
        res.json({
            success:false,
            msg:error.message
        })
        
    }


})
const signinSchema= z.object({
    userName:z.string(),
    password:z.string()
})
router.post("/signin",async(req,res)=>{
    req.body.userName= req.body.email
    
    const{success}= signinSchema.safeParse(req.body)
    if(!success){
        return res.json({
            success:false,
            msg:"invalid credentials"
        })
    }
    const checkUser= await User.findOne({
        userName:req.body.userName
    })
    if(!checkUser._id){
        return res.json({
            success:false,
            msg:"pls sign in first"
        })
    }
    const hashedPass= await bcrypt.compare(req.body.password,checkUser.password)

    if(!hashedPass){
         return res.json({
            success:false,
            msg:"password is incorrect"
        })

    }
    const token = jwt.sign({
        userId:checkUser._id
    },process.env.JWT_SECRET)

    res.cookie("PayTM",token).json({
        success:true,
        msg:"user logged in"
    })

})


router.get("/bulk",async(req,res)=>{
    const filter= req.query.filter || ""

    const users= await  User.find({
        $or:[{
                firstName:{
                    "$regex":filter
                }
            },
            {
                lastName:{
                     "$regex":filter
                }
            }]
    })

    res.json({
        user:users.map(user=>({
            userName:user.userName,
            firstName:user.firstName,
            lastName:user.lastName,
            _id:user._id
        }))

    })
})

router.post("/get-name",async(req,res)=>{
   try {
    
    const{toUserId}= req.body
    const user= await User.findById(toUserId)
 
     res.json({
         success:true,
         name:user.firstName+" "+ user.lastName
     })
 
   } catch (error) {
    console.log("get-name api error", error)
    res.json({
        success:false
    })
    
   }
})


const updateBodySchema= z.object({
    password:z.string().optional(),
    firstName:z.string().optional(),
    lastName:z.string().optional(),
})
router.put("/",middleware,async (req,res)=>{

    const{success}= updateBodySchema.safeParse(req.body)

    if(!success){
        throw new Error("invalid credentials")
    }

    await User.updateOne({_id:req.userId},req.body)

    res.json({
        success:true,
        msg:"user updated succesfully"
    })


})




module.exports= router