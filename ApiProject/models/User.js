
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name:  {

        type: String,
        required: true,
        trim: true,
        minlength: [1, 'Name must be at least 1 character'],
        maxlength: [256, 'Name cannot exceed 256 characters']
    
    },
    email: {

        type: String,
        required: true,
        //https://stackoverflow.com/questions/1423195/what-is-the-actual-minimum-length-of-an-email-address-as-defined-by-the-ietf
        // min email is 3 for intranet but 6 for usecase.
        minlength: [6, 'Email must be at least 6 characters'],
        maxlength: [256, 'Email cannot exceed 256 characters'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Password must be at least 8 characters'],
        maxlength: [1024, 'Password cannot exceed 1024 characters'] 
    },
    date: {
        type: Date,
        default: Date.now,
        immutable: true
    }
});

userSchema.index({ email: 1 });
// Exclude password from all JSON responses (registration, profile, populated fields)
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema, 'User');
