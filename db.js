const mongoose = require("mongoose")
require("dotenv").config()


async function conn(){

    await mongoose.connect(process.env.DB_URI)
    console.log("db is connected")
} 
conn()
const userSchema = new mongoose.Schema({
    firstName:{type:String, required:true},
    lastName:{type:String, required:true},
    userName:{type:String, required:true},
    password:{type:String, required:true},
})

const accountSchema= new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    amount:{type:Number}
})

const User = mongoose.model("User",userSchema)
const Account= mongoose.model("Account",accountSchema)


module.exports={
    User,
    Account
}