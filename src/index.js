const express = require("express")
const cors= require("cors")
const router = require("./router/router")
const middleware = require("./middleware")
const cookieParser= require("cookie-parser")
require("dotenv").config()

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin:process.env.FE_BASE_URL,
    credentials:true
}))

app.use("/api/v1",router)

app.get("/",middleware,(req,res)=>{
    res.send("welcome to dashboard")
})




app.listen(3000,()=>{
    console.log("server is up")
})