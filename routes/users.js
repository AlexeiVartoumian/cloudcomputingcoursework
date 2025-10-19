const express = require('express')
const router =  express.Router();


const User = require("../models/User")


const UserService = require("../service/UserService")
const { authenticateJWT } = require('../middleware/auth');


router.get("/", authenticateJWT, async(req , res) => {
    
    try{
        const getFilms = await User.find().limit(10)
        
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
    
    //PostService = new PostService()
    const id = req.params.id;
    console.log(id)
    try{
        const getFilms = await User.findById(req.params.id)
        
        res.send(getFilms)
    }catch(err){
        res.send( {message:err + "oops" })
    }
})



module.exports = router


