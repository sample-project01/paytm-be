const express = require("express")
const userRouter= require("./userRouter")
const accountRouter= require("./accountRouter")
const middleware = require("../middleware")


const router= express.Router()

// console.log("main Router")

router.use("/user",userRouter)
router.use("/account",middleware,accountRouter)






module.exports=router




