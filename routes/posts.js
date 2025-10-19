const express = require('express')
const router =  express.Router();



const Film = require("../models/Film")

const Post = require("../models/Post")


const PostService = require("../service/PostService")
const { authenticateJWT } = require('../middleware/auth');

router.get("/test", async(req , res) => {

    try{
        const getFilms = await Post.find().limit(10)
        res.send(getFilms)
    }catch(err){
        res.send( {message:err + "oops" })
    }
})


//https://expressjs.com/en/guide/error-handling.html

router.post("/post" , authenticateJWT, async(req, res) => {
    
    try{
        payload = { title : req.body.title, topic : req.body.topic, body : req.body.message, expirationMinutes : 60 }
        
        const post = await PostService.createPost(req.body.user_id, payload)
         res.status(201).json({ 
            success: true, 
            post 
        });
    } catch (error){
        res.status(400).json({
            success: false,
            error:message
        })
    }
})
router.patch("/:id/like" , authenticateJWT,async(req, res) => {

    try {
        const like = await PostService.likePost(req.params.id , req.body.user_id)
        res.status(200).json({
            success:true,
            like
        })
    } catch(error){
        res.status(400).json({
            success: false,
            error:message
        })
    }
})
router.patch("/:id/dislike" , authenticateJWT,async(req, res) => {

    try {
        const like = await PostService.dislikePost(req.params.id , req.body.user_id)
        res.status(200).json({
            success:true,
            like
        })
    } catch(error){
        res.status(400).json({
            success: false,
            error:message
        })
    }
})

router.patch("/:id/addcomment" , authenticateJWT,async(req, res) => {
    
    try {   
        
        const comment = await PostService.addComment(req.params.id , req.body.user_id , req.body.message)
        
        
        res.status(200).json({
            success:true,
            comment
        })
    }catch(error){
         res.status(400).json({
            success: false,
            error:message
        })
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