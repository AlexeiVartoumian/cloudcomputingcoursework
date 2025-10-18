const express = require('express')
const router =  express.Router();


const User = require("../models/User")


const UserService = require("../service/UserService")


router.get("/", async(req , res) => {
    
    try{
        const getFilms = await User.find().limit(10)
        console.log(getFilms)
        res.send(getFilms)
    }catch(err){
        res.send( {message:err + "oops" })
    }
})

router.post("/" , async(req, res) => {
   
    try{
        payload = { name : req.body.name, email : req.body.email, password: req.body.password}

        const userToSave = await UserService.createUser(payload)
        
         res.status(201).json({ 
            success: true, 
            userToSave 
        });
    }catch(err){
        thing = console.log(req.body.name)
        res.send({message:err, thing})
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


