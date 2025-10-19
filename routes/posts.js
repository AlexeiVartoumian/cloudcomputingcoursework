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

router.post("/" , authenticateJWT, async(req, res) => {
    
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
        const post = await PostService.likePost(req.params.id , req.body.user_id)
        res.status(200).json({
            success:true,
            post: {
                id: post._id,
                likesCount: post.likesCount,
                dislikesCount: post.dislikesCount,
                status: post.status,
                timeLeft: post.timeLeftFormatted
            }
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
        const post = await PostService.dislikePost(req.params.id , req.body.user_id)
        res.status(200).json({
            success:true,
            post: {
                id: post._id,
                likesCount: post.likesCount,
                dislikesCount: post.dislikesCount,
                status: post.status,
                timeLeft: post.timeLeftFormatted
            }
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
        
        const post = await PostService.addComment(req.params.id , req.body.user_id , req.body.message)
        
        
        res.status(200).json({
            success:true,
            post: {
                id: post._id,
                commentsCount: post.commentsCount,
                status: post.status,
                timeLeft: post.timeLeftFormatted
            }
        })
    } catch(error){
         res.status(400).json({
            success: false,
            error:message
        })
    }
})



router.get("/:id",authenticateJWT, async(req , res) => {
    
    
   
    try{
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ 
                success: false, 
                error: 'Post not found' 
            });
        }
        res.json({ success: true, post });
    } catch(error){
         res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
})

router.get("/topic/:topic", authenticateJWT, async (req, res) => {
    try {
        const posts = await PostService.getPostsByTopic(req.params.topic);
        res.status(200).json({ 
            success: true, 
            count: posts.length,
            posts 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

router.get("/topic/:topic/most-active", authenticateJWT, async (req, res) => {
    try {
        const post = await PostService.getMostActivePost(req.params.topic);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'No active posts found for this topic'
            });
        }
        
        res.status(200).json({ 
            success: true, 
            post: {
                id: post._id,
                title: post.title,
                owner: post.owner,
                likesCount: post.likesCount,
                dislikesCount: post.dislikesCount,
                totalInterest: post.likesCount + post.dislikesCount,
                status: post.status,
                timeLeft: post.timeLeftFormatted
            }
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

router.get("/topic/:topic/expired", authenticateJWT, async (req, res) => {
    try {
        const posts = await PostService.getExpiredPostsByTopic(req.params.topic);
        res.status(200).json({ 
            success: true, 
            count: posts.length,
            posts 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});



module.exports = router   