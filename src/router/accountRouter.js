const express = require("express")
const {Account} = require("../../db")
const z = require("zod")
const mongoose = require("mongoose")




const router= express.Router()

// const amountSchema= z.
router.get("/get-amount",async(req,res)=>{
   
   try {
     const balance = await Account.findOne({
         userId:req.userId
     })
     

     if(!balance){
        return res.json({
            success:false,
            msg:"try again"
        })
     }

    res.json({
        success:true,
        amount:balance.amount,
    })
     
   } catch (error) {
    console.log("inside catch")
    console.log(error.message)
    res.json({
        success:false,
        msg:error.message
    })
    
   }

})


const transferSchema= z.object({
    toUserId:z.string(),
    amount:z.string()
})

router.post("/transfer", async (req, res) => {
    console.log(req.body)
    const { success } = transferSchema.safeParse(req.body);
    if (!success) {
        return res.json({
            success: false,  
            msg: "invalid request"
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { amount, toUserId } = req.body;

        // Check sender account and balance
        const senderData = await Account.findOne({
            userId: req.userId
        }).session(session);

        if (!senderData || senderData.balance < amount) {
            await session.abortTransaction();
            return res.json({
                success: false,
                msg: "insufficient Balance"
            });
        }

        // Check receiver account exists - FIXED: Added userId filter
        const receiverData = await Account.findOne({
            userId: new mongoose.Types.ObjectId(toUserId)  
        }).session(session);

        console.log("reciever data......",receiverData)

        if (!receiverData) {
            await session.abortTransaction();
            return res.json({
                success: false,
                msg: "could not find receiver account"
            });
        }

        // Perform the transfer with proper options
        const sender = await Account.findOneAndUpdate(
            { userId: req.userId },
            { $inc: { balance: -amount } },
            { session, new: true }  // Added 'new: true' to get updated document
        );

        const receiver = await Account.findOneAndUpdate(
            { userId: toUserId },
            { $inc: { balance: amount } },
            { session, new: true }  // Added 'new: true' to get updated document
        );

        console.log("Updated sender:", sender);
        console.log("Updated receiver:", receiver);

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();
        
        res.json({
            success: true,
            msg: "payment successful"
        });

    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        session.endSession();  // Don't forget to end session on error
        
        res.json({
            success: false,
            msg: "transfer failed"
        });
    }
});







module.exports=router