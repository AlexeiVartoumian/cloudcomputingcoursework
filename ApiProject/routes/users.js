const express = require('express')
const router =  express.Router();


const User = require("../models/User")


const UserService = require("../service/UserService")
const { authenticateJWT } = require('../middleware/auth');


router.get("/", authenticateJWT, async(req , res) => {
    
    try{
        const users = await User.find().limit(10)
        
        res.status(200).json({ 
            success: true, 
            users 
        });
    }catch(err){
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
})




router.get("/:id", async(req , res) => {
    
    
    const id = req.params.id;
    console.log(id)
    try{
        
        
        const user = await UserService.getUserById(req.params.id)
        
        res.status(200).json({ 
            success: true, 
            user 
        });
    }catch(err){
        res.send( {message:err + "oops" })
    }
})



module.exports = router


