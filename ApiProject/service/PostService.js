const Post = require("../models/Post");

//https://www.reddit.com/r/rails/comments/itivdn/where_did_concept_of_service_object_come_from/

//https://stackoverflow.com/questions/63218568/what-should-be-structure-of-service-layer-in-node-js

//https://medium.com/better-programming/to-throw-or-not-to-throw-error-propagation-in-js-and-ts-68aaabe30e30
class PostService {

    //making cals to db need async keyword
    async createPost(userId, { title, topic, body, expirationMinutes = 60 }) {

        try{
            console.log('=== CREATE POST DEBUG ===');
        console.log('expirationMinutes received:', expirationMinutes);
        console.log('Current Date.now():', Date.now());
        console.log('Milliseconds to add:', expirationMinutes * 60 * 1000);
        
        const expirationDate = new Date(Date.now() + expirationMinutes * 60 * 1000);
        console.log('Calculated expiration date:', expirationDate);
        console.log('Current date for comparison:', new Date());
            const post = new Post({
                title,
                topic,
                body,
                owner: userId,
                expiration: new Date(Date.now() + expirationMinutes * 60 * 1000)
            });
            
            await post.save();
            return post; 
        } catch (error){
            throw error;
        }
     }

     async addComment(postId, userId , body) {
        
        try{
            const post = await Post.findById(postId)
           
            post.comments.push({  user : userId, timestamp: Date.now(), comment: body })
            await post.save()
            return post
        } catch (error){
            throw error;
        }
     }
    
     async likePost(postId, userId) {

        const post = await Post.findById(postId)
        if (!post) {
            throw new Error('Post not found');
        }

        if (post.status == "Expired"){
            throw new Error('Cannot interact with expired post');
        } 

        if (post.owner == userId) {
            throw new Error('Cannot like own post')
        }

        //https://www.w3schools.com/jsref/jsref_filter.asp use predicate to filter existing id 
        post.dislikes = post.dislikes.filter(id => !id.equals(userId));
        
        if (!post.likes.some(id => id.equals(userId))) {
            post.likes.push(userId);
        }

        await post.save()
        
        return post

    }
    async dislikePost(postId, userId) {

        const post = await Post.findById(postId)
        if (!post) {
            throw new Error('Post not found');
        }

        console.log('Post expiration:', post.expiration);
        console.log('Current time:', new Date());
        console.log('Status:', post.status); 
        if (post.status == "Expired"){
            throw new Error('Cannot interact with expired post');
        } 

        if (post.owner == userId) {
            throw new Error('Cannot dislike own post')
        }

        //https://www.w3schools.com/jsref/jsref_filter.asp use predicate to filter existing id 
        post.likes = post.likes.filter(id => !id.equals(userId));
        
        if (!post.dislikes.some(id => id.equals(userId))) {
            post.dislikes.push(userId);
            
        }
        await post.save()
        
        return post
     }

    async getPostsByTopic(topic) {
        try {
            const posts = await Post.find({ topic: topic })
                .populate('owner', 'name email')
                .populate('comments.user', 'name')
                .sort({ timestamp: -1 });
            
            return posts;
        } catch (error) {
            throw error;
        }
    }
    async getMostActivePost(topic) {
        try {
            const posts = await Post.find({
                topic,
                expiration: { $gt: new Date() }
            })
                .populate('owner', 'name email')
                .populate('comments.user', 'name')
            
            if (posts.length === 0) {
                return null;
            }
            
            
            const mostActive = posts.reduce((max, post) => {
                const interest = post.likes.length + post.dislikes.length;
                const maxInterest = max.likes.length + max.dislikes.length;
                return interest > maxInterest ? post : max;
            });
            
            return mostActive;
        } catch (error) {
            throw error;
        }
    }
    async getExpiredPostsByTopic(topic) {
        try {
            const posts = await Post.find({
                topic,
                expiration: { $lt: new Date() }  
            })
                .populate('owner', 'name email')
                .populate('comments.user', 'name')
                .sort({ expiration: -1 }); 
            
            return posts;
        } catch (error) {
            throw error;
        }
    }

     
   
}


module.exports = new PostService()




