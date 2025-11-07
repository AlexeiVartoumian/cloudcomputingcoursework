const express = require('express')
const router =  express.Router();





const Post = require("../models/Post")


const PostService = require("../service/PostService")
const { authenticateJWT } = require('../middleware/auth');



router.get("/" , authenticateJWT , async(req , res) => {
    try{
        const posts = await Post.find().limit(10)
        
        res.status(200).json({ 
            success: true, 
            posts 
        });
    }catch(err){
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
})

 


//https://expressjs.com/en/guide/error-handling.html

router.post("/" , authenticateJWT, async(req, res) => {
    
    try{
        console.log('=== ROUTER POST DEBUG ===');
        console.log('req.body:', req.body);
        console.log('req.body.expirationMinutes:', req.body.expirationMinutes);
        const topicArray = Array.isArray(req.body.topic) 
            ? req.body.topic 
            : [req.body.topic];
        const expirationMinutes = req.body.expirationMinutes || 60;
        payload = { title : req.body.title, topic : topicArray, body : req.body.message, expirationMinutes  }
        
        const post = await PostService.createPost(req.user.id, payload)
         res.status(201).json({ 
            success: true, 
            post 
        });
    } catch (error){
        res.status(400).json({
            success: false,
            error: error.message
        })
    }
})
router.patch("/:id/like" , authenticateJWT, async(req, res) => {

    try {
        const post = await PostService.likePost(req.params.id , req.user.id)
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
            error: error.message
        })
    }
})
router.patch("/:id/dislike" , authenticateJWT,async(req, res) => {

    try {
        const post = await PostService.dislikePost(req.params.id , req.user.id)
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
            error: error.message
        })
    }
})

router.patch("/:id/addcomment" , authenticateJWT,async(req, res) => {
    
    try {   
        
        const post = await PostService.addComment(req.params.id ,req.user.id , req.body.message)
        
        
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
            error: error.message
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
            post: post
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