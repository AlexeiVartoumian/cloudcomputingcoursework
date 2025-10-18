
const mongoose = require('mongoose');



// relations to Users are defined in key value db mongo with reference "ref: 'table to relate to '". 
// In this case Relations here are actions performed by a User such as liking , disliking or commenting on a post.  
const postSchema = new mongoose.Schema({
    
    title:      {   type: String, 
                    required: true },
    
    topic:      {   type: [String],     
                    required: true,
                    enum: ['Politics', 'Health', 'Sport', 'Tech'],
                    validate:{
                        validator: function(v){
                            return v && v.length > 0;
                        },
                        message: 'at least one topic is required'
                    }
                },
    
    timestamp:  {   type:Date, 
                    default: Date.now }, 
    
    body:       {   type: String, 
                    required: true,
                    maxlength: [400, 'message cannot exceed 400 characters']
                }, 
    //status of post will be computed on the fly using virtual computation
    expiration: {   type: Date, 
                    required: true },
    
    owner:      {   type: mongoose.Schema.Types.ObjectId, 
                    ref: 'User',
                    required: true }, 
    
    //likes dislikes and comments stored in list to determine numberof
    // requirement asks for timestamp which can be referenced from Parent Comment 
    likes:      [{ 
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: 'User'  } ], 
    
    dislikes:   [{  
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: 'User'  } ], 
    
    comments:   [{ 
    
                    user:      {    type: mongoose.Schema.Types.ObjectId, ref: 'User' , required: true}, 
                    timestamp: {    type: Date, default: Date.now } ,
                    comment:   {    type: String,
                                    required: true,
                                    maxlength: [400, 'Comment cannot exceed 400 characters']                                
                                }     
    }],
    
},
{
    collection: 'Posts',
    timestamps: true
  });

// Virtuals are Mongoose properties not stored in the database.they are computed on-the-fly and define how data is presented.
postSchema.virtual('status').get(function() {
    return new Date() > this.expiration ? 'Expired' : 'Live';
});


postSchema.virtual('likesCount').get(function() {
    return this.likes.length;
});

postSchema.virtual('dislikesCount').get(function() {
    return this.dislikes.length;
});

postSchema.virtual('commentsCount').get(function() {
    return this.comments.length;
});

postSchema.virtual('timeLeft').get(function() {
    const ms = this.expiration - new Date();
    return ms > 0 ? ms : 0;
});

postSchema.virtual('timeLeftFormatted').get(function() {
    const ms = this.timeLeft;
    if (ms <= 0) return 'Expired';
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
});
 
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });


module.exports = mongoose.model('Post', postSchema , 'Posts' );
