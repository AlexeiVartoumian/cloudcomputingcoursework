const Post = require("../models/Post");

//https://www.reddit.com/r/rails/comments/itivdn/where_did_concept_of_service_object_come_from/

//https://stackoverflow.com/questions/63218568/what-should-be-structure-of-service-layer-in-node-js


class PostService {

    async createPost(userId, { title, topic, body, expirationMinutes = 60 }) {

        try{
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
            return error
        }
     }

     async addComment(postId, userId , body) {
        
        try{
            const post = await Post.findById(postId)
            // payload = {  userId : userId, timestamp: Date.now(), comment: body }
            // post.comments.push(payload)
        
            post.comments.push({  user : userId, timestamp: Date.now(), comment: body })
            await post.save()
            return post
        } catch (error){
            return error
        }
     }
    
     async likePost(postId, userId) {

        const post = await Post.findById(postId)
        if (!post) {
            throw new Error('Post not found');
        }

        if (post.status == "expired"){
            throw new Error('Cannot interact with expired post');
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

        if (post.status == "expired"){
            throw new Error('Cannot interact with expired post');
        } 

        //https://www.w3schools.com/jsref/jsref_filter.asp use predicate to filter existing id 
        post.likes = post.likes.filter(id => !id.equals(userId));
        console.log(post.likes)
        console.log(post.dislikes)
        if (!post.dislikes.some(id => id.equals(userId))) {
            post.dislikes.push(userId);
            
        }
        await post.save()
        
        return post
     }

     
   
}


module.exports = new PostService()




