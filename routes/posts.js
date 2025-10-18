const express = require('express')
const router =  express.Router();



const Film = require("../models/Film")

const Post = require("../models/Post")
const User = require("../models/User")


const PostService = require("../service/PostService")


router.get("/test", async(req , res) => {

    try{
        const getFilms = await Post.find().limit(10)
        res.send(getFilms)
    }catch(err){
        res.send( {message:err + "oops" })
    }
})

//TODO add validation on body . add middleware . 


router.post("/post" , async(req, res) => {
    
    try{
        payload = { title : req.body.title, topic : req.body.topic, body : req.body.message, expirationMinutes : 60 }
        
        const post = await PostService.createPost(req.body.user_id, payload)
         res.status(201).json({ 
            success: true, 
            post 
        });
    }catch (err){
        res.send({message: err})
    }
})
router.patch("/:id/like" , async(req, res) => {

    try {
        const like = await PostService.likePost(req.params.id , req.body.user_id)
        res.status(200).json({
            success:true,
            like
        })
    }catch(error){
        res.send( {message: error})
    }
})
router.patch("/:id/dislike" , async(req, res) => {

    try {
        const like = await PostService.dislikePost(req.params.id , req.body.user_id)
        res.status(200).json({
            success:true,
            like
        })
    }catch(error){
        res.send( {message: error})
    }
})

router.patch("/:id/addcomment" , async(req, res) => {
    console.log("this should worl")
    try {   //(postId, userId , body)
        console.log("we are here")
        const comment = await PostService.addComment(req.params.id , req.body.user_id , req.body.message)
        console.log(comment)
        
        res.status(200).json({
            success:true,
            comment
        })
    }catch(error){
        res.send( {message: error})
    }
})



router.get("/:id", async(req , res) => {
    
    //PostService = new PostService()
    const id = req.params.id;
    console.log(id)
    try{
        const getFilms = await Post.findById(req.params.id)
        const ok = await Post.find().limit(10)
    
        res.send(getFilms)
    }catch(err){
        res.send( {message:err + "oops" })
    }
})



module.exports = router   